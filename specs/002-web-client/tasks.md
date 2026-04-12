# Task List: NeuroVoice Web Client

## Phase 1: Project Setup & Initialization
- [x] Initialize Vite + React + TypeScript in `frontend/` directory.
- [x] Set up TailwindCSS for styling.
- [x] Configure `vite.config.ts` to support AudioWorklet scripts as separate chunks.
- [x] Create basic project skeleton (components, hooks, workers directories).

## Phase 2: High-Performance Audio Engine
- [x] Implement `src/workers/audio-processor.ts`:
    - Linear interpolation downsampling to 16kHz.
    - 16-bit PCM quantization.
- [x] Verify AudioWorklet registration in `App.tsx`.
- [x] Implement `src/hooks/useNeuroVoice.ts`:
    - Manage `AudioContext` lifecycle.
    - Set up state-driven WebSocket (Binary for audio, JSON for transcripts).
    - Implement exponential backoff for reconnection.

## Phase 3: Premium UI Components
- [x] Implement `src/components/VolumeOrb.tsx`:
    - Canvas-powered pulsing visualization reacting to RMS amplitude.
- [x] Implement `src/components/ChatInterface.tsx`:
    - Refined typography and glassmorphism styling for streaming text.
- [x] Design `src/components/ControlButton.tsx`:
    - Start/Stop session with interactive hover/active states.

## Phase 4: Integration & Validation
- [x] Connect `useNeuroVoice` hook to `VolumeOrb` and `ChatInterface`.
- [x] Test end-to-end latency using Browser DevTools and Backend logs.
- [x] Verify audio quality at 16kHz via backend capture verification.

## Phase 5: Polish & UX
- [x] Add smooth transitions between conversation states (Idle -> Active).
- [x] Final accessibility check for button labels and UI contrast.
