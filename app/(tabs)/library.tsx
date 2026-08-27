import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useVinPlayer, type Track } from "@/components/player-context";
import { ScreenContainer } from "@/components/screen-container";

type LibraryItem = { index: number; track: Track };

export default function LibraryScreen() {
  const { currentIndex, pickTracks, playTrack, removeTrack, status, tracks } = useVinPlayer();
  const [query, setQuery] = useState("");

  const library = useMemo<LibraryItem[]>(
    () =>
      tracks
        .map((track, index) => ({ track, index }))
        .filter(({ track }) => `${track.title} ${track.name}`.toLowerCase().includes(query.trim().toLowerCase())),
    [query, tracks],
  );

  const confirmRemove = (item: LibraryItem) => {
    Alert.alert("Remove from library?", `Remove “${item.track.title}” from the current Vin Player queue?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeTrack(item.index) },
    ]);
  };

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>YOUR MUSIC</Text>
          <Text style={styles.title}>{tracks.length === 1 ? "1 track" : `${tracks.length} tracks`}</Text>
        </View>
        <Pressable onPress={pickTracks} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
          <MaterialIcons color="#102016" name="add" size={20} />
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <MaterialIcons color="#9faea3" name="search" size={20} />
        <TextInput
          accessibilityLabel="Search your local music"
          autoCapitalize="none"
          onChangeText={setQuery}
          placeholder="Search your music"
          placeholderTextColor="#7f8d82"
          returnKeyType="done"
          style={styles.searchInput}
          value={query}
        />
        {query ? (
          <Pressable onPress={() => setQuery("")} style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
            <MaterialIcons color="#aab8ad" name="close" size={18} />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        contentContainerStyle={library.length ? styles.listContent : styles.emptyContent}
        data={library}
        keyExtractor={(item) => item.track.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialIcons color="#76e29b" name="music-note" size={35} />
            </View>
            <Text style={styles.emptyTitle}>{query ? "No matching tracks" : "Your library is empty"}</Text>
            <Text style={styles.emptyText}>{query ? "Try another title or filename." : "Choose audio files from your device and they will appear here."}</Text>
            {!query ? (
              <Pressable onPress={pickTracks} style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}>
                <MaterialIcons color="#102016" name="add" size={19} />
                <Text style={styles.emptyButtonText}>Add Music</Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const active = item.index === currentIndex;
          return (
            <Pressable onPress={() => playTrack(item.index)} style={({ pressed }) => [styles.trackRow, active && styles.trackRowActive, pressed && styles.pressed]}>
              <View style={[styles.trackNumber, active && styles.trackNumberActive]}>
                <Text style={[styles.trackNumberText, active && styles.trackNumberTextActive]}>{active && status.playing ? "♪" : item.index + 1}</Text>
              </View>
              <View style={styles.trackCopy}>
                <Text numberOfLines={1} style={[styles.trackTitle, active && styles.trackTitleActive]}>{item.track.title}</Text>
                <Text numberOfLines={1} style={styles.trackFilename}>{item.track.name}</Text>
              </View>
              <Pressable accessibilityLabel={`Remove ${item.track.title}`} onPress={() => confirmRemove(item)} style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}>
                <MaterialIcons color="#aeb9b1" name="more-vert" size={22} />
              </Pressable>
            </Pressable>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  addButton: { alignItems: "center", backgroundColor: "#76e29b", borderRadius: 999, height: 44, justifyContent: "center", width: 44 },
  clearButton: { alignItems: "center", height: 34, justifyContent: "center", width: 34 },
  emptyButton: { alignItems: "center", backgroundColor: "#76e29b", borderRadius: 999, flexDirection: "row", gap: 6, marginTop: 20, minHeight: 45, paddingHorizontal: 18 },
  emptyButtonText: { color: "#102016", fontSize: 14, fontWeight: "800" },
  emptyContent: { flexGrow: 1 },
  emptyIcon: { alignItems: "center", backgroundColor: "#213527", borderRadius: 999, height: 72, justifyContent: "center", width: 72 },
  emptyState: { alignItems: "center", flex: 1, justifyContent: "center", marginBottom: 62, paddingHorizontal: 24 },
  emptyText: { color: "#9ca99f", fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: "center" },
  emptyTitle: { color: "#eaf3ec", fontSize: 20, fontWeight: "800", marginTop: 17 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 22, marginTop: 7 },
  kicker: { color: "#76e29b", fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  listContent: { paddingBottom: 28 },
  pressed: { opacity: 0.7 },
  removeButton: { alignItems: "center", height: 44, justifyContent: "center", width: 36 },
  searchBox: { alignItems: "center", backgroundColor: "#1a231c", borderColor: "#2f3a31", borderRadius: 16, borderWidth: 1, flexDirection: "row", height: 48, marginBottom: 16, paddingLeft: 14 },
  searchInput: { color: "#e8f1e9", flex: 1, fontSize: 14, height: "100%", marginLeft: 8 },
  title: { color: "#f0f7f1", fontSize: 27, fontWeight: "800", marginTop: 2 },
  trackCopy: { flex: 1, marginLeft: 12 },
  trackFilename: { color: "#89958b", fontSize: 12, marginTop: 3 },
  trackNumber: { alignItems: "center", backgroundColor: "#29342b", borderRadius: 12, height: 40, justifyContent: "center", width: 40 },
  trackNumberActive: { backgroundColor: "#76e29b" },
  trackNumberText: { color: "#bfcac1", fontSize: 13, fontWeight: "800" },
  trackNumberTextActive: { color: "#0d2012", fontSize: 18 },
  trackRow: { alignItems: "center", backgroundColor: "#182119", borderColor: "#2c372e", borderRadius: 16, borderWidth: 1, flexDirection: "row", marginBottom: 9, minHeight: 70, paddingLeft: 12, paddingRight: 4 },
  trackRowActive: { backgroundColor: "#1e3223", borderColor: "#4a8559" },
  trackTitle: { color: "#e6efe8", fontSize: 14, fontWeight: "700" },
  trackTitleActive: { color: "#8cf0ab" },
});
