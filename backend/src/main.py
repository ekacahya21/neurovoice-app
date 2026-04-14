import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import websocket
from src.core.config import settings
from src.core.logging import setup_logging

# Initialize logging
setup_logging()

description = """
NeuroVoice API helps you build high-performance, real-time voice-to-voice conversation applications.

## Features
* **Real-time Streaming**: Low-latency binary WebSocket communication.
* **STT (Speech-to-Text)**: Powered by faster-whisper.
* **AI Agent**: Intelligent conversation management via Vertex AI Gemini.
* **TTS (Text-to-Speech)**: High-quality neural voice synthesis via Google Cloud TTS.
"""

tags_metadata = [
    {
        "name": "Real-time",
        "description": "Bidirectional WebSocket endpoints for voice conversation.",
    },
    {
        "name": "Operational",
        "description": "Health checks and system status.",
    },
]

app = FastAPI(
    title="NeuroVoice API",
    description=description,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=tags_metadata,
    contact={
        "name": "NeuroVoice Developer",
        "url": "https://github.com/nanangcahya/neurovoice-app",
    },
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routes
app.include_router(websocket.router, tags=["Real-time"])

@app.get("/health", tags=["Operational"], summary="Check API Health")
def health_check():
    """
    Returns the current status of the API and project metadata.
    """
    return {"status": "healthy", "project": "NeuroVoice"}

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True
    )
