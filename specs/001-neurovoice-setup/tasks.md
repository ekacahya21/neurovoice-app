# Tasks: NeuroVoice Backend Setup

**Input**: Design documents from `/specs/001-neurovoice-setup/`
**Prerequisites**: [plan.md](file:///Users/nanangcahya/Development/my-projects/neurovoice-app/specs/001-neurovoice-setup/plan.md), [spec.md](file:///Users/nanangcahya/Development/my-projects/neurovoice-app/specs/001-neurovoice-setup/spec.md)

**Tests**: Tests are generated for core logic (T012, T013).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (Voice Conversation)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan (backend/src/...)
- [ ] T002 Create `backend/requirements.txt` with FastAPI, faster-whisper, and Google Cloud SDKs
- [ ] T003 [P] Configure environment management in `backend/src/core/config.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure for real-time streaming

- [ ] T004 [P] Implement Audio Buffer utility for PCM processing in `backend/src/services/audio_utils.py`
- [ ] T005 [P] Implement amplitude calculation for volume indicators in `backend/src/services/audio_utils.py`
- [ ] T006 [P] Configure asynchronous logging in `backend/src/core/logging.py`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Voice Conversation (Priority: P1) 🎯 MVP

**Goal**: Enable real-time voice-to-voice interaction via WebSockets.

**Independent Test**: Connect via WebSocket, stream 5 seconds of PCM audio, and receive text transcription + audio response chunks.

### Implementation for User Story 1

- [ ] T007 [P] [US1] Implement `TranscriptionService` using `faster-whisper` in `backend/src/services/stt_service.py`
- [ ] T008 [P] [US1] Implement `AgentService` using Vertex AI ADK in `backend/src/services/agent_service.py`
- [ ] T009 [P] [US1] Implement `TTSService` with chunked Google TTS in `backend/src/services/tts_service.py`
- [ ] T010 [US1] Implement core WebSocket route and orchestration loop in `backend/src/api/routes/websocket.py`
- [ ] T011 [US1] Integrate volume indicator metadata into the WebSocket message stream

**Checkpoint**: User Story 1 fully functional and testable independently

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Reliability and verification

- [ ] T012 [P] Add unit tests for audio utilities in `backend/tests/test_audio.py`
- [ ] T013 [P] Add integration test for the WebSocket loop in `backend/tests/test_ws.py`
- [ ] T014 Performance benchmark for <2s end-to-end latency

---

## Dependencies & Execution Order

- **Phase 1 & 2** are prerequisites for Phase 3.
- **T010 (Orchestration)** depends on T007, T008, T009.

### Parallel Opportunities
- T003, T004, T005, T006 can be worked on in parallel once Phase 1 structure exists.
- T007, T008, T009 are independent and can be implemented simultaneously.
