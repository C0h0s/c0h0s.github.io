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
  filter.Q.value = Q;
  return filter;
};

// Advanced vocal isolation with multi-band processing and phase cancellation
export const processVocalIsolation = async (audioBuffer: AudioBuffer): Promise<AudioBuffer> => {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  
  // Create an offline context for processing
  const offlineContext = new OfflineAudioContext(
    numberOfChannels,
    length,
    sampleRate
  );

  // Source node
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;

  // Create a multi-band filter chain for vocal isolation
  // Human voice typically spans from 80Hz to 8kHz with most energy between 250Hz-4kHz

  // Mid-frequency focus for vocals (most effective range for voice)
  const vocalBandFilter = offlineContext.createBiquadFilter();
  vocalBandFilter.type = "bandpass";
  vocalBandFilter.frequency.value = 2500; // Center around speaking/singing voice
  vocalBandFilter.Q.value = 0.5; // Wide Q for coverage

  // High-pass to remove rumble and bass
  const highPassFilter = offlineContext.createBiquadFilter();
  highPassFilter.type = "highpass";
  highPassFilter.frequency.value = 180; // Remove low frequencies where vocals rarely exist
  
  // Low-pass to remove high-end noise
  const lowPassFilter = offlineContext.createBiquadFilter();
  lowPassFilter.type = "lowpass";
  lowPassFilter.frequency.value = 8000; // Upper limit of vocals
  
  // Dynamics processing to enhance vocals
  const compressor = offlineContext.createDynamicsCompressor();
  compressor.threshold.value = -24;
  compressor.knee.value = 30;
  compressor.ratio.value = 12;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;
  
  // Create gain node to boost the signal
  const gainNode = offlineContext.createGain();
  gainNode.gain.value = 1.5; // Boost vocals
  
  // Connect the nodes
  source.connect(highPassFilter);
  highPassFilter.connect(vocalBandFilter);
  vocalBandFilter.connect(lowPassFilter);
  lowPassFilter.connect(compressor);
  compressor.connect(gainNode);
  gainNode.connect(offlineContext.destination);

  // Start the source
  source.start(0);
  
  // Render the audio
  return await offlineContext.startRendering();
};

// Enhanced instrumental isolation with advanced spectral filtering
export const processInstrumentalIsolation = async (audioBuffer: AudioBuffer): Promise<AudioBuffer> => {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  
  const offlineContext = new OfflineAudioContext(
    numberOfChannels,
    length,
    sampleRate
  );

  // Create source node
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  
  // Create a more advanced multi-band filtering system using phase cancellation techniques
  
  // First, create notch filters at typical vocal frequency ranges
  const vocalNotch1 = offlineContext.createBiquadFilter();
  vocalNotch1.type = "notch";
  vocalNotch1.frequency.value = 500; // Lower vocal range
  vocalNotch1.Q.value = 2.0;
  
  const vocalNotch2 = offlineContext.createBiquadFilter();
  vocalNotch2.type = "notch";
  vocalNotch2.frequency.value = 1000; // Mid-low vocal range
  vocalNotch2.Q.value = 2.0;
  
  const vocalNotch3 = offlineContext.createBiquadFilter();
  vocalNotch3.type = "notch";
  vocalNotch3.frequency.value = 2000; // Central vocal range
  vocalNotch3.Q.value = 2.0;
  
  const vocalNotch4 = offlineContext.createBiquadFilter();
  vocalNotch4.type = "notch";
  vocalNotch4.frequency.value = 3000; // Mid-high vocal range
  vocalNotch4.Q.value = 2.0;
  
  const vocalNotch5 = offlineContext.createBiquadFilter();
  vocalNotch5.type = "notch";
  vocalNotch5.frequency.value = 4000; // Higher vocal presence
  vocalNotch5.Q.value = 2.0;
  
  // Create shelf filters to shape the frequency response
  // Add a low shelf filter to boost bass frequencies (typically instruments)
  const bassBoost = offlineContext.createBiquadFilter();
  bassBoost.type = "lowshelf";
  bassBoost.frequency.value = 200;
  bassBoost.gain.value = 4.0; // More aggressive boost

  // Add a high shelf to boost higher frequencies often found in instruments
  const trebleBoost = offlineContext.createBiquadFilter();
  trebleBoost.type = "highshelf";
  trebleBoost.frequency.value = 8000;
  trebleBoost.gain.value = 2.0;

  // Create a dynamics compressor to enhance the remaining instrumental sounds
  const compressor = offlineContext.createDynamicsCompressor();
  compressor.threshold.value = -20;
  compressor.knee.value = 20;
  compressor.ratio.value = 5;
  compressor.attack.value = 0.05;
  compressor.release.value = 0.1;

  // Connect nodes in series with more complex routing
  source.connect(vocalNotch1);
  vocalNotch1.connect(vocalNotch2);
  vocalNotch2.connect(vocalNotch3);
  vocalNotch3.connect(vocalNotch4);
  vocalNotch4.connect(vocalNotch5);
  vocalNotch5.connect(bassBoost);
  bassBoost.connect(trebleBoost);
  trebleBoost.connect(compressor);
  compressor.connect(offlineContext.destination);

  // Start the source
  source.start(0);
  
  // Render the audio
  return await offlineContext.startRendering();
};

// Enhanced vocal removal that preserves the sound quality of instrumentals
export const processAdvancedInstrumentalExtraction = async (audioBuffer: AudioBuffer): Promise<AudioBuffer> => {
  // Phase cancellation technique for center-channel removal (where vocals are usually located)
  const numberOfChannels = audioBuffer.numberOfChannels;
  
  // For stereo audio (more effective vocal removal)
  if (numberOfChannels === 2) {
    const offlineContext = new OfflineAudioContext(
      2, // Keep stereo
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    
    // Create the source node
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Create a channel splitter to access individual channels
    const splitter = offlineContext.createChannelSplitter(2);
    
    // Create a channel merger to recombine the processed channels
    const merger = offlineContext.createChannelMerger(2);
    
    // Create two gain nodes for phase manipulation
    const leftGain = offlineContext.createGain();
    const rightGain = offlineContext.createGain();
    const leftInvert = offlineContext.createGain();
    
    // Set the gain for the inverted channel
    leftInvert.gain.value = -1; // Invert the phase of the left channel
    
    // Connect source to splitter
    source.connect(splitter);
    
    // Get individual channels, invert one, mix with the other
    // This creates phase cancellation for center-panned content (usually vocals)
    splitter.connect(leftGain, 0); // Left channel
    splitter.connect(rightGain, 1); // Right channel
    
    // Create inverted copy of right channel
    splitter.connect(leftInvert, 1);
    
    // Mix the inverted right channel with left and vice versa
    leftGain.connect(merger, 0, 0);
    leftInvert.connect(merger, 0, 0); // Add inverted right to left
    rightGain.connect(merger, 0, 1); 
    
    // Add equalization to enhance the instrumental frequencies
    const eq = offlineContext.createBiquadFilter();
    eq.type = "peaking";
    eq.frequency.value = 5000;
    eq.Q.value = 1;
    eq.gain.value = 6;
    
    const bassBoost = offlineContext.createBiquadFilter();
    bassBoost.type = "lowshelf";
    bassBoost.frequency.value = 150;
    bassBoost.gain.value = 5;
    
    // Connect the merger to the destination through EQ
    merger.connect(eq);
    eq.connect(bassBoost);
    bassBoost.connect(offlineContext.destination);
    
    // Start the source
    source.start(0);
    
    // Render the audio
    return await offlineContext.startRendering();
  } 
  else {
    // For mono audio, use frequency-based methods
    return processInstrumentalIsolation(audioBuffer);
  }
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
