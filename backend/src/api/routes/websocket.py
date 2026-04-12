import asyncio
import logging
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from src.services.audio_utils import AudioBuffer
from src.services.stt_service import TranscriptionService
from src.services.agent_service import AgentService
from src.services.tts_service import TTSService

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
stt_service = TranscriptionService()
agent_service = AgentService()
tts_service = TTSService()

@router.websocket("/ws/conversation")
async def conversation_endpoint(websocket: WebSocket):
    """
    Main WebSocket entry point for real-time voice-to-voice conversation.
    
    ### Communication Protocol:
    1. **Client -> Server (Binary)**: Continuous stream of 16kHz 16-bit Mono PCM audio chunks.
    2. **Server -> Client (JSON)**: 
       - `{"type": "volume", "value": 0.05}`: Real-time amplitude feedback.
       - `{"type": "transcription", "text": "Hello..."}`: Intermediate/Final STT results.
       - `{"type": "ai_text", "text": "Hi there!"}`: Streaming AI response.
    3. **Server -> Client (Binary)**: 16kHz PCM audio response from the AI.
    """
    await websocket.accept()
    logger.info("WebSocket connection established.")
    
    # Initialize session-specific state
    audio_buffer = AudioBuffer()
    session_active = True
    
    # Ensure models are loaded
    await stt_service.load_model()
    agent_service.initialize()
    tts_service.initialize()

    try:
        while session_active:
            # Receive binary or text message
            data = await websocket.receive()
            
            if "bytes" in data:
                # 1. Receive binary audio chunk
                audio_bytes = data["bytes"]
                audio_buffer.add_bytes(audio_bytes)
                
                # 2. Immediate Volume Feedback
                # Extract a small window for amplitude
                temp_chunk = audio_buffer.get_as_floats(duration_s=0.1) # peek small chunk
                amplitude = audio_buffer.calculate_amplitude(temp_chunk)
                await websocket.send_json({"type": "volume", "value": amplitude})
                
                # 3. Process STT periodically (e.g. if we have > 0.5s of audio)
                # Note: In a production app, this would be more sophisticated (VAD)
                if len(audio_buffer.buffer) > 16000: # ~0.5s
                    audio_chunk = audio_buffer.get_as_floats(duration_s=0.5)
                    text = await stt_service.transcribe_chunk(audio_chunk)
                    
                    if text:
                        # 4. Transcription Feedback
                        await websocket.send_json({"type": "transcription", "text": text})
                        
                        # 5. Agent Response Loop
                        async for text_chunk in agent_service.generate_response_stream(text):
                            # Send text to client for real-time display
                            await websocket.send_json({"type": "ai_text", "text": text_chunk})
                            
                            # 6. TTS & Audio Back
                            # Synthesize small sentences/phrases
                            audio_out = await tts_service.synthesize_chunk(text_chunk)
                            if audio_out:
                                await websocket.send_bytes(audio_out)

            elif "text" in data:
                # Handle control messages
                msg = json.loads(data["text"])
                if msg.get("type") == "stop":
                    session_active = False
                    
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected.")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        audio_buffer.clear()
        logger.info("Session cleaned up.")
