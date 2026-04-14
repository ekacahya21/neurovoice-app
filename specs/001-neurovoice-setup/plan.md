# Implementation Plan: NeuroVoice Backend Setup

**Branch**: `001-neurovoice-setup` | **Date**: 2026-04-12 | **Spec**: [spec.md](file:///Users/nanangcahya/Development/my-projects/neurovoice-app/specs/001-neurovoice-setup/spec.md)
**Input**: Feature specification for NeuroVoice voice-to-voice application.

## Summary
The goal is to implement a high-performance FastAPI backend that supports real-time, bidirectional voice interaction. The system will use WebSockets to receive raw PCM audio, transcribe it via a local `faster-whisper` instance, process the intent using a Vertex AI ADK Agent (Gemini 2.0 Flash), and synthesize the response in real-time via Google Cloud TTS.

## Technical Context

**Language/Version**: Python 3.11+  
**Primary Dependencies**: `fastapi`, `uvicorn`, `faster-whisper`, `google-cloud-aiplatform`, `google-cloud-texttospeech`  
**Storage**: N/A (Stateless streaming for v1)  
**Testing**: `pytest` + `pytest-asyncio` for WebSocket integration tests.  
**Target Platform**: Mac/Linux Server (Mac for development)  
**Project Type**: asynchronous web-service  
**Performance Goals**: < 2s End-to-End Latency.  
**Constraints**: Continuous binary streaming via WebSockets; No HTTP polling.  
**Scale/Scope**: Initial setup with single-agent support.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Alignment Notes |
|-----------|--------|-----------------|
| I. Continuous Streaming | ✅ | Backend uses non-blocking WebSocket binary loops. |
| II. Low-Latency (<2s) | ✅ | Local Whisper and Chunked TTS minimize latency. |
| III. Modular Architecture| ✅ | Interfaces for STT, LLM, and TTS will be decoupled. |
| IV. Resource Efficiency | ✅ | Async buffer management and session cleanup. |
| V. Minimalist UX | ✅ | Backend provides volume metadata in WS messages. |

## Project Structure

### Documentation (this feature)
```text
specs/001-neurovoice-setup/
├── plan.md              # This file
├── research.md          # ADK & Streaming details
├── data-model.md        # WebSocket protocol schema
├── quickstart.md        # Environment setup
├── contracts/           # WebSocket binary message formats
└── tasks.md             # Implementation roadmap
```

### Source Code (repository root)
```text
backend/
├── src/
│   ├── api/
│   │   ├── routes/      # WebSocket endpoints
│   │   └── deps.py      # Dependency injection (Services)
│   ├── core/
│   │   ├── config.py    # Env vars & Constants
│   │   └── security.py
│   ├── services/
│   │   ├── stt_service.py   # faster-whisper wrapper
│   │   ├── agent_service.py # Vertex AI ADK integration
│   │   └── tts_service.py   # Google TTS streaming
│   ├── models/
│   │   └── schemas.py       # JSON control messages
│   └── main.py              # App entry point
├── tests/
└── requirements.txt
```

## Proposed Changes

### [Backend Core]

#### [NEW] [src/main.py](file:///Users/nanangcahya/Development/my-projects/neurovoice-app/backend/src/main.py)
Initialize FastAPI app with life-span handlers for model loading.

#### [NEW] [src/services/stt_service.py](file:///Users/nanangcahya/Development/my-projects/neurovoice-app/backend/src/services/stt_service.py)
Implements an asynchronous generator that takes PCM chunks and yields transcribed text using `faster-whisper`. Uses a thread executor for blocking model calls.

#### [NEW] [src/services/agent_service.py](file:///Users/nanangcahya/Development/my-projects/neurovoice-app/backend/src/services/agent_service.py)
Uses Vertex AI ADK `Agent` to manage the Gemini 2.0 Flash session. Handles conversation history and tool-less reasoning for v1.

#### [NEW] [src/services/tts_service.py](file:///Users/nanangcahya/Development/my-projects/neurovoice-app/backend/src/services/tts_service.py)
Integrates with Google Cloud TTS API using chunked synthesis. Streams raw audio bytes back through the WebSocket.

#### [NEW] [src/api/routes/websocket.py](file:///Users/nanangcahya/Development/my-projects/neurovoice-app/backend/src/api/routes/websocket.py)
Main WebSocket handler logic. Orchestrates the flow: `Audio In -> STT -> Agent -> TTS -> Audio Out`.

## Open Questions

> [!IMPORTANT]
> **Hosting & Resource**: `faster-whisper` requires ~2GB RAM for the `base` model and significantly more for `large-v3`. Should I default to `base` for development speed, or target `large-v3` for accuracy?

## Verification Plan

### Automated Tests
- `pytest -v tests/test_websocket.py`: Use a mock audio client to verify transcription and TTS response loop.
- Latency Benchmark: Measure time from `audio_end` packet to `first_audio_chunk` received.

### Manual Verification
- Run backend and use a script (e.g. `client/test_ws.py`) to stream a local WAV file and verify the response is audible and accurate.
