import asyncio
import logging
from typing import AsyncGenerator
from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel, ChatSession
from backend.src.core.config import settings

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
        self.model = GenerativeModel(self.model_id)
        self.chat = self.model.start_chat()
        logger.info(f"AgentService initialized with model {self.model_id}")

    async def generate_response_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        """
        Generates a streaming response for the given prompt.
        """
        if self.chat is None:
            self.initialize()
            
        logger.info(f"Generating response for: {prompt}")
        try:
            # Note: In a production ADK environment, we might use Runner.run_live()
            # For this MVP version, we use stream_generate_content
            response_stream = await self.chat.send_message_async(prompt, stream=True)
            
            async for chunk in response_stream:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.error(f"Agent error: {e}")
            yield "I encountered an error processing your request."
