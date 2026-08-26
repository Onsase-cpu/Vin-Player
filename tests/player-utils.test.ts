import { describe, expect, it } from "vitest";

import {
  cleanTrackName,
  formatPlaybackTime,
  getNextTrackIndex,
  getPreviousTrackIndex,
  isSupportedAudioFile,
} from "../lib/player-utils";

describe("Vin Player utility functions", () => {
  it("creates readable names from common local audio filenames", () => {
    expect(cleanTrackName("my_favorite-track.mp3")).toBe("my favorite track");
    expect(cleanTrackName("podcast.episode.01.m4a")).toBe("podcast.episode.01");
  });

  it("accepts known audio MIME types and common extensions", () => {
    expect(isSupportedAudioFile("voice-note.bin", "audio/mpeg")).toBe(true);
    expect(isSupportedAudioFile("song.FLAC")).toBe(true);
    expect(isSupportedAudioFile("photo.jpg", "image/jpeg")).toBe(false);
  });

  it("formats player times safely", () => {
    expect(formatPlaybackTime(0)).toBe("0:00");
    expect(formatPlaybackTime(125)).toBe("2:05");
    expect(formatPlaybackTime(Number.NaN)).toBe("0:00");
  });

  it("wraps queue navigation and chooses a different shuffled track", () => {
    expect(getNextTrackIndex(2, 3, false)).toBe(0);
    expect(getPreviousTrackIndex(0, 3)).toBe(2);
    expect(getNextTrackIndex(1, 4, true, () => 0)).toBe(2);
    expect(getNextTrackIndex(1, 4, true, () => 0.99)).toBe(0);
  });
});
