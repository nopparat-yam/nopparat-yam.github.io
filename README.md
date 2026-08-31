# Interactive Snell's Law Simulator

An interactive learning tool for exploring refraction using Snell's law. Adjust the refractive indices of two media and the incident angle to observe refraction, the critical angle, and total internal reflection.

## Demo

[Open the live simulator](https://nopparat-yam.github.io)

## Features

- Select a predefined medium or enter a custom refractive index for each side.
- Adjust the incident angle with the slider, input field, or canvas interaction.
- View the refracted angle and the total internal reflection state.
- Jump directly to the critical angle when it exists.

## Setup

This project requires Node.js 20 or later for testing.

```powershell
npm install
```

To run the simulator locally, serve the project through an HTTP server so that the ES module can load correctly:

```powershell
python -m http.server 4173
```

Open http://localhost:4173 in a browser.

## Testing

Run Vitest in watch mode during development:

```powershell
npm test
```

Run the complete test suite once:

```powershell
npm run test:run
```

Run only unit tests or browser component tests:

```powershell
npm run test:ut
npm run test:ct
```

Unit tests cover the physics calculations in `server/physics.js`. Component tests run the simulator controls in Chromium and cover medium selection, custom values, increment/decrement buttons, angle controls, critical angle, and total internal reflection.

## Continuous Integration

GitHub Actions runs `npm run test:run` automatically on every push and pull request. The workflow is defined in `.github/workflows/tests.yml`.