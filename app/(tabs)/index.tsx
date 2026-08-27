import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";
import { useState } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { useVinPlayer } from "@/components/player-context";
import { formatPlaybackTime } from "@/lib/player-utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function PlayerScreen() {
  const router = useRouter();
  const {
    currentTrack,
    isReady,
    nextTrack,
    pickTracks,
    preferences,
    previousTrack,
    seekTo,
    setPreferences,
    status,
    togglePlayback,
    tracks,
  } = useVinPlayer();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);

  const duration = Number.isFinite(status.duration) ? status.duration : 0;
  const currentTime = Number.isFinite(status.currentTime) ? status.currentTime : 0;
  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  const handleSeek = (event: GestureResponderEvent) => {
    if (duration <= 0 || progressWidth <= 0) {
      return;
    }

    const target = Math.min(Math.max(event.nativeEvent.locationX / progressWidth, 0), 1) * duration;
    void seekTo(target);
  };

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.kicker}>VIN PLAYER</Text>
            <Text style={styles.tagline}>Your music. Your device.</Text>
          </View>
          <Pressable onPress={pickTracks} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
            <MaterialIcons color="#102016" name="add" size={19} />
            <Text style={styles.addButtonText}>Add Music</Text>
          </Pressable>
        </View>

        <View style={styles.artworkShell}>
          <View style={styles.artworkGlow} />
          <Image source={require("../../assets/images/icon.png")} style={styles.artwork} />
          <View style={styles.vinylRingOne} />
          <View style={styles.vinylRingTwo} />
        </View>

        <View style={styles.trackInfo}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, status.playing ? styles.statusPlaying : styles.statusPaused]} />
            <Text style={styles.statusText}>{status.playing ? "NOW PLAYING" : currentTrack ? "READY TO PLAY" : "LOCAL MUSIC PLAYER"}</Text>
          </View>
          <Text numberOfLines={2} style={styles.trackTitle}>
            {currentTrack?.title ?? "No track selected"}
          </Text>
          <Text numberOfLines={1} style={styles.trackSubtitle}>
            {currentTrack?.name ?? "Add music from your Android device to begin"}
          </Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.timeRow}>
            <Text style={styles.time}>{formatPlaybackTime(currentTime)}</Text>
            <Text style={styles.time}>{formatPlaybackTime(duration)}</Text>
          </View>
          <Pressable
            accessibilityLabel="Seek through current track"
            onLayout={(event) => setProgressWidth(event.nativeEvent.layout.width)}
            onPress={handleSeek}
            style={styles.progressTrack}
          >
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
            <View style={[styles.progressThumb, { left: `${progress}%` }]} />
          </Pressable>
        </View>

        <View style={styles.controls}>
          <Pressable accessibilityLabel="Previous track" onPress={previousTrack} style={({ pressed }) => [styles.controlButton, pressed && styles.pressed]}>
            <MaterialIcons color="#dce8df" name="skip-previous" size={31} />
          </Pressable>
          <Pressable
            accessibilityLabel={status.playing ? "Pause" : "Play"}
            onPress={togglePlayback}
            style={({ pressed }) => [styles.playButton, pressed && styles.playPressed]}
          >
            <MaterialIcons color="#0e1711" name={status.playing ? "pause" : "play-arrow"} size={39} />
          </Pressable>
          <Pressable accessibilityLabel="Next track" onPress={nextTrack} style={({ pressed }) => [styles.controlButton, pressed && styles.pressed]}>
            <MaterialIcons color="#dce8df" name="skip-next" size={31} />
          </Pressable>
        </View>

        <View style={styles.quickActions}>
          <Pressable
            onPress={() => setPreferences({ shuffle: !preferences.shuffle })}
            style={({ pressed }) => [styles.quickAction, preferences.shuffle && styles.quickActionActive, pressed && styles.pressed]}
          >
            <MaterialIcons color={preferences.shuffle ? "#0d2214" : "#cbd9ce"} name="shuffle" size={19} />
            <Text style={[styles.quickActionText, preferences.shuffle && styles.quickActionTextActive]}>Shuffle</Text>
          </Pressable>
          <Pressable onPress={() => setIsOptionsOpen(true)} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
            <MaterialIcons color="#cbd9ce" name="tune" size={19} />
            <Text style={styles.quickActionText}>Sound</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/(tabs)/library")} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
            <MaterialIcons color="#cbd9ce" name="queue-music" size={19} />
            <Text style={styles.quickActionText}>Library</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push("/(tabs)/library")} style={({ pressed }) => [styles.libraryPreview, pressed && styles.pressed]}>
          <View style={styles.previewIcon}>
            <MaterialIcons color="#76e29b" name="library-music" size={22} />
          </View>
          <View style={styles.previewCopy}>
            <Text style={styles.previewTitle}>{tracks.length === 1 ? "1 song in your library" : `${tracks.length} songs in your library`}</Text>
            <Text style={styles.previewSubtitle}>{tracks.length ? "Open your queue and choose a track" : "Your selected music stays on this device"}</Text>
          </View>
          <MaterialIcons color="#9daaa1" name="chevron-right" size={24} />
        </Pressable>

        {!isReady ? <Text style={styles.loadingText}>Loading your player preferences…</Text> : null}
      </ScrollView>

      <Modal animationType="slide" onRequestClose={() => setIsOptionsOpen(false)} transparent visible={isOptionsOpen}>
        <Pressable onPress={() => setIsOptionsOpen(false)} style={styles.modalBackdrop}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetTitleRow}>
              <View>
                <Text style={styles.sheetKicker}>LISTENING CONTROLS</Text>
                <Text style={styles.sheetTitle}>Sound settings</Text>
              </View>
              <Pressable onPress={() => setIsOptionsOpen(false)} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <MaterialIcons color="#dce8df" name="close" size={22} />
              </Pressable>
            </View>

            <View style={styles.settingBlock}>
              <View style={styles.settingLabelRow}>
                <Text style={styles.settingLabel}>Volume</Text>
                <Text style={styles.settingValue}>{Math.round(preferences.volume * 100)}%</Text>
              </View>
              <View style={styles.volumeControls}>
                <Pressable onPress={() => setPreferences({ volume: Math.max(0, Number((preferences.volume - 0.1).toFixed(2))) })} style={({ pressed }) => [styles.stepper, pressed && styles.pressed]}>
                  <MaterialIcons color="#dce8df" name="remove" size={20} />
                </Pressable>
                <View style={styles.volumeMeter}>
                  <View style={[styles.volumeFill, { width: `${preferences.volume * 100}%` }]} />
                </View>
                <Pressable onPress={() => setPreferences({ volume: Math.min(1, Number((preferences.volume + 0.1).toFixed(2))) })} style={({ pressed }) => [styles.stepper, pressed && styles.pressed]}>
                  <MaterialIcons color="#dce8df" name="add" size={20} />
                </Pressable>
              </View>
            </View>

            <View style={styles.settingBlock}>
              <Text style={styles.settingLabel}>Playback speed</Text>
              <View style={styles.speedGrid}>
                {SPEEDS.map((speed) => (
                  <Pressable
                    key={speed}
                    onPress={() => setPreferences({ speed })}
                    style={({ pressed }) => [styles.speedChip, preferences.speed === speed && styles.speedChipActive, pressed && styles.pressed]}
                  >
                    <Text style={[styles.speedChipText, preferences.speed === speed && styles.speedChipTextActive]}>{speed}×</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={() => setPreferences({ repeat: !preferences.repeat })}
              style={({ pressed }) => [styles.repeatRow, preferences.repeat && styles.repeatRowActive, pressed && styles.pressed]}
            >
              <MaterialIcons color={preferences.repeat ? "#0d2214" : "#dce8df"} name="repeat-one" size={22} />
              <Text style={[styles.repeatText, preferences.repeat && styles.repeatTextActive]}>Repeat current track</Text>
              <MaterialIcons color={preferences.repeat ? "#0d2214" : "#9daaa1"} name={preferences.repeat ? "check-circle" : "radio-button-unchecked"} size={21} />
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  addButton: { alignItems: "center", backgroundColor: "#76e29b", borderRadius: 999, flexDirection: "row", gap: 5, minHeight: 42, paddingHorizontal: 14 },
  addButtonText: { color: "#102016", fontSize: 13, fontWeight: "800" },
  artwork: { borderRadius: 112, height: 212, width: 212 },
  artworkGlow: { backgroundColor: "#0b7a53", borderRadius: 160, height: 242, opacity: 0.22, position: "absolute", width: 242 },
  artworkShell: { alignItems: "center", justifyContent: "center", marginBottom: 24, marginTop: 30, minHeight: 250 },
  closeButton: { alignItems: "center", backgroundColor: "#263027", borderRadius: 999, height: 40, justifyContent: "center", width: 40 },
  controlButton: { alignItems: "center", height: 56, justifyContent: "center", width: 62 },
  controls: { alignItems: "center", flexDirection: "row", gap: 22, justifyContent: "center", marginBottom: 25 },
  kicker: { color: "#76e29b", fontSize: 12, fontWeight: "900", letterSpacing: 1.4 },
  libraryPreview: { alignItems: "center", backgroundColor: "#19221b", borderColor: "#2c372e", borderRadius: 20, borderWidth: 1, flexDirection: "row", marginTop: 26, minHeight: 80, paddingHorizontal: 14 },
  loadingText: { color: "#859188", fontSize: 12, marginBottom: 20, marginTop: 14, textAlign: "center" },
  modalBackdrop: { backgroundColor: "rgba(0,0,0,0.58)", flex: 1, justifyContent: "flex-end" },
  playButton: { alignItems: "center", backgroundColor: "#76e29b", borderRadius: 999, height: 70, justifyContent: "center", width: 70 },
  playPressed: { opacity: 0.94, transform: [{ scale: 0.96 }] },
  previewCopy: { flex: 1, marginHorizontal: 12 },
  previewIcon: { alignItems: "center", backgroundColor: "#213525", borderRadius: 14, height: 46, justifyContent: "center", width: 46 },
  previewSubtitle: { color: "#96a199", fontSize: 12, lineHeight: 17, marginTop: 2 },
  previewTitle: { color: "#e7f1e9", fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.7 },
  progressFill: { backgroundColor: "#76e29b", borderRadius: 4, height: 5, left: 0, position: "absolute", top: 0 },
  progressSection: { marginTop: 29 },
  progressThumb: { backgroundColor: "#e1f2e5", borderRadius: 8, height: 13, marginLeft: -6, position: "absolute", top: -4, width: 13 },
  progressTrack: { backgroundColor: "#344038", borderRadius: 4, height: 5, marginTop: 8, width: "100%" },
  quickAction: { alignItems: "center", borderColor: "#2d392f", borderRadius: 15, borderWidth: 1, flex: 1, flexDirection: "row", gap: 6, justifyContent: "center", minHeight: 44 },
  quickActionActive: { backgroundColor: "#76e29b", borderColor: "#76e29b" },
  quickActionText: { color: "#cbd9ce", fontSize: 12, fontWeight: "700" },
  quickActionTextActive: { color: "#0d2214" },
  quickActions: { flexDirection: "row", gap: 9 },
  repeatRow: { alignItems: "center", backgroundColor: "#202b22", borderColor: "#354137", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 11, marginTop: 24, minHeight: 58, paddingHorizontal: 16 },
  repeatRowActive: { backgroundColor: "#76e29b", borderColor: "#76e29b" },
  repeatText: { color: "#dce8df", flex: 1, fontSize: 14, fontWeight: "700" },
  repeatTextActive: { color: "#0d2214" },
  scrollContent: { paddingBottom: 28 },
  settingBlock: { marginTop: 24 },
  settingLabel: { color: "#dce8df", fontSize: 14, fontWeight: "700" },
  settingLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  settingValue: { color: "#76e29b", fontSize: 14, fontWeight: "800" },
  sheet: { backgroundColor: "#172019", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 32, paddingHorizontal: 22, paddingTop: 10 },
  sheetHandle: { alignSelf: "center", backgroundColor: "#566058", borderRadius: 99, height: 4, width: 42 },
  sheetKicker: { color: "#76e29b", fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  sheetTitle: { color: "#eff7f0", fontSize: 22, fontWeight: "800", marginTop: 3 },
  sheetTitleRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  speedChip: { alignItems: "center", borderColor: "#38443a", borderRadius: 12, borderWidth: 1, minWidth: 48, paddingHorizontal: 10, paddingVertical: 10 },
  speedChipActive: { backgroundColor: "#76e29b", borderColor: "#76e29b" },
  speedChipText: { color: "#c9d6cc", fontSize: 13, fontWeight: "800" },
  speedChipTextActive: { color: "#102016" },
  speedGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  statusDot: { borderRadius: 99, height: 7, width: 7 },
  statusPaused: { backgroundColor: "#778178" },
  statusPlaying: { backgroundColor: "#76e29b" },
  statusRow: { alignItems: "center", flexDirection: "row", gap: 7, justifyContent: "center" },
  statusText: { color: "#8b978e", fontSize: 11, fontWeight: "900", letterSpacing: 1.15 },
  stepper: { alignItems: "center", backgroundColor: "#2b352d", borderRadius: 12, height: 40, justifyContent: "center", width: 40 },
  tagline: { color: "#9ca99f", fontSize: 12, marginTop: 3 },
  time: { color: "#93a097", fontSize: 12, fontVariant: ["tabular-nums"], fontWeight: "700" },
  timeRow: { flexDirection: "row", justifyContent: "space-between" },
  topRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  trackInfo: { alignItems: "center" },
  trackSubtitle: { color: "#98a39b", fontSize: 13, marginTop: 8, textAlign: "center" },
  trackTitle: { color: "#f0f7f1", fontSize: 26, fontWeight: "800", lineHeight: 33, marginTop: 9, textAlign: "center" },
  vinylRingOne: { borderColor: "rgba(210,238,216,0.22)", borderRadius: 125, borderWidth: 1, height: 228, position: "absolute", width: 228 },
  vinylRingTwo: { borderColor: "rgba(210,238,216,0.12)", borderRadius: 136, borderWidth: 1, height: 246, position: "absolute", width: 246 },
  volumeControls: { alignItems: "center", flexDirection: "row", gap: 12, marginTop: 12 },
  volumeFill: { backgroundColor: "#76e29b", borderRadius: 99, height: 6 },
  volumeMeter: { backgroundColor: "#38443a", borderRadius: 99, flex: 1, height: 6 },
});
