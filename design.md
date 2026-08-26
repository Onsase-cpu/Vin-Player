# Vin Player — Mobile Interface Design

## Product Direction

Vin Player is a **local, offline-first music player** for Android. The supplied web project establishes the product vocabulary: a calm dark interface, green audio accents, a large “now playing” focal point, local file import, and queue controls. The mobile app will recreate those functions natively rather than merely opening the website in a web view, so selected audio files and playback controls behave reliably on Android.

## Screen List

| Screen | Primary content and functionality |
|---|---|
| **Player** | The default 9:16 portrait screen. It contains the Vin Player identity, the active track title and filename-derived artist label, artwork, elapsed/duration time, a scrubber, previous/play/next controls, shuffle and repeat actions, a volume control, playback-speed selector, and a prominent **Add Music** action. |
| **Library** | A searchable FlatList of locally selected tracks. Users can start a track, remove one track, or use **Add Music** to choose more audio files. An empty state explains that music stays on the user’s device. |
| **Settings Sheet** | A compact modal attached to the player screen for volume, playback speed, shuffle, and repeat. It keeps secondary controls reachable without crowding the main player. |

## Primary Layout and One-Handed Use

The Player screen uses a dark charcoal background (`#101511`) with moss-black surfaces (`#182019`) and the website’s green accent (`#0B7A53`). Primary controls sit in the lower half of the screen within easy thumb reach. The play button is a 64-pixel green circle, flanked by larger-than-standard previous and next targets. Touch targets are at least 44 pixels. The Add Music button is visible at both the top and the empty state, eliminating dead ends for first-time users.

The Library is a scrollable single-column list. Each row exposes the title, format/filename label, current-track state, and a compact remove action. Search remains at the top of the content, and adding music is available in the bottom-safe-area action zone. The app follows iOS-style information hierarchy and motion while retaining Android-native file selection and audio behavior.

## Key User Flows

| Flow | Steps |
|---|---|
| **Add and play music** | User taps **Add Music** → Android file picker opens with multiple selection enabled → supported audio files are added to the local library → the first selected item becomes the active track → user taps Play. |
| **Change track** | User chooses a library item or taps Next/Previous → current source updates → title and duration refresh → playback resumes if music had been playing. |
| **Control listening** | User taps the centre Play/Pause button, scrubs progress, adjusts volume, selects playback speed, or toggles shuffle/repeat → player state updates immediately and is retained for the session. |
| **Manage library** | User opens Library → searches tracks or taps a remove action → queue, selected track, and displayed count update without interrupting unrelated files. |

## Brand and Visual Assets

The custom launcher icon will use a simple vinyl-disc motif with a green soundwave centre, rendered as a high-contrast square that remains recognizable at small sizes. The same icon will support the launcher, adaptive icon foreground, splash screen, and favicon. Typography relies on the platform’s native system font for high legibility and fast loading.

## Intentional Scope

No accounts, cloud sync, music-store catalog, advertising, external streaming, or server processing is included. Selected files are played from the user’s Android device. This delivers the core behavior of the supplied site without requesting unnecessary personal data.
