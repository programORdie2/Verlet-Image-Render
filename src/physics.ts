class Vector {
	constructor(public x: number, public y: number) {}

	add(v: Vector): Vector {
		return new Vector(this.x + v.x, this.y + v.y);
	}

	sub(v: Vector): Vector {
		return new Vector(this.x - v.x, this.y - v.y);
	}

	scale(s: number): Vector {
		return new Vector(this.x * s, this.y * s);
	}

	length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	normalize(): Vector {
		const len = this.length();
		return len === 0 ? new Vector(0, 0) : this.scale(1 / len);
	}
}

export class Particle {
	id: number;
	pos: Vector;
	prev: Vector;
	acceleration: Vector = new Vector(0, 0);

	constructor(
		public radius: number,
		id: number,
		x: number,
		y: number,
		initialVX: number,
	) {
		this.id = id;
		this.pos = new Vector(x, y);
		this.prev = new Vector(x - initialVX, y - 10); // Initial velocity applied deterministically
	}

	update(dt: number) {
		const velocity = this.pos.sub(this.prev).scale(0.99);
		this.prev = this.pos;
		this.pos = this.pos.add(velocity).add(this.acceleration.scale(dt * dt));
		this.acceleration = new Vector(0, 0);
	}

	applyForce(force: Vector) {
		this.acceleration = this.acceleration.add(force);
	}

	constrain(width: number, height: number) {
		if (this.pos.y + this.radius > height) {
			this.pos.y = height - this.radius;
			this.prev.y = this.pos.y + (this.pos.y - this.prev.y) * -0.7;
		}
		if (this.pos.x - this.radius < 0) {
			this.pos.x = this.radius;
			this.prev.x = this.pos.x + (this.pos.x - this.prev.x) * -0.7;
		}
		if (this.pos.x + this.radius > width) {
			this.pos.x = width - this.radius;
			this.prev.x = this.pos.x + (this.pos.x - this.prev.x) * -0.7;
		}
	}

	draw(ctx: CanvasRenderingContext2D, colors: string[]) {
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
		ctx.fillStyle = colors[this.id] || `hsl(${this.id / 2}, 50%, 50%)`;
		ctx.fill();
	}
}

function resolveCollision(p1: Particle, p2: Particle) {
	const dx = p2.pos.x - p1.pos.x;
	const dy = p2.pos.y - p1.pos.y;
	const dist = Math.sqrt(dx * dx + dy * dy);
	const minDist = p1.radius + p2.radius;

	if (dist < minDist && dist !== 0) {
		const overlap = minDist - dist;
		const nx = dx / dist;
		const ny = dy / dist;

		// Apply positional correction smoothly
		const correction = overlap * 0.5;
		p1.pos.x -= nx * correction;
		p1.pos.y -= ny * correction;
		p2.pos.x += nx * correction;
		p2.pos.y += ny * correction;

		// Apply velocity correction (reduce bouncing)
		const relVel = p2.prev.sub(p1.prev);
		const impact = relVel.x * nx + relVel.y * ny;
		const restitution = 0.8; // Controls bounciness
		if (impact > 0) return;

		const impulse = impact * restitution;
		p1.prev = p1.prev.add(new Vector(nx * impulse, ny * impulse));
		p2.prev = p2.prev.sub(new Vector(nx * impulse, ny * impulse));
	}
}

function getCellKey(x: number, y: number): string {
	return `${Math.floor(x / cellSize)},${Math.floor(y / cellSize)}`;
}

function updateSpatialGrid(particles: Particle[]) {
	spatialGrid.clear();

	for (const particle of particles) {
		const key = getCellKey(particle.pos.x, particle.pos.y);

		if (!spatialGrid.has(key)) {
			spatialGrid.set(key, []);
		}

		spatialGrid.get(key)!.push(particle);
	}
}

function resolveCollisions() {
	for (const [key, cellParticles] of spatialGrid.entries()) {
		const [cellX, cellY] = key.split(",").map(Number);
		const neighboringCells = [
			[cellX, cellY],
			[cellX + 1, cellY],
			[cellX, cellY + 1],
			[cellX + 1, cellY + 1],
		]; // Only check necessary neighbors

		for (const [nx, ny] of neighboringCells) {
			const neighborKey = `${nx},${ny}`;
			if (!spatialGrid.has(neighborKey)) continue;

			const neighborParticles = spatialGrid.get(neighborKey)!;
			for (let i = 0; i < cellParticles.length; i++) {
				for (let j = 0; j < neighborParticles.length; j++) {
					if (i !== j) {
						resolveCollision(cellParticles[i], neighborParticles[j]);
					}
				}
			}
		}
	}
}

const cellSize = 80; // Adjust based on particle size
const spatialGrid: Map<string, Particle[]> = new Map();

const gravity = new Vector(0, 600);

export function physicsLoop(
	particles: Particle[],
	dt: number,
	canvas: HTMLCanvasElement,
) {
	for (const particle of particles) {
		particle.applyForce(gravity);
		particle.update(dt);
		particle.constrain(canvas.width, canvas.height);
	}

	updateSpatialGrid(particles);
	let start = performance.now();
	for (let i = 0; i < 2; i++) {
		resolveCollisions();
	}

	const cTime = performance.now() - start;

	return { cTime };
}
