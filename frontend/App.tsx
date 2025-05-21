import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RootNavigator from "./app/navigation/RootNavigator";
import { AuthProvider, useAuth, useSupabase } from "./app/hooks/supabase";
import { ProfileProvider } from "./app/hooks/useProfile";

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
        <RootNavigator />
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
