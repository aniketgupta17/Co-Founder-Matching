// Import polyfills first
import "./app/polyfills";

import "react-native-gesture-handler";
import React, { useEffect, useState, Suspense, lazy } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { AuthProvider, useAuth } from "./app/hooks/supabase";

// Lazy load the RootNavigator to improve initial load time
const RootNavigator = lazy(() => import("./app/navigation/RootNavigator"));

// Loading component for Suspense fallback
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#FFFFFF" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

// Wrapper component that uses the auth hook
function AppContent() {
  const { session, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  // Log authentication state for debugging
  useEffect(() => {
    try {
      if (!loading) {
        console.log("Auth state updated:", session ? "Logged in" : "Not logged in");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err instanceof Error ? err.message : "Unknown authentication error");
    }
  }, [session, loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Authentication Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Suspense fallback={<LoadingScreen />}>
        <RootNavigator />
      </Suspense>
    </SafeAreaProvider>
  );
}

export default function App() {
  try {
    return (
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    );
  } catch (err) {
    console.error("App error:", err);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Application Error</Text>
        <Text style={styles.errorMessage}>{err instanceof Error ? err.message : "Unknown error occurred"}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4B2E83',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4B2E83',
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    marginTop: 12,
  },
});
