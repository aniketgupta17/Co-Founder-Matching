import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read values from app.json
let appJson = {};
try {
  const appJsonPath = join(__dirname, 'app.json');
  const appJsonContent = readFileSync(appJsonPath, 'utf8');
  appJson = JSON.parse(appJsonContent).expo || {};
} catch (e) {
  console.warn('Could not read app.json', e);
}

export default {
  expo: {
    name: "UQ Ventures Co-Founder Matching",
    slug: "frontend",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#4B2E83" // UQ purple
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.uqventures.cofoundermatching"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#4B2E83"
      },
      package: "com.uqventures.cofoundermatching"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      // Add environment variables here with fallback values for development
      supabaseUrl: process.env.SUPABASE_API_URL || "https://bivbvzynoxlcfbvdkfol.supabase.co",
      supabaseKey: process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockkey",
      useMockAuth: true, // Enable mock authentication for development
      eas: appJson.extra?.eas || {
        projectId: "your-project-id" // Replace with your EAS project ID if using EAS Build
      }
    },
    plugins: [
      "expo-router"
    ],
    // Mobile optimization settings
    updates: {
      enabled: false // Disable OTA updates to speed up loading
    },
    runtimeVersion: {
      policy: "nativeVersion"
    },
    // Reduce asset loading time
    assetBundlePatterns: [
      "assets/icons/*"
    ],
    // Enable hermes engine for better performance
    jsEngine: "hermes"
  }
}; 