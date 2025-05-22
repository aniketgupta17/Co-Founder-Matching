import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
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
          <Ionicons name="arrow-forward" size={20} color="#4B2E83" />
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
  headerContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  appTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  appSubtitle: {
    color: 'white',
    fontSize: 18,
    marginTop: 5,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 28,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#4B2E83',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});