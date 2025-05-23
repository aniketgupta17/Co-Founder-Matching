import React, { useEffect, useId, useState } from "react";
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
import { useAuth, useSupabase } from "../hooks/supabase";
import { Credentials } from "../types/auth";
import { Ionicons } from "@expo/vector-icons";
import { ProfileRowUpdate } from "../types/profile";
import { useSkillsAndInterests } from "../hooks/useSkillsAndInterests";
import { useProfile } from "../hooks/useProfile";

type ProfileSetupStep =
  | "signup"
  | "profile"
  | "skills"
  | "education"
  | "experience"
  | "coFounderPreferences";

export default function ProfileSetupScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentStep, setCurrentStep] = useState<ProfileSetupStep>("signup");
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useSupabase();
  const { skills, interests } = useSkillsAndInterests(supabase);
  const { refreshProfile } = useProfile();

  const { signUp, session, user } = useAuth();

  // Credential state
  const [credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: "",
  });

  // If we already have a session, we're here because the profile is incomplete
  // So skip the signup step and start from profile step
  useEffect(() => {
    if (session && user && currentStep === "signup") {
      console.log("User already logged in, skipping signup step");
      // Set profile ID from existing user
      setProfileFormData(prevData => ({
        ...prevData,
        id: user.id
      }));
      // Move directly to profile step
      setCurrentStep("profile");
    }
  }, [session, user]);

  const updateProfile = async (id: string, profileUpdate: ProfileRowUpdate) => {
    try {
      // Update with timestamp
      const { id: _, ...updateData } = profileUpdate;

      const updateWithTimestamp = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from("profiles")
        .update(updateWithTimestamp)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Supabase error updating profile:", error);
        return;
      }

      if (!data) {
        console.error("No profile update data returned");
        return;
      }

      console.info("Update returned data:", data[0]);

      return data[0];
    } catch (error) {
      console.error("Uncaught profile update error:", error);
      return;
    }
  };
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [profileFormData, setProfileFormData] = useState<ProfileRowUpdate>({
    id: "",
    name: "",
    bio: "",
    role: "",
    industry: "",
    skills: [],
    seeking_skills: [],
    interests: [],
  });

  // Add initial state for education and experience
  const [educationForm, setEducationForm] = useState({
    institution: '',
    degree: '',
    year: '',
  });

  const [experienceForm, setExperienceForm] = useState({
    company: '',
    role: '',
    duration: '',
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
        return profileFormData.skills && profileFormData.skills.length > 0;
      case "education":
        return educationForm.institution !== "" && educationForm.degree !== "" || 
               (profileFormData.education && profileFormData.education.length > 0);
      case "experience":
        return experienceForm.company !== "" && experienceForm.role !== "" || 
               (profileFormData.experience && profileFormData.experience.length > 0);
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
    console.log("Attempting signup...");
    setIsLoading(true);

    try {
      // Try to sign up with provided credentials
      const signUpResult = await signUp({
        email: credentials.email,
        password: credentials.password,
      });

      // If we have a user from the session, use their ID
      if (user) {
        console.log("User authenticated with ID:", user.id);
        updateProfileData("id", user.id);
        
        // Also update the email field to ensure consistency
        updateProfileData("email", user.email);
      } else {
        console.log("User authenticated successfully but no user ID available yet");
        console.log("Will retry fetching the user during profile creation");
        
        // For development purposes, we'll check again before creating the profile
        const { data: userData } = await supabase.auth.getSession();
        
        if (userData && userData.session && userData.session.user) {
          console.log("Retrieved user ID from session:", userData.session.user.id);
          updateProfileData("id", userData.session.user.id);
          updateProfileData("email", userData.session.user.email);
        } else {
          throw new Error("Could not authenticate user");
        }
      }

      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Error during sign up:", error);

      // For offline development: allow proceeding despite network errors
      if (error.toString().includes("Network request failed")) {
        console.log(
          "Network error detected - proceeding anyway for development"
        );
        Alert.alert(
          "Development Mode",
          "Network error detected, but proceeding in development mode",
          [{ text: "OK", onPress: () => {} }]
        );

        // Set a mock user ID - DO NOT USE IN PRODUCTION
        updateProfileData(
          "id",
          "00000000-0000-0000-0000-000000000000"
        );
        setIsLoading(false);
        return true;
      }

      Alert.alert("Error", "Failed to create account. Please try again.");
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
      console.log("Signup result:", signupResult);

      if (signupResult) {
        console.log("Moving to profile step");
        setCurrentStep("profile");
      } else {
        console.log("Sign up failed, not proceeding to next step");
      }
    } else if (currentStep === "profile") {
      console.log("Moving from profile to skills step");
      setCurrentStep("skills");
    } else if (currentStep === "skills") {
      console.log("Moving from skills to education step");
      setCurrentStep("education");
    } else if (currentStep === "education") {
      // Add the education to the profile form data
      if (educationForm.institution && educationForm.degree) {
        updateProfileData("education", [...profileFormData.education || [], educationForm]);
      }
      console.log("Moving from education to experience step");
      setCurrentStep("experience");
    } else if (currentStep === "experience") {
      // Add the experience to the profile form data
      if (experienceForm.company && experienceForm.role) {
        updateProfileData("experience", [...profileFormData.experience || [], experienceForm]);
      }
      console.log("Moving from experience to preferences step");
      setCurrentStep("coFounderPreferences");
    } else {
      // Final step - save profile and proceed to main app
      console.log("Final step - updating profile and navigating to MainTabs");
      if (!user) {
        throw Error("Profile creation requires active user session");
      }
      
      // Set is_complete flag to true when finishing the onboarding
      const completeProfileData = {
        ...profileFormData,
        is_complete: true
      };
      
      setIsLoading(true);

      try {
        console.log("Updating profile with data:", completeProfileData);
        if (completeProfileData.id) {
          await updateProfile(completeProfileData.id, completeProfileData);
          
          // Refresh profile data to ensure it's updated in the app
          await refreshProfile();
        } else {
          throw new Error("Profile ID is missing");
        }

        navigation.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        });
      } catch (error: any) {
        console.error("Error updating profile:", error);

        // For offline development: allow proceeding despite network errors
        if (error.toString().includes("Network request failed")) {
          console.log(
            "Network error detected - proceeding anyway for development"
          );
          Alert.alert(
            "Development Mode",
            "Network error detected, but proceeding to main app in development mode",
            [
              {
                text: "OK",
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "MainTabs" }],
                  });
                },
              },
            ]
          );
        } else {
          Alert.alert("Error", "Failed to create profile. Please try again.");
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
    } else if (currentStep === "education") {
      setCurrentStep("skills");
    } else if (currentStep === "experience") {
      setCurrentStep("education");
    } else if (currentStep === "coFounderPreferences") {
      setCurrentStep("experience");
    }
  };

  // Handle cancel button - go back to login
  const handleCancel = () => {
    navigation.navigate("Login");
  };

  // Render sign up form
  const renderSignUp = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Create Your Account</Text>
      <Text style={styles.sectionSubtitle}>
        Sign up to join our co-founder network
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons
          name="mail-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
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
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
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
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
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
        <Ionicons
          name="person-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#999"
          value={profileFormData.name}
          onChangeText={(text) => updateProfileData("name", text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="ribbon-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Current Role"
          placeholderTextColor="#999"
          value={profileFormData.role}
          onChangeText={(text) => updateProfileData("role", text)}
        />
      </View>

      <View style={[styles.inputContainer, styles.textAreaContainer]}>
        <Ionicons
          name="document-text-outline"
          size={20}
          color="#666"
          style={[styles.inputIcon, { alignSelf: "flex-start", marginTop: 12 }]}
        />
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
      <Text style={styles.sectionSubtitle}>
        Select your key skills (at least one)
      </Text>

      <View style={styles.skillsContainer}>
        {skills.map((skill) => (
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
      <Text style={styles.sectionSubtitle}>
        What are you looking for in a co-founder?
      </Text>

      <Text style={styles.subsectionTitle}>Skills you're seeking:</Text>
      <View style={styles.skillsContainer}>
        {skills.map((skill) => (
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
        <Ionicons
          name="business-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
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

  // Add renderEducation function to create education form
  const renderEducation = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Education</Text>
      <Text style={styles.sectionSubtitle}>Add your educational background</Text>

      <View style={styles.inputContainer}>
        <Ionicons
          name="school-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Institution"
          placeholderTextColor="#999"
          value={educationForm.institution}
          onChangeText={(text) => setEducationForm({...educationForm, institution: text})}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="document-text-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Degree/Certificate"
          placeholderTextColor="#999"
          value={educationForm.degree}
          onChangeText={(text) => setEducationForm({...educationForm, degree: text})}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="calendar-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Year (e.g., 2022)"
          placeholderTextColor="#999"
          keyboardType="number-pad"
          value={educationForm.year}
          onChangeText={(text) => setEducationForm({...educationForm, year: text})}
        />
      </View>

      {profileFormData.education && profileFormData.education.length > 0 && (
        <View style={styles.addedItemsContainer}>
          <Text style={styles.addedItemsTitle}>Added Education:</Text>
          {profileFormData.education.map((edu, index) => (
            <View key={index} style={styles.addedItem}>
              <Text style={styles.addedItemInstitution}>{edu.institution}</Text>
              <Text style={styles.addedItemDegree}>{edu.degree}</Text>
              <Text style={styles.addedItemYear}>{edu.year}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // Add renderExperience function to create experience form
  const renderExperience = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Work Experience</Text>
      <Text style={styles.sectionSubtitle}>Add your professional experience</Text>

      <View style={styles.inputContainer}>
        <Ionicons
          name="business-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Company"
          placeholderTextColor="#999"
          value={experienceForm.company}
          onChangeText={(text) => setExperienceForm({...experienceForm, company: text})}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="briefcase-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Role/Position"
          placeholderTextColor="#999"
          value={experienceForm.role}
          onChangeText={(text) => setExperienceForm({...experienceForm, role: text})}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="time-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Duration (e.g., 2020-2022)"
          placeholderTextColor="#999"
          value={experienceForm.duration}
          onChangeText={(text) => setExperienceForm({...experienceForm, duration: text})}
        />
      </View>

      {profileFormData.experience && profileFormData.experience.length > 0 && (
        <View style={styles.addedItemsContainer}>
          <Text style={styles.addedItemsTitle}>Added Experience:</Text>
          {profileFormData.experience.map((exp, index) => (
            <View key={index} style={styles.addedItem}>
              <Text style={styles.addedItemInstitution}>{exp.company}</Text>
              <Text style={styles.addedItemDegree}>{exp.role}</Text>
              <Text style={styles.addedItemYear}>{exp.duration}</Text>
            </View>
          ))}
        </View>
      )}
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
      case "education":
        return "Education";
      case "experience":
        return "Experience";
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
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
            >
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
                currentStep === "signup"
                  ? styles.activeStep
                  : currentStep === "profile" ||
                    currentStep === "skills" ||
                    currentStep === "education" ||
                    currentStep === "experience" ||
                    currentStep === "coFounderPreferences"
                  ? styles.completedStep
                  : styles.inactiveStep,
              ]}
            />
            <View style={styles.progressLine} />
            <View
              style={[
                styles.progressStep,
                currentStep === "profile"
                  ? styles.activeStep
                  : currentStep === "skills" ||
                    currentStep === "education" ||
                    currentStep === "experience" ||
                    currentStep === "coFounderPreferences"
                  ? styles.completedStep
                  : styles.inactiveStep,
              ]}
            />
            <View style={styles.progressLine} />
            <View
              style={[
                styles.progressStep,
                currentStep === "skills"
                  ? styles.activeStep
                  : currentStep === "education" ||
                    currentStep === "experience" ||
                    currentStep === "coFounderPreferences"
                  ? styles.completedStep
                  : styles.inactiveStep,
              ]}
            />
            <View style={styles.progressLine} />
            <View
              style={[
                styles.progressStep,
                currentStep === "education"
                  ? styles.activeStep
                  : currentStep === "experience" ||
                    currentStep === "coFounderPreferences"
                  ? styles.completedStep
                  : styles.inactiveStep,
              ]}
            />
            <View style={styles.progressLine} />
            <View
              style={[
                styles.progressStep,
                currentStep === "experience"
                  ? styles.activeStep
                  : currentStep === "coFounderPreferences"
                  ? styles.completedStep
                  : styles.inactiveStep,
              ]}
            />
            <View style={styles.progressLine} />
            <View
              style={[
                styles.progressStep,
                currentStep === "coFounderPreferences"
                  ? styles.activeStep
                  : styles.inactiveStep,
              ]}
            />
          </View>

          {/* Form content based on current step */}
          {currentStep === "signup" && renderSignUp()}
          {currentStep === "profile" && renderProfile()}
          {currentStep === "skills" && renderSkills()}
          {currentStep === "education" && renderEducation()}
          {currentStep === "experience" && renderExperience()}
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
                !isFormValid() && styles.disabledButton,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4B2E83",
    textAlign: "center",
  },
  cancelButton: {
    width: 60,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: "#EEEEEE",
    marginHorizontal: 5,
  },
  activeStep: {
    backgroundColor: "#4B2E83",
  },
  completedStep: {
    backgroundColor: "#8878B0", // Lighter purple
  },
  inactiveStep: {
    backgroundColor: "#EEEEEE",
  },
  formContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4B2E83",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4B2E83",
    marginTop: 20,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
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
    color: "#333",
  },
  textAreaContainer: {
    minHeight: 120,
    alignItems: "flex-start",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  passwordToggle: {
    padding: 8,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  skillButton: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedSkillButton: {
    backgroundColor: "#4B2E83",
  },
  skillButtonText: {
    color: "#666",
    fontSize: 14,
  },
  selectedSkillButtonText: {
    color: "white",
  },
  timeCommitmentContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  timeCommitmentButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 5,
    borderRadius: 8,
  },
  selectedTimeCommitmentButton: {
    backgroundColor: "#4B2E83",
  },
  timeCommitmentButtonText: {
    color: "#666",
    fontSize: 16,
  },
  selectedTimeCommitmentButtonText: {
    color: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  backButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  backButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#4B2E83",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 2,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  addedItemsContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
  },
  addedItemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B2E83',
    marginBottom: 12,
  },
  addedItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#4B2E83',
  },
  addedItemInstitution: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addedItemDegree: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addedItemYear: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
});
