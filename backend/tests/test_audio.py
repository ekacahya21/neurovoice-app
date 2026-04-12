import numpy as np
import pytest
from backend.src.services.audio_utils import AudioBuffer

def test_audio_buffer_initialization():
    buffer = AudioBuffer(sample_rate=16000)
    assert len(buffer.buffer) == 0
    assert buffer.sample_rate == 16000

def test_audio_buffer_add_and_get():
    buffer = AudioBuffer(sample_rate=16000)
    # Create 0.5s of 16kHz 16-bit PCM silence (zeros)
    # 0.5s * 16000 samples/s * 2 bytes/sample = 16000 bytes
    silence_bytes = bytes(16000)
    buffer.add_bytes(silence_bytes)
    
    assert len(buffer.buffer) == 16000
    
    # Extract 0.5s as floats
    audio_floats = buffer.get_as_floats(duration_s=0.5)
    
    assert isinstance(audio_floats, np.ndarray)
    assert audio_floats.shape[0] == 8000 # samples
    assert np.all(audio_floats == 0)
    assert len(buffer.buffer) == 0 # buffer should be consumed

def test_amplitude_calculation():
    buffer = AudioBuffer()
    # Constant signal at max int16
    chunk = np.ones(100, dtype=np.float32)
    amplitude = buffer.calculate_amplitude(chunk)
    assert amplitude == 1.0
    
    # Silence
    chunk_silence = np.zeros(100, dtype=np.float32)
    assert buffer.calculate_amplitude(chunk_silence) == 0.0

def test_partial_buffer():
    buffer = AudioBuffer(sample_rate=16000)
    # Add only 0.1s of audio
    buffer.add_bytes(bytes(3200))
    
    # Try to extract 0.5s
    audio_floats = buffer.get_as_floats(duration_s=0.5)
    assert audio_floats.size == 0
    assert len(buffer.buffer) == 3200 # remains in buffer
