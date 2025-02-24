# Verlet Particle Image Renderer

## Overview
This project takes an input image and uses Verlet integration to simulate particles falling into their precomputed final positions. The positions are determined before the simulation starts, allowing each particle to be assigned its correct color in advance. As the simulation runs, the image naturally "paints" itself over time.

## Demo
[Insert demo video or GIF here]

## How It Works
1. **Image Upload**: The user uploads an image.
2. **Precompute Final Positions**: Using Verlet integration, the final resting positions of particles are calculated before the simulation begins.
3. **Assign Colors**: Each particle is assigned the color corresponding to its final resting position in the image.
4. **Run Simulation**: Particles fall and interact naturally, gradually forming the original image as they settle.

## Installation
```sh
# Clone the repository
git clone https://github.com/programordie2/Verlet-Image-Renderer.git
cd Verlet-Image-Renderer

# Install dependencies
bun install  # or npm install
```

## Usage
```sh
# Start the project
bun start  # or npm start
```

1. Upload an image via the interface.
2. Watch as particles fall and reconstruct the image.

## Technologies Used
- **TypeScript** for simulation logic
- **HTML5 Canvas** for rendering
- **Verlet Integration** for physics-based movement

## Contributing
Pull requests are welcome! If you find a bug or have a feature request, open an issue.

## License
[MIT License](LICENSE)
