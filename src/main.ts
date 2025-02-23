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

class Particle {
	pos: Vector;
	prev: Vector;
	acceleration: Vector = new Vector(0, 0);

	constructor(
		public radius: number,
		public color: string,
		x: number,
		y: number,
		initialVX: number,
	) {
		this.pos = new Vector(x, y);
		this.prev = new Vector(x - initialVX, y); // Initial velocity applied deterministically
	}

	update(dt: number) {
		const temp = new Vector(this.pos.x, this.pos.y);
		let velocity = this.pos.sub(this.prev).scale(0.99);
		this.pos = this.pos.add(velocity).add(this.acceleration.scale(dt * dt));
		this.prev = temp;
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

	draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
		ctx.fillStyle = this.color;
		ctx.fill();
	}
}

function resolveCollision(p1: Particle, p2: Particle) {
	const dx = p2.pos.x - p1.pos.x;
	const dy = p2.pos.y - p1.pos.y;
	const dist = Math.sqrt(dx * dx + dy * dy);
	const minDist = p1.radius + p2.radius;

	if (dist < minDist && dist !== 0) {
		const overlap = (minDist - dist) / 2;
		const nx = dx / dist;
		const ny = dy / dist;

		p1.pos.x -= nx * overlap;
		p1.pos.y -= ny * overlap;
		p2.pos.x += nx * overlap;
		p2.pos.y += ny * overlap;
	}
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
canvas.width = 400;
canvas.height = 400;

const particles: Particle[] = [];
const gravity = new Vector(0, 500);
let frameCount = 0;

function spawnParticle() {
	const x = canvas.width / 2;
	const y = 20;
	const radius = 8;
	const offset = -3;
	const particle = new Particle(radius, "blue", x, y, offset);
	particles.push(particle);
}

function update(dt: number) {
	// Spawn a particle every 6 frames (assuming 60 FPS)
	if (particles.length < 50 && frameCount % 6 === 0) {
		spawnParticle();
	}
	frameCount++;

	for (const particle of particles) {
		particle.applyForce(gravity);
		particle.update(dt);
		particle.constrain(canvas.width, canvas.height);
	}

	for (let i = 0; i < particles.length; i++) {
		for (let j = i + 1; j < particles.length; j++) {
			resolveCollision(particles[i], particles[j]);
		}
	}
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (const particle of particles) {
		particle.draw(ctx);
	}
}

const DT = 1 / 60;
function loop() {
	update(DT);
	draw();

	requestAnimationFrame(loop);
}

loop();
