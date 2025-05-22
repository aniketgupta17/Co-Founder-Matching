import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RootNavigator from "./app/navigation/RootNavigator";
import { AuthProvider, useAuth, useSupabase } from "./app/hooks/supabase";
import { ProfileProvider } from "./app/hooks/useProfile";
import { ChatProvider } from "./app/hooks/useChats";
import { EventProvider } from "./app/hooks/useEvents";

// Wrapper component that uses the auth hook
function AppContent() {
  const { session, loading } = useAuth();
  const { supabase } = useSupabase();

  // Log authentication state for debugging
  useEffect(() => {
    if (!loading) {
      console.log(
        "Auth state updated:",
        session ? "Logged in" : "Not logged in"
      );
    }
  }, [session, loading]);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <ProfileProvider supabase={supabase}>
        <ChatProvider supabase={supabase}>
          <EventProvider supabase={supabase}>
            <RootNavigator />
          </EventProvider>
        </ChatProvider>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
