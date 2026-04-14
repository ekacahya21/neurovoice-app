# Feature Specification: Web Client Implementation

## Overview
NeuroVoice is a real-time voice-to-voice conversation platform. This feature focuses on the **Web Client**, which serves as the primary gateway for users to interact with the NeuroVoice backend. It must provide a premium, low-latency experience for voice interaction, including real-time visual feedback and transcription.

## User Scenarios

### Scenario 1: Starting a Conversation
1. User navigates to the NeuroVoice URL.
2. User clicks "Start Conversation".
3. Browser requests Microphone access; User grants it.
4. User speaks, and a volume visualizer pulses to confirm audio capture.
5. Client detects speech activity and buffers audio.
6. Once the user pauses (sentence complete), the client sends the buffered chunk to the backend.

### Scenario 2: Receiving AI Feedback
1. Upon receiving a complete sentence chunk, the backend transcribes it and triggers the AI.
2. The AI's spoken response is played through the speakers.
3. The AI's text response scrolls into view in the chat history.

## Clarifications

### Session 2026-04-12
- Q: Should the client continue to stream audio partials while the user is still speaking (for real-time STT), or wait entirely until silence is detected to send the "burst"? → A: Hybrid Streaming (Continuous partials for STT, VAD trigger for AI commit).
- Q: What should be the initial "silence duration" (cooldown) to consider a sentence complete? → A: 800ms (Balanced).
- Q: What should be the RMS volume threshold for "silence"? → A: 0.02 (Aggressive noise filtering).
- Q: How should the client signal the end of a sentence? → A: `{"type": "sentence_end"}`.
- Q: Should the UI show a "Thinking..." state immediately after SENTENCE_END? → A: Yes, visually indicate "Thinking" (e.g., pulsing orb).

## Functional Requirements

### FR-001: Audio Capture (Client-Side)
- The system must capture high-quality audio from the browser's `navigator.mediaDevices`.
- Captured audio must be resampled to **16kHz 16-bit PCM (Mono)**.
- Use `AudioWorklet` for low-latency processing.

### FR-002: Client-Side VAD (Silence Detection)
- The `AudioWorklet` must implement a noise-robust silence detection algorithm (RMS-based).
- While speech is detected, the client MUST continue to stream short binary chunks to the backend for real-time STT (partials).
- Silence is defined as an RMS level below **0.02**.
- When silence exceeds **800ms** after speech was detected, the client MUST send a `{"type": "sentence_end"}` signal (via WebSocket metadata) to commit the current transcription and trigger an AI response.

### FR-003: Real-time Communication
- Establish a bidirectional WebSocket connection.
- Use a hybrid flow: Binary chunks for continuous STT + JSON metadata for turn control (`{"type": "sentence_end"}`).
- Handle metadata messages (JSON) for transcriptions and AI status.

### FR-004: Volume Visualization & State Feedback
- Implement a high-fidelity visual indicator.
- The visualizer must transition to a **pulsing "Thinking" state** immediately after a `{"type": "sentence_end"}` is sent, staying in this state until the first AI audio chunk or text response is received.

### FR-005: Transcription Display
- Display the scrolling log of the conversation.
- Show text as the AI response is streamed.

## Success Criteria

| ID | Criterion | Measurement |
|----|-----------|-------------|
| SC-001 | Low Latency Start | AI audio must begin playing within < 2s of the user finishing their speech. |
| SC-002 | Visual Responsiveness | Volume indicator must update at 60fps to match audio levels. |
| SC-003 | VAD Precision | `SENTENCE_END` should trigger within 100ms of the 800ms silence threshold being met. |

## Key Entities

- **Session**: The active WebSocket interaction.
- **Transcript**: The collection of text messages (User/AI).
- **AudioStream**: The binary flow of PCM data.

## Assumptions
- Target browsers: Modern Chrome, Safari, and Firefox.
- Users have a working microphone and speakers.
- Network stability is sufficient for consistent WebSocket streaming.

**Version**: 1.0.0 | **Status**: DRAFT | **Author**: Antigravity
