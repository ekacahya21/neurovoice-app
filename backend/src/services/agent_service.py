import asyncio
import logging
import re
from typing import AsyncGenerator, Optional
from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel, ChatSession
from src.core.config import settings

logger = logging.getLogger(__name__)

class AgentService:
    """
    Service for interacting with Vertex AI Gemini using Agent patterns.
    """
    def __init__(self, model_id: str = settings.GEMINI_MODEL_ID):
        self.model_id = model_id
        self.model = None
        self.chat: Optional[ChatSession] = None
        
    def initialize(self):
        """Initialize the Vertex AI connection."""
        if not settings.GOOGLE_PROJECT_ID:
            logger.warning("GOOGLE_PROJECT_ID not set. Gemini calls may fail.")
            
        aiplatform.init(project=settings.GOOGLE_PROJECT_ID)
        self.model = GenerativeModel(
            self.model_id,
            system_instruction="Anda adalah asisten suara NeuroVoice yang ramah. Berbicaralah selalu dalam Bahasa Indonesia secara alami."
        )
        self.chat = self.model.start_chat()
        logger.info(f"AgentService initialized with model {self.model_id}")

    async def generate_response_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        """
        Generates a streaming response for the given prompt, yielded sentence by sentence.
        """
        if self.chat is None:
            self.initialize()
            
        logger.info(f"Generating response for: {prompt}")
        try:
            response_stream = await self.chat.send_message_async(prompt, stream=True)
            
            buffer = ""
            async for chunk in response_stream:
                if chunk.text:
                    buffer += chunk.text
                    
                    # Split into full sentences (including punctuation)
                    while True:
                        # Match everything up to the first . ! ? or newline
                        match = re.search(r'.*?[.!?\n]+', buffer, re.DOTALL)
                        if not match:
                            break
                        
                        sentence = match.group(0)
                        buffer = buffer[match.end():]
                        
                        clean_sentence = sentence.strip()
                        if clean_sentence:
                            yield clean_sentence

            # Yield any remaining text in the buffer
            if buffer.strip():
                yield buffer.strip()
                
        except Exception as e:
            logger.error(f"Agent error: {e}")
            yield "I encountered an error processing your request."
