import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  type AudioStatus,
} from "expo-audio";
import { Alert } from "react-native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import {
  cleanTrackName,
  getNextTrackIndex,
  getPreviousTrackIndex,
  isSupportedAudioFile,
} from "@/lib/player-utils";

const SETTINGS_KEY = "vin-player.settings.v1";

export type Track = {
  id: string;
  name: string;
  title: string;
  uri: string;
  mimeType?: string;
  size?: number;
};

type Preferences = {
  volume: number;
  speed: number;
  shuffle: boolean;
  repeat: boolean;
};

type PlayerContextValue = {
  currentIndex: number;
  currentTrack: Track | null;
  isReady: boolean;
  pickTracks: () => Promise<void>;
  playTrack: (index: number, autoplay?: boolean) => void;
  previousTrack: () => void;
  nextTrack: () => void;
  removeTrack: (index: number) => void;
  seekTo: (seconds: number) => Promise<void>;
  setPreferences: (patch: Partial<Preferences>) => void;
  status: AudioStatus;
  togglePlayback: () => void;
  tracks: Track[];
  preferences: Preferences;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

const DEFAULT_PREFERENCES: Preferences = {
  volume: 0.8,
  speed: 1,
  shuffle: false,
  repeat: false,
};

export function PlayerProvider({ children }: PropsWithChildren) {
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [preferences, setStoredPreferences] = useState(DEFAULT_PREFERENCES);
  const [isReady, setIsReady] = useState(false);
  const finishGuard = useRef<string | null>(null);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true });
  }, []);

  useEffect(() => {
    let active = true;

    void AsyncStorage.getItem(SETTINGS_KEY)
      .then((saved) => {
        if (!saved || !active) {
          return;
        }

        const parsed = JSON.parse(saved) as Partial<Preferences>;
        setStoredPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setIsReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    player.volume = preferences.volume;
    player.playbackRate = preferences.speed;
    player.loop = false;

    if (isReady) {
      void AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(preferences));
    }
  }, [isReady, player, preferences]);

  const setPreferences = useCallback((patch: Partial<Preferences>) => {
    setStoredPreferences((current) => ({ ...current, ...patch }));
  }, []);

  const activateTrack = useCallback(
    (track: Track, index: number, autoplay = true) => {
      finishGuard.current = null;
      player.pause();
      player.replace({ uri: track.uri });
      player.volume = preferences.volume;
      player.playbackRate = preferences.speed;
      player.loop = false;
      setCurrentIndex(index);

      if (autoplay) {
        setTimeout(() => player.play(), 90);
      }
    },
    [player, preferences.speed, preferences.volume],
  );

  const playTrack = useCallback(
    (index: number, autoplay = true) => {
      const track = tracks[index];
      if (track) {
        activateTrack(track, index, autoplay);
      }
    },
    [activateTrack, tracks],
  );

  const nextTrack = useCallback(() => {
    const nextIndex = getNextTrackIndex(currentIndex, tracks.length, preferences.shuffle);
    const next = tracks[nextIndex];
    if (next) {
      activateTrack(next, nextIndex);
    }
  }, [activateTrack, currentIndex, preferences.shuffle, tracks]);

  const previousTrack = useCallback(() => {
    if (status.currentTime > 3) {
      void player.seekTo(0);
      return;
    }

    const previousIndex = getPreviousTrackIndex(currentIndex, tracks.length);
    const previous = tracks[previousIndex];
    if (previous) {
      activateTrack(previous, previousIndex);
    }
  }, [activateTrack, currentIndex, player, status.currentTime, tracks]);

  const togglePlayback = useCallback(() => {
    if (currentIndex < 0) {
      if (tracks[0]) {
        activateTrack(tracks[0], 0);
      }
      return;
    }

    if (status.playing) {
      player.pause();
      return;
    }

    if (status.duration > 0 && status.currentTime >= status.duration) {
      void player.seekTo(0).then(() => player.play());
      return;
    }

    player.play();
  }, [activateTrack, currentIndex, player, status.currentTime, status.duration, status.playing, tracks]);

  const pickTracks = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const additions = result.assets
        .filter((asset) => isSupportedAudioFile(asset.name, asset.mimeType))
        .map((asset) => ({
          id: `${asset.name}_${asset.size ?? 0}_${asset.uri}`,
          name: asset.name,
          title: cleanTrackName(asset.name) || asset.name,
          uri: asset.uri,
          mimeType: asset.mimeType ?? undefined,
          size: asset.size,
        }));

      const uniqueAdditions = additions.filter(
        (candidate) => !tracks.some((track) => track.id === candidate.id),
      );

      if (uniqueAdditions.length === 0) {
        Alert.alert("No new audio added", "Choose MP3, M4A, WAV, FLAC, OGG, or another supported audio file.");
        return;
      }

      const nextTracks = [...tracks, ...uniqueAdditions];
      setTracks(nextTracks);

      if (currentIndex === -1) {
        activateTrack(nextTracks[0], 0, false);
      }
    } catch {
      Alert.alert("Could not add music", "Vin Player could not open the selected audio files.");
    }
  }, [activateTrack, currentIndex, tracks]);

  const removeTrack = useCallback(
    (index: number) => {
      const nextTracks = tracks.filter((_, itemIndex) => itemIndex !== index);

      if (index === currentIndex) {
        const wasPlaying = status.playing;
        const replacementIndex = Math.min(index, nextTracks.length - 1);
        setTracks(nextTracks);

        if (replacementIndex >= 0) {
          activateTrack(nextTracks[replacementIndex], replacementIndex, wasPlaying);
        } else {
          player.pause();
          player.replace(null);
          setCurrentIndex(-1);
        }
        return;
      }

      setTracks(nextTracks);
      if (index < currentIndex) {
        setCurrentIndex((value) => value - 1);
      }
    },
    [activateTrack, currentIndex, player, status.playing, tracks],
  );

  useEffect(() => {
    const finishedTrack = tracks[currentIndex];
    if (!status.didJustFinish || !finishedTrack || finishGuard.current === finishedTrack.id) {
      return;
    }

    finishGuard.current = finishedTrack.id;
    if (preferences.repeat) {
      void player.seekTo(0).then(() => player.play());
    } else {
      nextTrack();
    }

    const timeout = setTimeout(() => {
      finishGuard.current = null;
    }, 500);

    return () => clearTimeout(timeout);
  }, [currentIndex, nextTrack, player, preferences.repeat, status.didJustFinish, tracks]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      currentIndex,
      currentTrack: tracks[currentIndex] ?? null,
      isReady,
      nextTrack,
      pickTracks,
      playTrack,
      preferences,
      previousTrack,
      removeTrack,
      seekTo: (seconds) => player.seekTo(seconds),
      setPreferences,
      status,
      togglePlayback,
      tracks,
    }),
    [
      currentIndex,
      isReady,
      nextTrack,
      pickTracks,
      playTrack,
      player,
      preferences,
      previousTrack,
      removeTrack,
      setPreferences,
      status,
      togglePlayback,
      tracks,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function useVinPlayer(): PlayerContextValue {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("useVinPlayer must be used within PlayerProvider");
  }
  return context;
}
