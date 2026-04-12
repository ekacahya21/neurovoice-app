import asyncio
import logging
import numpy as np
from concurrent.futures import ThreadPoolExecutor
from faster_whisper import WhisperModel
from src.core.config import settings

logger = logging.getLogger(__name__)

class TranscriptionService:
    """
    Service for real-time speech-to-text using faster-whisper.
    """
    def __init__(self, model_size: str = settings.WHISPER_MODEL_NAME):
        self.model_size = model_size
        self.model = None
        self.executor = ThreadPoolExecutor(max_workers=1)
        
    async def load_model(self):
        """Loads the model in a separate thread."""
        if self.model is None:
            logger.info(f"Loading faster-whisper model: {self.model_size}...")
            loop = asyncio.get_event_loop()
            self.model = await loop.run_in_executor(
                self.executor, 
                lambda: WhisperModel(self.model_size, device="cpu", compute_type="int8")
            )
            logger.info("faster-whisper model loaded successfully.")

    async def transcribe_chunk(self, audio_data: np.ndarray) -> str:
        """
        Transcribes a chunk of normalized float audio data.
        """
        if self.model is None:
            await self.load_model()
            
        if audio_data.size == 0:
            return ""

        loop = asyncio.get_event_loop()
        try:
            segments, info = await loop.run_in_executor(
                self.executor,
                lambda: self.model.transcribe(audio_data, beam_size=5)
            )
            
            text = "".join([segment.text for segment in segments]).strip()
            if text:
                logger.info(f"Transcribed: {text}")
            return text
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            return ""
            
    def shutdown(self):
        self.executor.shutdown()
