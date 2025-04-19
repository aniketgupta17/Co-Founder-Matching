import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

// Temporarily using the splash icon until the UQ Ventures logo is added
const logoImage = require('../../assets/splash-icon.png');

export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={logoImage} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appTitle}>UQ VENTURES</Text>
        <Text style={styles.appSubtitle}>Co-Founder Matching</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Find Your Perfect Co-Founder Match</Text>
        <Text style={styles.description}>
          Connect with compatible co-founders based on skills, interests, and goals. 
          Build your dream team and turn your startup ideas into reality!
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4B2E83', // UQ purple color
    padding: 20,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  appSubtitle: {
    color: 'white',
    fontSize: 16,
    marginTop: 5,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: '#4B2E83',
    fontSize: 18,
    fontWeight: 'bold',
  },
});