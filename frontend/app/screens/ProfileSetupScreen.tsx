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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useAuth } from "../hooks/supabase";
import { Constants } from "../types/supabase";
import { updateProfile } from "../services/profileService";
import { Credentials } from "../types/auth";

const skillOptions = Constants["public"]["Enums"]["skills"];

type ProfileSetupStep =
  | "signUp"
  | "profile"
  | "skills"
  | "coFounderPreferences";

export default function ProfileSetupScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentStep, setCurrentStep] = useState<ProfileSetupStep>("signUp");

  const { signUp, session } = useAuth();

  // Credential state
  const [credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: "",
  });

  const [profileFormData, setProfileFormData] = useState({
    id: "",
    name: "",
    bio: "",
    skills: [] as string[],
    time_commitment: "",
    seeking_skills: [] as string[],
    industry: "",
  });

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
  const handleSignUp = async () => {
    await signUp({
      email: credentials.email,
      password: credentials.password,
    });
    console.log("Sign up happened");

    updateProfileData("id", session?.user.id);
  };

  // Handle next button click
  const handleNext = async () => {
    if (currentStep === "signUp") {
      await handleSignUp();
      setCurrentStep("profile");
    } else if (currentStep === "profile") {
      setCurrentStep("skills");
    } else if (currentStep === "skills") {
      setCurrentStep("coFounderPreferences");
    } else {
      await updateProfile(profileFormData.id, profileFormData);

      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      });
    }
  };

  // Handle back button click
  const handleBack = () => {
    if (currentStep === "skills") {
      setCurrentStep("profile");
    } else if (currentStep === "coFounderPreferences") {
      setCurrentStep("skills");
    }
  };

  // Render sign up form
  const renderSignUp = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Sign Up</Text>
      <Text style={styles.sectionSubtitle}>Let's get you logged in</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
          autoCapitalize="none"
          value={credentials.email}
          onChangeText={(text) => updateCredentials("email", text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Create a password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={credentials.password}
          onChangeText={(text) => updateCredentials("password", text)}
        />
      </View>
    </View>
  );

  // Render basic profile form
  const renderProfile = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      <Text style={styles.sectionSubtitle}>Let's get to know you better</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#A0A0A0"
          value={profileFormData.name}
          onChangeText={(text) => updateProfileData("name", text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Brief Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us about yourself"
          placeholderTextColor="#A0A0A0"
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
      <Text style={styles.sectionSubtitle}>What are you good at?</Text>

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
      <Text style={styles.sectionSubtitle}>What are you looking for?</Text>

      <Text style={styles.subsectionTitle}>Skills I'm seeking:</Text>
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
        <Text style={styles.inputLabel}>Industry</Text>
        <TextInput
          style={styles.input}
          placeholder="Preferred industry"
          placeholderTextColor="#A0A0A0"
          value={profileFormData.industry}
          onChangeText={(text) => updateProfileData("industry", text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Time Commitment</Text>
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressStep,
                {
                  backgroundColor:
                    currentStep === "signUp" ? "#4B2E83" : "#D8D3E8",
                },
              ]}
            />
            <View style={styles.progressLine} />
            <View
              style={[
                styles.progressStep,
                {
                  backgroundColor:
                    currentStep === "profile" ? "#4B2E83" : "#D8D3E8",
                },
              ]}
            />
            <View style={styles.progressLine} />
            <View
              style={[
                styles.progressStep,
                {
                  backgroundColor:
                    currentStep === "skills" ? "#4B2E83" : "#D8D3E8",
                },
              ]}
            />
            <View style={styles.progressLine} />
            <View
              style={[
                styles.progressStep,
                {
                  backgroundColor:
                    currentStep === "coFounderPreferences"
                      ? "#4B2E83"
                      : "#D8D3E8",
                },
              ]}
            />
          </View>

          {/* Form content based on current step */}
          {currentStep === "signUp" && renderSignUp()}
          {currentStep === "profile" && renderProfile()}
          {currentStep === "skills" && renderSkills()}
          {currentStep === "coFounderPreferences" && renderPreferences()}

          {/* Navigation buttons */}
          <View style={styles.buttonContainer}>
            {currentStep !== "profile" && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentStep === "coFounderPreferences" ? "Complete" : "Next"}
              </Text>
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
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  progressStep: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4B2E83",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#D8D3E8",
  },
  formContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4B2E83",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B2E83",
    marginTop: 16,
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 16,
  },
  skillButton: {
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedSkillButton: {
    backgroundColor: "#4B2E83",
  },
  skillButtonText: {
    color: "#333",
    fontSize: 14,
  },
  selectedSkillButtonText: {
    color: "white",
  },
  timeCommitmentContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  timeCommitmentButton: {
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginRight: 12,
  },
  selectedTimeCommitmentButton: {
    backgroundColor: "#4B2E83",
  },
  timeCommitmentButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
  selectedTimeCommitmentButtonText: {
    color: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  backButton: {
    borderWidth: 1,
    borderColor: "#4B2E83",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  backButtonText: {
    color: "#4B2E83",
    fontSize: 16,
    fontWeight: "bold",
  },
  nextButton: {
    backgroundColor: "#4B2E83",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
