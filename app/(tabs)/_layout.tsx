import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlayerProvider } from "@/components/player-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);

  return (
    <PlayerProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#63d98b",
          tabBarInactiveTintColor: "#8b968d",
          tabBarStyle: {
            backgroundColor: "#151c16",
            borderTopColor: "#29332b",
            borderTopWidth: 1,
            height: 58 + bottomPadding,
            paddingBottom: bottomPadding,
            paddingTop: 7,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Player",
            tabBarIcon: ({ color }) => <MaterialIcons color={color} name="album" size={24} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
            tabBarIcon: ({ color }) => <MaterialIcons color={color} name="queue-music" size={25} />,
          }}
        />
      </Tabs>
    </PlayerProvider>
  );
}
