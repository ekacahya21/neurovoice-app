import numpy as np
import logging

logger = logging.getLogger(__name__)

class AudioBuffer:
    """
    Manages raw PCM audio bytes and provides chunks for processing.
    """
    def __init__(self, sample_rate: int = 16000, bit_depth: int = 16):
        self.sample_rate = sample_rate
        self.bit_depth = bit_depth
        self.buffer = bytearray()
        
    def add_bytes(self, data: bytes):
        """Append incoming PCM bytes to the buffer."""
        self.buffer.extend(data)
        
    def get_as_floats(self, duration_s: float = 0.5, peek: bool = False) -> np.ndarray:
        """
        Extract a chunk of audio as normalized floats [-1.0, 1.0].
        duration_s: How many seconds of audio to extract.
        peek: If True, do not remove the bytes from the buffer.
        """
        num_samples = int(self.sample_rate * duration_s)
        bytes_needed = num_samples * (self.bit_depth // 8)
        
        if len(self.buffer) < bytes_needed:
            return np.array([], dtype=np.float32)
            
        chunk = self.buffer[:bytes_needed]
        if not peek:
            # Remove consumed bytes
            self.buffer = self.buffer[bytes_needed:]
        
        # Convert bytes to int16 then to float32
        audio_int16 = np.frombuffer(chunk, dtype=np.int16)
        audio_float32 = audio_int16.astype(np.float32) / 32768.0
        
        return audio_float32

    def calculate_amplitude(self, chunk: np.ndarray) -> float:
        """Calculate the RMS amplitude of a chunk to indicate volume."""
        if chunk.size == 0:
            return 0.0
        return float(np.sqrt(np.mean(chunk**2)))

    def clear(self):
        self.buffer = bytearray()
