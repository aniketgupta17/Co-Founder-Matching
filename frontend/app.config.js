import 'dotenv/config';

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
      // Add environment variables here
      supabaseUrl: process.env.SUPABASE_API_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      eas: {
        projectId: "your-project-id" // Replace with your EAS project ID if using EAS Build
      }
    },
    plugins: [
      "expo-router"
    ]
  }
}; 