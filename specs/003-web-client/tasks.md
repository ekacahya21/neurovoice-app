# Tasks: Client-Side VAD Implementation

- [ ] Implement VAD logic in `public/audio-processor.js`
    - [ ] Calculate RMS in `process()`
    - [ ] Implement state machine (IDLE, SPEAKING, SILENCE_DECIDING)
    - [ ] Create sentence buffer
- [ ] Refactor `backend/src/api/routes/websocket.py` to handle burst chunks
    - [ ] Remove fixed 1s threshold
    - [ ] Immediate transcription on message receive
- [ ] Update frontend UI state to show "Processing..." state during VAD silence deciding
- [ ] Manual verification and tuning of VAD threshold
