import { Particle, physicsLoop } from "./physics";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
canvas.width = 400;
canvas.height = 400;

const image = new Image();
image.src = "./img.png";

const radius = 8;
const particlesNeeded = 700;
const particles: Particle[] = [];
let speed = 1;
let frameCount = 0;
let colors: string[] = [];

document.getElementById("slider")?.addEventListener("input", (e) => {
	speed = parseInt((e.target as HTMLInputElement).value);
});

function spawnParticle() {
	const x = canvas.width / 2;
	const y = 5;
	const offsetX = 0.5;
	const particle = new Particle(radius, particles.length, x, y, offsetX);
	particles.push(particle);
}

function update(dt: number) {
	// Spawn a particle every X frames
	if (particles.length < particlesNeeded && frameCount % 10 === 0) {
		spawnParticle();
	} else if (particlesNeeded * 10 + 300 < frameCount) {
		console.log("DONE");

		if (colors.length > 0) {
			return false;
		}

		// Get the color of the image for each particle
		const newCanvas = document.createElement("canvas");
		newCanvas.width = canvas.width;
		newCanvas.height = canvas.height;

		const ctx = newCanvas.getContext("2d", { willReadFrequently: true })!;
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

		for (let i = 0; i < particles.length; i++) {
			const imageData = ctx.getImageData(
				particles[i].pos.x,
				particles[i].pos.y,
				1,
				1,
			).data;
			const r = imageData[0];
			const g = imageData[1];
			const b = imageData[2];
			colors[i] = `rgb(${r}, ${g}, ${b})`;
		}

		particles.length = 0;
		frameCount = 0;

		return true;
	}

	frameCount++;

	physicsLoop(particles, dt, canvas);

	return true;
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (const particle of particles) {
		particle.draw(ctx, colors);
	}
}

const DT = 1 / 60;
function loop() {
	for (let i = 0; i < speed; i++) {
		if (!update(DT / 2)) return;
	}

	draw();

	setTimeout(loop, DT * 1000);
}

loop();
