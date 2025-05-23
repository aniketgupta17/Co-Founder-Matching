import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuth } from "../hooks/supabase";
import { useProfile } from "../hooks/useProfile";

// Import screens
import WelcomeScreen from "../screens/WelcomeScreen";
import ProfileSetupScreen from "../screens/ProfileSetupScreen";
import SettingsScreen from "../screens/SettingsScreen";
import LoginScreen from "../screens/LoginScreen";

// Import Tab Navigator
import TabNavigator from "./TabNavigator";

// Define your type for route params
export type RootStackParamList = {
  Welcome: undefined;
  ProfileSetup: undefined;
  MainTabs: undefined; // This will hold our tab navigator
  Settings: undefined; // Added Settings screen
  Login: undefined; // Add Login route
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  
  // Determine the initial route based on authentication and profile completion
  const getInitialRoute = () => {
    if (!session) {
      return "Welcome"; // Not logged in, show welcome screen
    }
    
    // If profile exists but is not complete, show profile setup
    if (profile && profile.is_complete === false) {
      console.info("Profile incomplete, redirecting to ProfileSetup");
      return "ProfileSetup";
    }
    
    return "MainTabs"; // Logged in with complete profile, show main app
  };
  
  // Don't render until we have loaded both auth and profile data
  if (authLoading || profileLoading) {
    return null; // Or a loading indicator
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={getInitialRoute()}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
