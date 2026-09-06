/**
 * Browser-side audio chunker using the Web Audio API.
 *
 * Decodes ANY format the browser natively supports:
 *   Chrome  : M4A/AAC, MP3, WAV, WebM, OGG, FLAC, AIFF
 *   Safari  : M4A/AAC, MP3, WAV, FLAC, AIFF
 *   Firefox : MP3, WAV, WebM, OGG, FLAC  (M4A partial)
 *
 * Output: array of 16 kHz mono WAV data-URLs, each ≤ ~10 MB —
 * well within OpenAI Whisper's 25 MB per-request limit.
 */

/** Seconds of audio per WAV chunk sent to Whisper. */
const CHUNK_DURATION_SEC = 5 * 60; // 5 minutes

/** Target sample rate for speech recognition — 16 kHz is ideal. */
const TARGET_SAMPLE_RATE = 16_000;

export interface ChunkProgressEvent {
  stage: "decoding" | "resampling" | "encoding";
  chunkIndex: number;   // 0-based
  totalChunks: number;
}

export interface AudioChunkResult {
  /** data:audio/wav;base64,… strings ready to send to process-audio */
  chunks: string[];
  /** Total duration of the audio in seconds */
  totalDurationSec: number;
  /** Sample rate actually used (may differ from target on some browsers) */
  sampleRate: number;
}

/**
 * Decode and split an audio File into WAV chunks suitable for Whisper.
 * @param file     Any audio file the browser can decode
 * @param onProgress  Optional progress callback
 */
export async function chunkAudioFile(
  file: File,
  onProgress?: (event: ChunkProgressEvent) => void
): Promise<AudioChunkResult> {
  // ── 1. Read file bytes ──────────────────────────────────────────────────
  const arrayBuffer = await file.arrayBuffer();

  // ── 2. Decode to AudioBuffer (browser codec handles every format) ───────
  onProgress?.({ stage: "decoding", chunkIndex: 0, totalChunks: 1 });
  const tmpCtx = new AudioContext();
  let decoded: AudioBuffer;
  try {
    decoded = await tmpCtx.decodeAudioData(arrayBuffer);
  } catch (err: any) {
    throw new Error(
      `Your browser cannot decode this audio format. ` +
      `Please convert to MP3 or WAV and try again. (${err?.message ?? err})`
    );
  } finally {
    await tmpCtx.close();
  }

  const totalDurationSec = decoded.duration;

  // ── 3. Resample & downmix to 16 kHz mono via OfflineAudioContext ─────────
  // Try 16 kHz first; fall back to 22 050 Hz if the browser rejects it
  // (Firefox historically had issues with non-standard rates, but 16 kHz
  // is now broadly supported — the try/catch is a safety net).
  onProgress?.({ stage: "resampling", chunkIndex: 0, totalChunks: 1 });
  let targetRate = TARGET_SAMPLE_RATE;
  let resampled: AudioBuffer;

  for (const rate of [16_000, 22_050, 44_100]) {
    try {
      const totalSamples = Math.ceil(totalDurationSec * rate);
      const offCtx = new OfflineAudioContext(1, totalSamples, rate);
      const src = offCtx.createBufferSource();
      src.buffer = decoded;
      src.connect(offCtx.destination);
      src.start(0);
      resampled = await offCtx.startRendering();
      targetRate = rate;
      break;
    } catch {
      if (rate === 44_100) {
        // All rates failed — shouldn't happen, but surface a clear error
        throw new Error("Audio resampling failed in your browser. Please try Chrome or Safari.");
      }
    }
  }

  // ── 4. Split into N × 5-minute WAV chunks ───────────────────────────────
  const chunkSamples = Math.floor(CHUNK_DURATION_SEC * targetRate);
  const totalSamples = resampled!.length;
  const totalChunks = Math.ceil(totalSamples / chunkSamples);
  const channelData = resampled!.getChannelData(0);

  const chunks: string[] = [];
  for (let i = 0; i < totalChunks; i++) {
    onProgress?.({ stage: "encoding", chunkIndex: i, totalChunks });

    const start = i * chunkSamples;
    const end = Math.min(start + chunkSamples, totalSamples);
    const pcm = channelData.slice(start, end);
    const wav = pcmToWAV(pcm, targetRate);
    const dataUrl = await blobToDataURL(wav);
    chunks.push(dataUrl);
  }

  return { chunks, totalDurationSec, sampleRate: targetRate };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a minimal RIFF/PCM WAV Blob from a Float32 PCM array.
 * Output is 16-bit signed integer, mono, at the given sample rate.
 *
 * WAV size for 5 min @ 16 kHz mono:
 *   5 × 60 × 16 000 × 2 bytes = 9.6 MB  →  base64 ≈ 12.8 MB  (< 25 MB limit ✓)
 */
function pcmToWAV(pcm: Float32Array, sampleRate: number): Blob {
  const numSamples = pcm.length;
  const bytesPerSample = 2; // 16-bit
  const dataSize = numSamples * bytesPerSample;
  const buf = new ArrayBuffer(44 + dataSize);
  const v = new DataView(buf);

  const str = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i));
  };

  str(0, "RIFF");
  v.setUint32(4, 36 + dataSize, true);
  str(8, "WAVE");
  str(12, "fmt ");
  v.setUint32(16, 16, true);                              // fmt chunk size
  v.setUint16(20, 1, true);                               // PCM
  v.setUint16(22, 1, true);                               // channels: mono
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * bytesPerSample, true);     // byte rate
  v.setUint16(32, bytesPerSample, true);                  // block align
  v.setUint16(34, 16, true);                              // bits/sample
  str(36, "data");
  v.setUint32(40, dataSize, true);

  // Float32 → Int16 PCM
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i]));
    v.setInt16(44 + i * bytesPerSample, Math.round(s * 32_767), true);
  }

  return new Blob([buf], { type: "audio/wav" });
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
