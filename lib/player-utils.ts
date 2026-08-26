export const AUDIO_EXTENSIONS = new Set([
  "aac",
  "flac",
  "m4a",
  "mp3",
  "oga",
  "ogg",
  "opus",
  "wav",
  "webm",
]);

export function cleanTrackName(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isSupportedAudioFile(name: string, mimeType?: string | null): boolean {
  if (mimeType?.startsWith("audio/")) {
    return true;
  }

  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  return AUDIO_EXTENSIONS.has(extension);
}

export function formatPlaybackTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function getNextTrackIndex(
  currentIndex: number,
  count: number,
  shuffle: boolean,
  random = Math.random,
): number {
  if (count <= 0) {
    return -1;
  }

  if (currentIndex < 0 || currentIndex >= count) {
    return 0;
  }

  if (shuffle && count > 1) {
    const offset = 1 + Math.floor(random() * (count - 1));
    return (currentIndex + offset) % count;
  }

  return (currentIndex + 1) % count;
}

export function getPreviousTrackIndex(currentIndex: number, count: number): number {
  if (count <= 0) {
    return -1;
  }

  if (currentIndex <= 0 || currentIndex >= count) {
    return count - 1;
  }

  return currentIndex - 1;
}
