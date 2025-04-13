
/**
 * Advanced audio processing utility for vocal separation
 */

// AudioContext singleton for efficiency
let globalAudioContext: AudioContext | null = null;

// Get or create the audio context
export const getAudioContext = (): AudioContext => {
  if (!globalAudioContext) {
    globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return globalAudioContext;
};

// Create frequency-based filters for vocal separation
export const createBandpassFilter = (
  audioContext: AudioContext,
  frequency: number,
  Q: number
): BiquadFilterNode => {
  const filter = audioContext.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = frequency;
  filter.Q.value = Q;
  return filter;
};

// Create notch filter for vocal removal
export const createNotchFilter = (
  audioContext: AudioContext,
  frequency: number,
  Q: number
): BiquadFilterNode => {
  const filter = audioContext.createBiquadFilter();
  filter.type = "notch";
  filter.frequency.value = frequency;
  Q && (filter.Q.value = Q);
  return filter;
};

// Enhanced vocal isolation with multi-band processing 
export const processVocalIsolation = async (audioBuffer: AudioBuffer): Promise<AudioBuffer> => {
  const audioContext = getAudioContext();
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  // Source node
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;

  // Create a specialized vocal band filter (human voice frequencies)
  const vocalBandFilter = offlineContext.createBiquadFilter();
  vocalBandFilter.type = "bandpass";
  vocalBandFilter.frequency.value = 2000; // Center of human voice range
  vocalBandFilter.Q.value = 0.5;

  // Create dynamic compressor to enhance vocals
  const compressor = offlineContext.createDynamicsCompressor();
  compressor.threshold.value = -24;
  compressor.knee.value = 30;
  compressor.ratio.value = 12;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;

  // Connect the nodes
  source.connect(vocalBandFilter);
  vocalBandFilter.connect(compressor);
  compressor.connect(offlineContext.destination);

  // Start the source
  source.start(0);
  
  // Render the audio
  return await offlineContext.startRendering();
};

// Enhanced instrumental isolation
export const processInstrumentalIsolation = async (audioBuffer: AudioBuffer): Promise<AudioBuffer> => {
  const audioContext = getAudioContext();
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  // Source node
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  
  // Create multi-band notch filters to remove vocals
  const vocalNotch1 = offlineContext.createBiquadFilter();
  vocalNotch1.type = "notch";
  vocalNotch1.frequency.value = 1000; // Lower vocal range
  vocalNotch1.Q.value = 1.0;
  
  const vocalNotch2 = offlineContext.createBiquadFilter();
  vocalNotch2.type = "notch";
  vocalNotch2.frequency.value = 2500; // Mid vocal range
  vocalNotch2.Q.value = 1.0;
  
  const vocalNotch3 = offlineContext.createBiquadFilter();
  vocalNotch3.type = "notch";
  vocalNotch3.frequency.value = 4000; // Higher vocal range
  vocalNotch3.Q.value = 1.0;
  
  // Add a low shelf filter to boost bass
  const bassBoost = offlineContext.createBiquadFilter();
  bassBoost.type = "lowshelf";
  bassBoost.frequency.value = 100;
  bassBoost.gain.value = 3.0;

  // Connect nodes in series
  source.connect(vocalNotch1);
  vocalNotch1.connect(vocalNotch2);
  vocalNotch2.connect(vocalNotch3);
  vocalNotch3.connect(bassBoost);
  bassBoost.connect(offlineContext.destination);

  // Start the source
  source.start(0);
  
  // Render the audio
  return await offlineContext.startRendering();
};

// Convert AudioBuffer to Blob
export const audioBufferToWav = (buffer: AudioBuffer, sampleRate = 44100): Blob => {
  const numOfChannels = buffer.numberOfChannels;
  const length = buffer.length * numOfChannels * 2;
  const dataView = new DataView(new ArrayBuffer(44 + length));
  
  // Write WAV header
  writeString(dataView, 0, 'RIFF');
  dataView.setUint32(4, 36 + length, true);
  writeString(dataView, 8, 'WAVE');
  writeString(dataView, 12, 'fmt ');
  dataView.setUint32(16, 16, true);
  dataView.setUint16(20, 1, true);
  dataView.setUint16(22, numOfChannels, true);
  dataView.setUint32(24, sampleRate, true);
  dataView.setUint32(28, sampleRate * 2 * numOfChannels, true);
  dataView.setUint16(32, numOfChannels * 2, true);
  dataView.setUint16(34, 16, true);
  writeString(dataView, 36, 'data');
  dataView.setUint32(40, length, true);

  // Write audio data
  const channelData = [];
  
  for (let i = 0; i < numOfChannels; i++) {
    channelData.push(buffer.getChannelData(i));
  }
  
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      dataView.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  
  return new Blob([dataView], { type: 'audio/wav' });
};

// Helper function to write strings to DataView
const writeString = (dataView: DataView, offset: number, str: string): void => {
  for (let i = 0; i < str.length; i++) {
    dataView.setUint8(offset + i, str.charCodeAt(i));
  }
};

// Load audio from a file and return an AudioBuffer
export const loadAudioFromFile = async (file: File): Promise<AudioBuffer> => {
  const audioContext = getAudioContext();
  const arrayBuffer = await file.arrayBuffer();
  return await audioContext.decodeAudioData(arrayBuffer);
};

