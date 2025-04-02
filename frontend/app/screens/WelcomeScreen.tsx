import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

// Temporarily using the splash icon until the UQ Ventures logo is added
const logoImage = require('../../assets/splash-icon.png');

export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentStep, setCurrentStep] = useState(0);

  const onboardingSteps = [
    {
      title: 'Welcome',
      description: 'Find your ideal co-founder with our matching platform.',
      buttonText: 'Get Started',
    },
    {
      title: 'Step 1: Profile',
      description: 'Create a detailed profile with your skills and expertise.',
      buttonText: 'Continue',
    },
    {
      title: 'Step 2: Preferences',
      description: 'Tell us what you\'re looking for in a co-founder.',
      buttonText: 'Continue',
    },
    {
      title: 'Step 3: Matching',
      description: 'Get matched with compatible co-founders.',
      buttonText: 'Continue',
    },
    {
      title: 'Step 4: Connect',
      description: 'Start conversations with your matches.',
      buttonText: 'Let\'s Begin',
    },
  ];

  const currentStepData = onboardingSteps[currentStep];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to profile setup when onboarding is complete
      navigation.navigate('ProfileSetup');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={logoImage} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appTitle}>UQ VENTURES</Text>
        <Text style={styles.appSubtitle}>Co-Founder Matching</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.description}>{currentStepData.description}</Text>

        {/* Step indicators */}
        <View style={styles.stepIndicatorContainer}>
          {onboardingSteps.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.stepDot, 
                index === currentStep ? styles.activeDot : null
              ]} 
            />
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{currentStepData.buttonText}</Text>
        </TouchableOpacity>

        {currentStep === 0 && (
          <TouchableOpacity style={styles.loginLink}>
            <Text style={styles.loginText}>Already have an account? Login</Text>
          </TouchableOpacity>
        )}
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
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: 'white',
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
  loginLink: {
    marginTop: 10,
  },
  loginText: {
    color: 'white',
    fontSize: 16,
  },
});