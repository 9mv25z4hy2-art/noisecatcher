// YAMNet sound classification via TensorFlow.js
// Model: https://tfhub.dev/google/tfjs-model/yamnet/tfjs/1
// Lazy-loaded on first use to avoid bloating the initial bundle.
// YAMNet expects 16 kHz mono audio; we resample from AudioBuffer automatically.

import { YAMNET_CLASSES } from "./yamnetClasses";

export interface ClassificationResult {
  label: string;
  score: number;  // 0–1 confidence
  index: number;
}

// Module-level cache — only load once per session
let tf: typeof import("@tensorflow/tfjs") | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let model: any = null;
let loading = false;

async function getTF() {
  if (!tf) tf = await import("@tensorflow/tfjs");
  await tf.ready();
  return tf;
}

export type YAMNetStatus = "idle" | "loading-tf" | "loading-model" | "ready" | "error";

export async function loadYAMNet(onStatus?: (s: YAMNetStatus) => void): Promise<void> {
  if (model) return;
  if (loading) return;
  loading = true;
  try {
    onStatus?.("loading-tf");
    const tfLib = await getTF();
    onStatus?.("loading-model");
    model = await tfLib.loadGraphModel(
      "https://tfhub.dev/google/tfjs-model/yamnet/tfjs/1",
      { fromTFHub: true }
    );
    loading = false;
    onStatus?.("ready");
  } catch (e) {
    loading = false;
    onStatus?.("error");
    throw e;
  }
}

/** Resample AudioBuffer to 16 kHz mono Float32Array using OfflineAudioContext. */
async function resampleTo16kHz(audioBuffer: AudioBuffer): Promise<Float32Array> {
  const TARGET_SR = 16000;
  const duration = audioBuffer.duration;
  if (duration < 0.1) throw new Error("Audio too short for YAMNet (min 0.1s)");
  const targetLength = Math.ceil(duration * TARGET_SR);
  const offCtx = new OfflineAudioContext(1, targetLength, TARGET_SR);
  const src = offCtx.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(offCtx.destination);
  src.start();
  const rendered = await offCtx.startRendering();
  return rendered.getChannelData(0);
}

/**
 * Classify an AudioBuffer and return top-N predictions.
 * Loads TF.js and the model on first call (~10 MB download).
 */
export async function classify(
  audioBuffer: AudioBuffer,
  topN = 10
): Promise<ClassificationResult[]> {
  if (!model) throw new Error("Call loadYAMNet() first");

  const tfLib = await getTF();
  const samples = await resampleTo16kHz(audioBuffer);

  const inputTensor = tfLib.tensor1d(samples);
  // YAMNet returns [scores, embeddings, log_mel_spectrogram]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const outputs = model.predict(inputTensor) as any[];
  const scoresTensor = Array.isArray(outputs) ? outputs[0] : outputs;
  const scoresRaw = (await scoresTensor.array()) as number[][];

  inputTensor.dispose();
  if (Array.isArray(outputs)) outputs.forEach((t) => t.dispose?.());

  // Average scores across all YAMNet patches
  const numClasses = scoresRaw[0]?.length ?? 0;
  const numPatches = scoresRaw.length;
  const avgScores = new Float32Array(numClasses);
  for (let c = 0; c < numClasses; c++) {
    let sum = 0;
    for (let p = 0; p < numPatches; p++) sum += scoresRaw[p][c];
    avgScores[c] = sum / numPatches;
  }

  return Array.from(avgScores)
    .map((score, index) => ({
      label: YAMNET_CLASSES[index] ?? `Class ${index}`,
      score: Math.round(score * 1000) / 1000,
      index,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

/** Classify a short Float32Array already at 16 kHz (for live measurement). */
export async function classifyRaw(samples: Float32Array, topN = 5): Promise<ClassificationResult[]> {
  if (!model) throw new Error("Call loadYAMNet() first");
  const tfLib = await getTF();

  const inputTensor = tfLib.tensor1d(samples);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const outputs = model.predict(inputTensor) as any[];
  const scoresTensor = Array.isArray(outputs) ? outputs[0] : outputs;
  const scoresRaw = (await scoresTensor.array()) as number[][];

  inputTensor.dispose();
  if (Array.isArray(outputs)) outputs.forEach((t) => t.dispose?.());

  const numClasses = scoresRaw[0]?.length ?? 0;
  const numPatches = scoresRaw.length;
  const avg = new Float32Array(numClasses);
  for (let c = 0; c < numClasses; c++) {
    let sum = 0;
    for (let p = 0; p < numPatches; p++) sum += scoresRaw[p][c];
    avg[c] = sum / numPatches;
  }

  return Array.from(avg)
    .map((score, index) => ({ label: YAMNET_CLASSES[index] ?? `Class ${index}`, score, index }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
