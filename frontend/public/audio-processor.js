class NeuroVoiceAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.resampleBuffer = [];
    this.preRollBuffer = []; // Buffer to store silence chunks
    this.MAX_PREROLL_CHUNKS = 10; // ~320ms at 16kHz
    this.inputSampleRate = sampleRate;
    this.isSpeaking = false;
    this.silenceCounter = 0;
    console.log('[Worklet] Initialized. Sample Rate:', sampleRate);
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const inputChannelData = input[0];
    
    // Simple Linear Resampling to 16kHz
    const resamplingRatio = this.inputSampleRate / 16000;
    const resampledChunk = [];
    for (let i = 0; i < inputChannelData.length; i += resamplingRatio) {
      const sample = inputChannelData[Math.floor(i)];
      resampledChunk.push(sample);
      this.resampleBuffer.push(sample);
    }

    // Calculate RMS for VAD (on resampled audio)
    let sumSquares = 0;
    for (let i = 0; i < resampledChunk.length; i++) {
      sumSquares += resampledChunk[i] * resampledChunk[i];
    }
    const rms = Math.sqrt(sumSquares / resampledChunk.length);

    const THRESHOLD = 0.02;
    const SILENCE_COOLDOWN_SAMPLES = 0.8 * 16000; // 800ms at 16kHz

    let justStartedSpeaking = false;

    if (rms > THRESHOLD) {
      if (!this.isSpeaking) {
        this.isSpeaking = true;
        justStartedSpeaking = true;
      }
      this.silenceCounter = 0;
    } else if (this.isSpeaking) {
      this.silenceCounter += resampledChunk.length;
      if (this.silenceCounter >= SILENCE_COOLDOWN_SAMPLES) {
        this.isSpeaking = false;
        this.silenceCounter = 0;
        this.port.postMessage({ type: 'sentence_end' });
      }
    }

    // Flush pre-roll buffer if we just started speaking
    if (justStartedSpeaking) {
      while (this.preRollBuffer.length > 0) {
        this.sendToMainThread(this.preRollBuffer.shift());
      }
    }

    // Process in chunks of 512 samples (~32ms at 16kHz)
    while (this.resampleBuffer.length >= 512) {
      const chunk = this.resampleBuffer.splice(0, 512);
      
      if (this.isSpeaking) {
        this.sendToMainThread(chunk);
      } else {
        // Save to pre-roll for future speech
        this.preRollBuffer.push(chunk);
        if (this.preRollBuffer.length > this.MAX_PREROLL_CHUNKS) {
          this.preRollBuffer.shift();
        }
      }
    }

    return true;
  }

  sendToMainThread(floats) {
    const int16Buffer = new Int16Array(floats.length);
    for (let i = 0; i < floats.length; i++) {
        const s = Math.max(-1, Math.min(1, floats[i]));
        int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    this.port.postMessage(int16Buffer.buffer, [int16Buffer.buffer]);
  }
}

registerProcessor('neurovoice-audio-processor', NeuroVoiceAudioProcessor);
