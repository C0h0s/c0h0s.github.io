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

// Function to load the spectral gate AudioWorklet module
export const loadSpectralGateWorklet = async (audioContext: AudioContext) => {
  try {
    await audioContext.audioWorklet.addModule('spectral-gate-processor.js');
    return true;
  } catch (err) {
    console.error('Error loading AudioWorklet module:', err);
    return false;
  }
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

// Enhanced vocal isolation with advanced multi-band processing and harmonic separation
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

  // For stereo tracks, use advanced center channel extraction first
  let initialProcessedSignal;
  
  if (numberOfChannels === 2) {
    // Create a channel splitter and merger to access and recombine channels
    const splitter = offlineContext.createChannelSplitter(2);
    const merger = offlineContext.createChannelMerger(2);
    
    // Create gain nodes for center channel extraction
    const leftGain = offlineContext.createGain();
    const rightGain = offlineContext.createGain();
    const rightPhaseInvert = offlineContext.createGain();
    
    // Center channel emphasis (most vocals are in center)
    leftGain.gain.value = 0.5;
    rightGain.gain.value = 0.5;
    rightPhaseInvert.gain.value = -0.5; // Phase inversion to isolate side content
    
    // Connect nodes for center channel extraction
    source.connect(splitter);
    splitter.connect(leftGain, 0); // Left channel
    splitter.connect(rightGain, 1); // Right channel
    splitter.connect(rightPhaseInvert, 1); // Inverted right channel
    
    // Combine channels with phase manipulation
    leftGain.connect(merger, 0, 0);
    rightGain.connect(merger, 0, 1);
    rightPhaseInvert.connect(merger, 0, 0); // Add inverted right to left (cancels side content)
    
    initialProcessedSignal = merger;
  } else {
    initialProcessedSignal = source;
  }

  // Create multi-stage filter chain focused on vocal frequencies
  
  // Stage 1: High-pass to remove bass and sub-bass completely
  const highPassFilter = offlineContext.createBiquadFilter();
  highPassFilter.type = "highpass";
  highPassFilter.frequency.value = 200; // Higher cutoff to remove all bass instruments
  highPassFilter.Q.value = 0.7;
  
  // Stage 2: First vocal band emphasis
  const vocalBandFilter1 = offlineContext.createBiquadFilter();
  vocalBandFilter1.type = "bandpass";
  vocalBandFilter1.frequency.value = 600; // Lower male vocals
  vocalBandFilter1.Q.value = 0.5;
  
  // Stage 3: Second vocal band emphasis
  const vocalBandFilter2 = offlineContext.createBiquadFilter();
  vocalBandFilter2.type = "bandpass";
  vocalBandFilter2.frequency.value = 1200; // Mid-range vocals
  vocalBandFilter2.Q.value = 0.5;
  
  // Stage 4: Third vocal band emphasis
  const vocalBandFilter3 = offlineContext.createBiquadFilter();
  vocalBandFilter3.type = "bandpass";
  vocalBandFilter3.frequency.value = 2400; // Female vocals
  vocalBandFilter3.Q.value = 0.5;
  
  // Stage 5: Fourth vocal band emphasis
  const vocalBandFilter4 = offlineContext.createBiquadFilter();
  vocalBandFilter4.type = "bandpass";
  vocalBandFilter4.frequency.value = 3500; // Higher female vocals and sibilance
  vocalBandFilter4.Q.value = 0.5;
  
  // Stage 6: Low-pass to cut high frequencies
  const lowPassFilter = offlineContext.createBiquadFilter();
  lowPassFilter.type = "lowpass";
  lowPassFilter.frequency.value = 8000; // Upper limit of typical vocals
  lowPassFilter.Q.value = 0.7;
  
  // Stage 7: Filter to attenuate typical instrument frequencies
  const instrumentNotch1 = offlineContext.createBiquadFilter();
  instrumentNotch1.type = "notch";
  instrumentNotch1.frequency.value = 300; // Bass guitar/lower instruments
  instrumentNotch1.Q.value = 4;
  
  const instrumentNotch2 = offlineContext.createBiquadFilter();
  instrumentNotch2.type = "notch";
  instrumentNotch2.frequency.value = 5000; // Cymbals/high-hats
  instrumentNotch2.Q.value = 4;
  
  // Stage 8: Dynamic range compression to bring out vocals
  const compressor = offlineContext.createDynamicsCompressor();
  compressor.threshold.value = -30;
  compressor.knee.value = 10;
  compressor.ratio.value = 12;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;
  
  // Stage 9: Final boost
  const gainNode = offlineContext.createGain();
  gainNode.gain.value = 3.0; // Stronger boost for vocals
  
  // Connect all nodes in series
  initialProcessedSignal.connect(highPassFilter);
  highPassFilter.connect(vocalBandFilter1);
  vocalBandFilter1.connect(vocalBandFilter2);
  vocalBandFilter2.connect(vocalBandFilter3);
  vocalBandFilter3.connect(vocalBandFilter4);
  vocalBandFilter4.connect(lowPassFilter);
  lowPassFilter.connect(instrumentNotch1);
  instrumentNotch1.connect(instrumentNotch2);
  instrumentNotch2.connect(compressor);
  compressor.connect(gainNode);
  gainNode.connect(offlineContext.destination);

  // Start the source
  source.start(0);
  
  // Render the audio
  return await offlineContext.startRendering();
};

// Advanced instrumental isolation with spectral filtering
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

// AI-powered vocal isolation using spectral gating technique
export const processUltraAdvancedVocalIsolation = async (audioBuffer: AudioBuffer): Promise<AudioBuffer> => {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  const audioContext = new OfflineAudioContext(2, length, sampleRate);

  // Try to load the spectral gate AudioWorklet
  let workletLoaded = false;
  try {
    workletLoaded = await loadSpectralGateWorklet(audioContext);
  } catch (error) {
    console.error("Failed to load AudioWorklet:", error);
  }

  // Create a source node from the AudioBuffer.
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;

  // === MID/SIDE EXTRACTION ===
  if (numberOfChannels < 2) {
    console.warn("Stereo processing is optimal. Processing as mono.");
    
    // For mono signals, apply a direct filtering approach
    const highPass = audioContext.createBiquadFilter();
    highPass.type = "highpass";
    highPass.frequency.value = 180;
    
    const vocalBand = audioContext.createBiquadFilter();
    vocalBand.type = "bandpass";
    vocalBand.frequency.value = 2500;
    vocalBand.Q.value = 0.25;
    
    source.connect(highPass);
    highPass.connect(vocalBand);
    
    if (workletLoaded) {
      const spectralGateNode = new AudioWorkletNode(audioContext, 'spectral-gate-processor', {
        processorOptions: {
          threshold: 0.05,
          attack: 0.005,
          release: 0.1,
          frameSize: 1024
        }
      });
      vocalBand.connect(spectralGateNode);
      spectralGateNode.connect(audioContext.destination);
    } else {
      vocalBand.connect(audioContext.destination);
    }
  } else {
    const splitter = audioContext.createChannelSplitter(2);
    source.connect(splitter);

    const leftGain = audioContext.createGain();
    const rightGain = audioContext.createGain();
    splitter.connect(leftGain, 0);
    splitter.connect(rightGain, 1);

    // Create mid (L+R) and side (L-R) signals.
    const mergerMid = audioContext.createChannelMerger(1);
    leftGain.connect(mergerMid, 0, 0);
    rightGain.connect(mergerMid, 0, 0);
    const midGain = audioContext.createGain();
    midGain.gain.value = 0.5;
    mergerMid.connect(midGain);

    const rightInverter = audioContext.createGain();
    rightInverter.gain.value = -1;
    rightGain.connect(rightInverter);
    const mergerSide = audioContext.createChannelMerger(1);
    leftGain.connect(mergerSide, 0, 0);
    rightInverter.connect(mergerSide, 0, 0);
    const sideGain = audioContext.createGain();
    sideGain.gain.value = 0.5;
    mergerSide.connect(sideGain);

    // Extract only the mid channel (where vocals primarily reside)
    const vocalBandPass = audioContext.createBiquadFilter();
    vocalBandPass.type = "bandpass";
    vocalBandPass.frequency.value = 2500;
    vocalBandPass.Q.value = 0.25;
    
    midGain.connect(vocalBandPass);
    
    // Apply additional vocal enhancements
    const presenceBoost = audioContext.createBiquadFilter();
    presenceBoost.type = "peaking";
    presenceBoost.frequency.value = 3500;
    presenceBoost.Q.value = 1;
    presenceBoost.gain.value = 12;
    
    vocalBandPass.connect(presenceBoost);
    
    // Create a stereo output from the mono vocal signal
    const merger = audioContext.createChannelMerger(2);
    
    if (workletLoaded) {
      // Use the AudioWorklet for spectral gating if available
      const spectralGateNode = new AudioWorkletNode(audioContext, 'spectral-gate-processor', {
        processorOptions: {
          threshold: 0.05,
          attack: 0.005,
          release: 0.1,
          frameSize: 1024
        }
      });
      presenceBoost.connect(spectralGateNode);
      spectralGateNode.connect(merger, 0, 0);
      spectralGateNode.connect(merger, 0, 1);
    } else {
      // Fallback if AudioWorklet is not supported
      presenceBoost.connect(merger, 0, 0);
      presenceBoost.connect(merger, 0, 1);
    }
    
    merger.connect(audioContext.destination);
  }

  source.start(0);
  return await audioContext.startRendering();
};

// New a cappella extraction with spectral gating
export const processAdvancedVocalExtraction = async (audioBuffer: AudioBuffer): Promise<AudioBuffer> => {
  // We'll use the ultra advanced function for this
  return processUltraAdvancedVocalIsolation(audioBuffer);
};
