import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useAuth } from "../hooks/supabase";
import { Constants } from "../types/supabase";
import { updateProfile } from "../services/profileService";
import { Credentials } from "../types/auth";
import { Ionicons } from '@expo/vector-icons';

const skillOptions = Constants["public"]["Enums"]["skills"];

type ProfileSetupStep =
  | "signup"
  | "profile"
  | "skills"
  | "coFounderPreferences";

export default function ProfileSetupScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentStep, setCurrentStep] = useState<ProfileSetupStep>("signup");
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, session } = useAuth();

  // Credential state
  const [credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [profileFormData, setProfileFormData] = useState({
    id: "",
    name: "",
    bio: "",
    skills: [] as string[],
    time_commitment: "",
    seeking_skills: [] as string[],
    industry: "",
  });

  // Function to check password match
  const passwordsMatch = () => {
    return credentials.password === confirmPassword;
  };

  // Function to check if form is valid
  const isFormValid = () => {
    switch (currentStep) {
      case "signup":
        return (
          credentials.email !== "" &&
          credentials.password !== "" &&
          confirmPassword !== "" &&
          passwordsMatch()
        );
      case "profile":
        return profileFormData.name !== "" && profileFormData.bio !== "";
      case "skills":
        return profileFormData.skills.length > 0;
      case "coFounderPreferences":
        return true; // This can be optional
      default:
        return false;
    }
  };

  // Update credentials
  const updateCredentials = (key: string, value: string) => {
    setCredentials({
      ...credentials,
      [key]: value,
    });
  };

  // Update profile data
  const updateProfileData = (key: string, value: any) => {
    setProfileFormData({
      ...profileFormData,
      [key]: value,
    });
  };

  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    if (profileFormData.skills.includes(skill)) {
      updateProfileData(
        "skills",
        profileFormData.skills.filter((s) => s !== skill)
      );
    } else {
      updateProfileData("skills", [...profileFormData.skills, skill]);
    }
  };

  // Toggle seeking skill selection
  const toggleLookingFor = (skill: string) => {
    if (profileFormData.seeking_skills.includes(skill)) {
      updateProfileData(
        "seeking_skills",
        profileFormData.seeking_skills.filter((s) => s !== skill)
      );
    } else {
      updateProfileData("seeking_skills", [
        ...profileFormData.seeking_skills,
        skill,
      ]);
    }
  };

  // Handle sign up
  const handleSignUp = async (): Promise<boolean> => {
    console.log('Attempting signup...');
    setIsLoading(true);
    
    try {
      await signUp({
        email: credentials.email,
        password: credentials.password,
      });
      
      console.log('Sign up completed');
      
      // Get user ID from session
      if (session?.user?.id) {
        updateProfileData("id", session.user.id);
      } else {
        // For development, we'll use a mock ID
        console.log('Using mock session for frontend development');
        updateProfileData("id", "mock-user-123");
      }
      
      setIsLoading(false);
      return true;
      
    } catch (error: any) {
      console.error('Error during sign up:', error);
      
      // For offline development: allow proceeding despite network errors
      if (error.toString().includes('Network request failed')) {
        console.log('Network error detected - proceeding anyway for development');
        Alert.alert(
          'Development Mode', 
          'Network error detected, but proceeding in development mode',
          [{ text: 'OK', onPress: () => {} }]
        );
        
        // Set a mock user ID
        updateProfileData("id", "mock-user-" + Math.floor(Math.random() * 1000));
        setIsLoading(false);
        return true;
      }
      
      Alert.alert('Error', 'Failed to create account. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  // Handle next button click
  const handleNext = async () => {
    if (!isFormValid()) {
      let errorMessage = "Please fill in all required fields";
      
      if (currentStep === "signup" && !passwordsMatch()) {
        errorMessage = "Passwords do not match";
      }
      
      Alert.alert("Error", errorMessage);
      return;
    }
    
    if (currentStep === "signup") {
      const signupResult = await handleSignUp();
      console.log('Signup result:', signupResult);
      
      if (signupResult) {
        console.log('Moving to profile step');
        setCurrentStep("profile");
      } else {
        console.log('Sign up failed, not proceeding to next step');
      }
    } else if (currentStep === "profile") {
      console.log('Moving from profile to skills step');
      setCurrentStep("skills");
    } else if (currentStep === "skills") {
      console.log('Moving from skills to preferences step');
      setCurrentStep("coFounderPreferences");
    } else {
      // Final step - save profile and proceed to main app
      console.log('Final step - updating profile and navigating to MainTabs');
      setIsLoading(true);
      
      try {
        console.log('Updating profile with data:', profileFormData);
        await updateProfile(profileFormData.id, profileFormData);
        
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } catch (error: any) {
        console.error('Error updating profile:', error);
        
        // For offline development: allow proceeding despite network errors
        if (error.toString().includes('Network request failed')) {
          console.log('Network error detected - proceeding anyway for development');
          Alert.alert(
            'Development Mode', 
            'Network error detected, but proceeding to main app in development mode',
            [{ 
              text: 'OK', 
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              } 
            }]
          );
        } else {
          Alert.alert('Error', 'Failed to create profile. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle back button click
  const handleBack = () => {
    if (currentStep === "profile") {
      setCurrentStep("signup");
    } else if (currentStep === "skills") {
      setCurrentStep("profile");
    } else if (currentStep === "coFounderPreferences") {
      setCurrentStep("skills");
    }
  };

  // Handle cancel button - go back to login
  const handleCancel = () => {
    navigation.navigate('Login');
  };

  // Render sign up form
  const renderSignUp = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Create Your Account</Text>
      <Text style={styles.sectionSubtitle}>Sign up to join our co-founder network</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={credentials.email}
          onChangeText={(text) => updateCredentials("email", text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Create a password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={credentials.password}
          onChangeText={(text) => updateCredentials("password", text)}
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>
      
      {confirmPassword !== "" && !passwordsMatch() && (
        <Text style={styles.errorText}>Passwords do not match</Text>
      )}
    </View>
  );

  // Render basic profile form
  const renderProfile = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      <Text style={styles.sectionSubtitle}>Tell us a bit about yourself</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#999"
          value={profileFormData.name}
          onChangeText={(text) => updateProfileData("name", text)}
        />
      </View>

      <View style={[styles.inputContainer, styles.textAreaContainer]}>
        <Ionicons name="document-text-outline" size={20} color="#666" style={[styles.inputIcon, {alignSelf: 'flex-start', marginTop: 12}]} />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us about yourself, your background, and what you're looking for in a co-founder"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          value={profileFormData.bio}
          onChangeText={(text) => updateProfileData("bio", text)}
        />
      </View>
    </View>
  );

  // Render skills form
  const renderSkills = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Skills & Expertise</Text>
      <Text style={styles.sectionSubtitle}>Select your key skills (at least one)</Text>

      <View style={styles.skillsContainer}>
        {skillOptions.map((skill) => (
          <TouchableOpacity
            key={skill}
            style={[
              styles.skillButton,
              profileFormData.skills.includes(skill) &&
                styles.selectedSkillButton,
            ]}
            onPress={() => toggleSkill(skill)}
          >
            <Text
              style={[
                styles.skillButtonText,
                profileFormData.skills.includes(skill) &&
                  styles.selectedSkillButtonText,
              ]}
            >
              {skill}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render Co-founder Preferences form
  const renderPreferences = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Co-Founder Preferences</Text>
      <Text style={styles.sectionSubtitle}>What are you looking for in a co-founder?</Text>

      <Text style={styles.subsectionTitle}>Skills you're seeking:</Text>
      <View style={styles.skillsContainer}>
        {skillOptions.map((skill) => (
          <TouchableOpacity
            key={skill}
            style={[
              styles.skillButton,
              profileFormData.seeking_skills.includes(skill) &&
                styles.selectedSkillButton,
            ]}
            onPress={() => toggleLookingFor(skill)}
          >
            <Text
              style={[
                styles.skillButtonText,
                profileFormData.seeking_skills.includes(skill) &&
                  styles.selectedSkillButtonText,
              ]}
            >
              {skill}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Industry (e.g., FinTech, HealthTech)"
          placeholderTextColor="#999"
          value={profileFormData.industry}
          onChangeText={(text) => updateProfileData("industry", text)}
        />
      </View>

      <Text style={styles.subsectionTitle}>Time Commitment:</Text>
      <View style={styles.timeCommitmentContainer}>
        {["Part-time", "Full-time"].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.timeCommitmentButton,
              profileFormData.time_commitment === option &&
                styles.selectedTimeCommitmentButton,
            ]}
            onPress={() => updateProfileData("time_commitment", option)}
          >
            <Text
              style={[
                styles.timeCommitmentButtonText,
                profileFormData.time_commitment === option &&
                  styles.selectedTimeCommitmentButtonText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Get step title
  const getStepTitle = () => {
    switch (currentStep) {
      case "signup":
        return "Create Account";
      case "profile":
        return "Your Profile";
      case "skills":
        return "Your Skills";
      case "coFounderPreferences":
        return "Co-Founder Preferences";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header with step title and cancel button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{getStepTitle()}</Text>
            <View style={styles.cancelButton} />
          </View>
          
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressStep,
                currentStep === "signup" ? styles.activeStep : 
                (currentStep === "profile" || currentStep === "skills" || currentStep === "coFounderPreferences") 
                  ? styles.completedStep : styles.inactiveStep,
              ]}
            />
            <View style={styles.progressLine} />
            <View
              style={[
                styles.progressStep,
                currentStep === "profile" ? styles.activeStep : 
                (currentStep === "skills" || currentStep === "coFounderPreferences") 
                  ? styles.completedStep : styles.inactiveStep,
              ]}
            />
            <View style={styles.progressLine} />
            <View
              style={[
                styles.progressStep,
                currentStep === "skills" ? styles.activeStep : 
                currentStep === "coFounderPreferences" 
                  ? styles.completedStep : styles.inactiveStep,
              ]}
            />
            <View style={styles.progressLine} />
            <View
              style={[
                styles.progressStep,
                currentStep === "coFounderPreferences" 
                  ? styles.activeStep : styles.inactiveStep,
              ]}
            />
          </View>

          {/* Form content based on current step */}
          {currentStep === "signup" && renderSignUp()}
          {currentStep === "profile" && renderProfile()}
          {currentStep === "skills" && renderSkills()}
          {currentStep === "coFounderPreferences" && renderPreferences()}

          {/* Navigation buttons */}
          <View style={styles.buttonContainer}>
            {currentStep !== "signup" && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[
                styles.nextButton,
                !isFormValid() && styles.disabledButton
              ]} 
              onPress={handleNext}
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.nextButtonText}>
                  {currentStep === "coFounderPreferences" ? "Complete" : "Next"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B2E83',
    textAlign: 'center',
  },
  cancelButton: {
    width: 60,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressStep: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  progressLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 5,
  },
  activeStep: {
    backgroundColor: '#4B2E83',
  },
  completedStep: {
    backgroundColor: '#8878B0', // Lighter purple
  },
  inactiveStep: {
    backgroundColor: '#EEEEEE',
  },
  formContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4B2E83',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B2E83',
    marginTop: 20,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  textAreaContainer: {
    minHeight: 120,
    alignItems: 'flex-start',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  passwordToggle: {
    padding: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  skillButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedSkillButton: {
    backgroundColor: '#4B2E83',
  },
  skillButtonText: {
    color: '#666',
    fontSize: 14,
  },
  selectedSkillButtonText: {
    color: 'white',
  },
  timeCommitmentContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  timeCommitmentButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 8,
  },
  selectedTimeCommitmentButton: {
    backgroundColor: '#4B2E83',
  },
  timeCommitmentButtonText: {
    color: '#666',
    fontSize: 16,
  },
  selectedTimeCommitmentButtonText: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#4B2E83',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 2,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
