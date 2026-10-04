"use client";

// Turns a browser recording (WebM/MP4, depending on the browser) into the MP3 the
// lessons expect: mono, silence trimmed from both ends, volume evened out.
import { Mp3Encoder } from "@breezystack/lamejs";

const KBPS = 96;
const PAD_START_S = 0.12;
const PAD_END_S = 0.2;
const TARGET_PEAK = 0.9;
const MAX_GAIN = 4;

function toMono(buffer: AudioBuffer): Float32Array {
  const out = new Float32Array(buffer.length);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) out[i] += data[i] / buffer.numberOfChannels;
  }
  return out;
}

function peakOf(samples: Float32Array): number {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
  return peak;
}

/** Cut leading and trailing silence, keeping a little air around the sound. */
function trim(samples: Float32Array, sampleRate: number): Float32Array {
  const peak = peakOf(samples);
  const threshold = Math.max(0.01, peak * 0.08);
  let first = samples.findIndex((s) => Math.abs(s) > threshold);
  if (first === -1) return samples;
  let last = samples.length - 1;
  while (last > first && Math.abs(samples[last]) <= threshold) last--;
  first = Math.max(0, first - Math.round(PAD_START_S * sampleRate));
  last = Math.min(samples.length - 1, last + Math.round(PAD_END_S * sampleRate));
  return samples.slice(first, last + 1);
}

function normalize(samples: Float32Array): Float32Array {
  const peak = peakOf(samples);
  if (peak === 0) return samples;
  const gain = Math.min(TARGET_PEAK / peak, MAX_GAIN);
  return samples.map((s) => s * gain);
}

export async function recordingToMp3(recording: Blob): Promise<{ mp3: Blob; seconds: number; silent: boolean }> {
  const ctx = new AudioContext();
  try {
    const decoded = await ctx.decodeAudioData(await recording.arrayBuffer());
    const mono = toMono(decoded);
    const peak = peakOf(mono);
    const samples = normalize(trim(mono, decoded.sampleRate));

    const pcm = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    const encoder = new Mp3Encoder(1, decoded.sampleRate, KBPS);
    const parts: Uint8Array[] = [];
    for (let i = 0; i < pcm.length; i += 1152) {
      const chunk = encoder.encodeBuffer(pcm.subarray(i, i + 1152));
      if (chunk.length) parts.push(chunk);
    }
    const end = encoder.flush();
    if (end.length) parts.push(end);

    return {
      mp3: new Blob(parts as BlobPart[], { type: "audio/mpeg" }),
      seconds: samples.length / decoded.sampleRate,
      silent: peak < 0.01,
    };
  } finally {
    ctx.close();
  }
}
