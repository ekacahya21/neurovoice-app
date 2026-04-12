class NeuroVoiceAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.resampleBuffer = [];
    this.inputSampleRate = sampleRate;
    console.log('[Worklet] Initialized. Sample Rate:', sampleRate);
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const inputChannelData = input[0];
    
    // Simple Linear Resampling to 16kHz
    const resamplingRatio = this.inputSampleRate / 16000;
    for (let i = 0; i < inputChannelData.length; i += resamplingRatio) {
      this.resampleBuffer.push(inputChannelData[Math.floor(i)]);
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
