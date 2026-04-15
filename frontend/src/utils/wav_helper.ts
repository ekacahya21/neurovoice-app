/**
 * Utility to wrap raw PCM 16-bit Mono 16kHz audio in a WAV header.
 */

export function createWavHeader(dataLength: number, sampleRate: number = 16000): ArrayBuffer {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + dataLength, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw PCM)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataLength, true);

  return header;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Combines multiple ArrayBuffer chunks into a single WAV Blob.
 */
export function pcmChunksToWavBlob(chunks: ArrayBuffer[], sampleRate: number = 16000): Blob {
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
  const header = createWavHeader(totalLength, sampleRate);
  
  return new Blob([header, ...chunks], { type: 'audio/wav' });
}
