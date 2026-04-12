import logging
from typing import AsyncGenerator
from google.cloud import texttospeech
from src.core.config import settings

logger = logging.getLogger(__name__)

class TTSService:
    """
    Service for converting text to speech using Google Cloud TTS.
    """
    def __init__(self):
        self.client = None
        self.voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            name="en-US-Neural2-F"  # High quality neural voice
        )
        self.audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.LINEAR16,  # PCM
            sample_rate_hertz=settings.OUTPUT_RATE
        )
        
    def initialize(self):
        """Initialize the Google TTS client."""
        try:
            self.client = texttospeech.TextToSpeechClient()
            logger.info("TTSService client initialized.")
        except Exception as e:
            logger.error(f"Failed to initialize TTS client: {e}")

    async def synthesize_chunk(self, text: str) -> bytes:
        """
        Synthesizes a small chunk of text into PCM audio bytes.
        """
        if self.client is None:
            self.initialize()
            
        if not text.strip():
            return b""
            
        try:
            # Note: For ultra-low latency, we use the standard synthesize_speech for small chunks.
            # Real-time streaming (bidirectional) is also an option but more complex for simple MVP.
            synthesis_input = texttospeech.SynthesisInput(text=text)
            
            response = self.client.synthesize_speech(
                input=synthesis_input,
                voice=self.voice,
                audio_config=self.audio_config
            )
            
            return response.audio_content
        except Exception as e:
            logger.error(f"TTS synthesis error: {e}")
            return b""
