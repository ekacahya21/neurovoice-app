<!--
Version change: [INITIAL] → 1.0.0
Modified principles: None (Initial Ratification)
Added sections: Core Principles, Technology Stack, Development Workflow, Governance
Templates requiring updates: ✅ .specify/templates/plan-template.md (Checked for consistency)
Follow-up TODOs: None
-->

# NeuroVoice Constitution

## Core Principles

### I. Real-Time Continuous Streaming
The application MUST support continuous audio streaming via WebSockets. Full audio processing of the entire stream at every step is prohibited; processing must occur in real-time chunks to maintain low latency and provide immediate feedback to the user.

### II. Low-Latency Response
Target end-to-end latency (from speech input to voice output) is < 2 seconds. WebSocket loops MUST NOT be blocked by long-running computation; asynchronous processing and non-blocking IO are mandatory for all engine interactions.

### III. Modular Clean Architecture
The backend must follow Clean Architecture patterns, ensuring core logic is decoupled from external services (Whisper, Gemini, Google TTS). Interfaces must be modular to allow swapping STT, LLM, or TTS engines without refactoring the application core.

### IV. Resource Efficiency
The system must be memory efficient, particularly in audio buffer management. Streaming sessions must be handled gracefully to ensure clean termination and resource release.

### V. Minimalist Elegant UX
The UI/UX prioritizes functionality with a premium, minimalist design. Essential feedback (voice volume, transcription state) must be integrated seamlessly without cluttering the interface.

## Technology Stack

- **Backend Framework**: FastAPI (Asynchronous)
- **STT Engine**: OpenAI Whisper
- **Agent Framework**: ADK (using Vertex AI)
- **Primary Brain LLM**: Google Gemini 2.5 Flash
- **TTS Engine**: Google TTS
- **Communication Protocol**: WebSockets

## Development Workflow

1. **Backend First**: Establish the core streaming logic and engine integrations.
2. **Web Client**: Implement the primary interface with real-time indicators.
3. **iOS Client**: Port interaction patterns to mobile once the web-based protocol is stabilized.
4. **Validation**: Every major feature must be benchmarked against the <2s latency target.

## Governance

- **Protocol Enforcement**: HTTP polling is strictly prohibited for real-time conversation.
- **Async Execution**: Any operation that could block the WebSocket loop must be offloaded to background tasks or worker threads.
- **Engine Evolution**: Model swaps require updated reliability and latency testing.

**Version**: 1.0.0 | **Ratified**: 2026-04-12 | **Last Amended**: 2026-04-12
