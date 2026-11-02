# Memory Garden

A browser-based interactive generative art installation. Flowers respond to mouse/touch movement, and optional webcam hand tracking lets a visitor shape the garden with their index fingertip.

## Run locally

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Camera access requires `localhost` or HTTPS and explicit browser permission.

## Build for deployment

```bash
npm run build
npm run preview
```

The production output is in `dist/`.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Deploy. Camera access works on the HTTPS deployment after the visitor grants permission.

You can also deploy the `dist/` directory to Netlify or any static host that supports SPA/static assets.

## Interaction

- Mouse/touch: move to awaken flowers; stay still to deepen blooms; click/tap to release particles.
- Camera: enable camera, grant permission, and move your index fingertip in view.
- Sound: toggle the sound control (reserved UI toggle; no audio composition is bundled in this starter release).
- Reset: return to the resting garden.

## Privacy

Camera frames are processed locally in the browser by MediaPipe. The app does not upload or store camera video. MediaPipe model and WASM assets are downloaded from their public CDNs when camera tracking is enabled.
