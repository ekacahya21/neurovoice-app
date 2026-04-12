class NeuroVoiceAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.resampleBuffer = [];
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

    if (rms > THRESHOLD) {
      if (!this.isSpeaking) {
        this.isSpeaking = true;
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

    // Process in chunks of 512 samples (~32ms at 16kHz)
    while (this.resampleBuffer.length >= 512) {
      const chunk = this.resampleBuffer.splice(0, 512);
      this.sendToMainThread(chunk);
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
