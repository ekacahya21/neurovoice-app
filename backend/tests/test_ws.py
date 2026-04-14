import json
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from backend.src.main import app

client = TestClient(app)

@pytest.mark.asyncio
async def test_websocket_connection():
    # Mocking the services to avoid real API dependencies during tests
    with patch("backend.src.api.routes.websocket.stt_service.load_model", new_callable=AsyncMock), \
         patch("backend.src.api.routes.websocket.agent_service.initialize"), \
         patch("backend.src.api.routes.websocket.tts_service.initialize"), \
         patch("backend.src.api.routes.websocket.stt_service.transcribe_chunk", new_callable=AsyncMock) as mock_stt, \
         patch("backend.src.api.routes.websocket.agent_service.generate_response_stream") as mock_agent:
        
        # Setup mocks
        mock_stt.return_value = "Hello"
        
        async def mock_stream(prompt):
            yield "Hi there"
        mock_agent.side_effect = mock_stream

        with client.websocket_connect("/ws/conversation") as websocket:
            # Send small audio chunk (simulating 0.5s of silence)
            # 16000 bytes = 0.5s at 16kHz 16-bit
            websocket.send_bytes(bytes(16001))
            
            # 1. Expect volume message
            resp_volume = websocket.receive_json()
            assert resp_volume["type"] == "volume"
            
            # 2. Expect transcription message
            resp_trans = websocket.receive_json()
            assert resp_trans["type"] == "transcription"
            assert resp_trans["text"] == "Hello"
            
            # 3. Expect AI text response
            resp_ai = websocket.receive_json()
            assert resp_ai["type"] == "ai_text"
            assert resp_ai["text"] == "Hi there"
            
            # Send stop message
            websocket.send_json({"type": "stop"})
