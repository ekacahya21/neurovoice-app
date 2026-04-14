# Implementation Plan: Client-Side Silence Detection (VAD)

## Proposed Changes

### Frontend Implementation

#### [MODIFY] public/audio-processor.js
- Implement RMS-based silence detection.
- Add buffering logic to accumulate audio during speaking state.
- Trigger "burst" send only after X ms of silence.

#### [MODIFY] src/hooks/useNeuroVoice.ts
- Minor logging updates.

### Backend Implementation

#### [MODIFY] backend/src/api/routes/websocket.py
- Immediate transcription of received chunks.

## Success Criteria
- SC-VAD-001: Transcription only triggers after user pause.
- SC-VAD-002: Silent periods do not consume bandwidth.
