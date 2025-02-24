import { Particle, physicsLoop } from "./physics";

const RADIUS = 8;
const PARTICLES_NEEDED = 700;

const file = document.getElementById("file") as HTMLDivElement;
const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const speedSlider = document.getElementById("slider") as HTMLInputElement;
const speedDesc = document.getElementById("speedDesc") as HTMLHeadingElement;
const stateElement = document.getElementById("state") as HTMLHeadingElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
canvas.width = 400;
canvas.height = 400;

speedSlider.value = "1";
speedSlider.style.display = "none";
speedDesc.style.display = "none";
canvas.style.display = "none";

function setState(text: string) {
	stateElement.innerText = text;
}

fileInput.addEventListener("change", () => {
	if (fileInput.files && fileInput.files.length > 0) {
		const image = new Image();
		image.src = URL.createObjectURL(fileInput.files[0]);
		image.onload = () => {
			URL.revokeObjectURL(image.src);

			file.style.display = "none";
			canvas.style.display = "block";

			runSim(image);
		};
	}
});

function runSim(image: HTMLImageElement) {
	const particles: Particle[] = [];
	const colors: string[] = [];
	let speed = 1000;
	let frameCount = 0;

	function spawnParticle() {
		const x = canvas.width / 2;
		const y = 5;
		const offsetX = 0.5;
		const particle = new Particle(RADIUS, particles.length, x, y, offsetX);
		particles.push(particle);
	}

	function update(dt: number) {
		// Spawn a particle every X frames
		if (particles.length < PARTICLES_NEEDED && frameCount % 10 === 0) {
			spawnParticle();
		} else if (PARTICLES_NEEDED * 10 + 300 < frameCount) {
			console.log("DONE");

			if (colors.length > 0) {
				setState("Done!");
				return false;
			}

			setState("Processing colors...");

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
			speed = 1;

			speedDesc.style.display = "block";
			speedSlider.style.display = "block";
			speedSlider.addEventListener("input", (e) => {
				speed = parseInt((e.target as HTMLInputElement).value);
			});

			setState("Generating image...");

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
			if (!update(DT / 1.5)) return;
		}

		draw();

		setTimeout(loop, DT * 1000);
	}

	setState("Calculating positions...");
	loop();
}
