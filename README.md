# NeuroVoice

**NeuroVoice** is a high-performance, real-time voice-to-voice conversation platform. It enables seamless human-like interactions with AI using cutting-edge streaming technologies.

## 🚀 Key Features

- **Real-time Continuous Streaming**: Bidirectional communication via WebSockets (no HTTP polling).
- **Ultra-low Latency**: Target end-to-end latency of < 2 seconds.
- **Local STT**: Powered by `faster-whisper` for fast, private transcription.
- **Advanced Brain**: Integrated with Google Gemini 2.0 Flash through the Vertex AI Agent Development Kit (ADK).
- **Streaming TTS**: Real-time speech synthesis using Google Cloud TTS with chunked delivery.
- **Rich Visuals**: Real-time volume indicators and live transcription.

## 🏗️ Architecture

NeuroVoice follows a **Modular Clean Architecture**, allowing for independent scaling and easy swapping of STT, LLM, or TTS engines.

```text
.
├── backend/            # FastAPI asynchronous server
│   ├── src/
│   │   ├── api/        # WebSocket endpoints
│   │   ├── services/   # STT, Agent, and TTS services
│   │   └── core/       # Configuration and Logging
│   └── tests/         # Unit and Integration tests
├── specs/              # SDD (Specification Driven Development) artifacts
└── .specify/           # Project constitution and extension logic
```

## 🛠️ Getting Started (Backend)

### Prerequisites

- Python 3.11+
- Google Cloud Project with Vertex AI and TTS APIs enabled.
- Local hardware capable of running `faster-whisper` (CPU/GPU).

### Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd neurovoice-app
    ```

2.  **Install dependencies**:
    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```

3.  **Configure Environment**:
    Create a `.env` file in `backend/` with the following:
    ```env
    GOOGLE_PROJECT_ID=your-project-id
    WHISPER_MODEL_NAME=base
    GEMINI_MODEL_ID=gemini-2.0-flash-001
    ```

4.  **Run the Server**:
    ```bash
    python -m src.main
    ```

## 📅 Roadmap

- [x] **Phase 1**: Backend Foundation (FastAPI + WebSockets + STT/Agent/TTS Core)
- [ ] **Phase 2**: Web Client (Minimalist & Elegant UI + Dynamic Visualizers)
- [ ] **Phase 3**: iOS App (Mobile Voice Interaction)
- [ ] **Phase 4**: Advanced Agents (MCP Integration + Tool Use)

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.
