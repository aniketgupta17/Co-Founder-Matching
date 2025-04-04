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
import { useSupabase } from "../hooks/supabase";
import { useAuth } from "../hooks/supabase";

// You'll need to add these skill/expertise options
const skillOptions = [
  "Product",
  "Design",
  "Sales",
  "Marketing",
  "Engineering",
  "Finance",
  "Operations",
  "Legal",
  "HR",
  "Content",
];

type ProfileSetupStep =
  | "basicInfo"
  | "skillsExpertise"
  | "cofounderPreferences";

export default function ProfileSetupScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentStep, setCurrentStep] = useState<ProfileSetupStep>("basicInfo");

  const { signUp } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    bio: "",
    skills: [] as string[],
    lookingFor: [] as string[],
    timeCommitment: "",
    industry: "",
  });

  // Update form data
  const updateFormData = (key: string, value: any) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    if (formData.skills.includes(skill)) {
      updateFormData(
        "skills",
        formData.skills.filter((s) => s !== skill)
      );
    } else {
      updateFormData("skills", [...formData.skills, skill]);
    }
  };

  // Toggle looking for selection
  const toggleLookingFor = (skill: string) => {
    if (formData.lookingFor.includes(skill)) {
      updateFormData(
        "lookingFor",
        formData.lookingFor.filter((s) => s !== skill)
      );
    } else {
      updateFormData("lookingFor", [...formData.lookingFor, skill]);
    }
  };

  // Handle next button click
  const handleNext = async () => {
    if (currentStep === "basicInfo") {
      setCurrentStep("skillsExpertise");
    } else if (currentStep === "skillsExpertise") {
      setCurrentStep("cofounderPreferences");
    } else {
      // Profile setup complete, navigate to main tabs
      await signUp({
        email: formData.email,
        password: formData.password,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      });
    }
  };

  // Handle back button click
  const handleBack = () => {
    if (currentStep === "skillsExpertise") {
      setCurrentStep("basicInfo");
    } else if (currentStep === "cofounderPreferences") {
      setCurrentStep("skillsExpertise");
    }
  };

  // Render Basic Information form
  const renderBasicInfo = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      <Text style={styles.sectionSubtitle}>Let's get to know you better</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#A0A0A0"
          value={formData.fullName}
          onChangeText={(text) => updateFormData("fullName", text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => updateFormData("email", text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Create a password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => updateFormData("password", text)}
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
          value={formData.bio}
          onChangeText={(text) => updateFormData("bio", text)}
        />
      </View>
    </View>
  );

  // Render Skills & Expertise form
  const renderSkillsExpertise = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Skills & Expertise</Text>
      <Text style={styles.sectionSubtitle}>What are you good at?</Text>

      <View style={styles.skillsContainer}>
        {skillOptions.map((skill) => (
          <TouchableOpacity
            key={skill}
            style={[
              styles.skillButton,
              formData.skills.includes(skill) && styles.selectedSkillButton,
            ]}
            onPress={() => toggleSkill(skill)}
          >
            <Text
              style={[
                styles.skillButtonText,
                formData.skills.includes(skill) &&
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
  const renderCofounderPreferences = () => (
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
              formData.lookingFor.includes(skill) && styles.selectedSkillButton,
            ]}
            onPress={() => toggleLookingFor(skill)}
          >
            <Text
              style={[
                styles.skillButtonText,
                formData.lookingFor.includes(skill) &&
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
          value={formData.industry}
          onChangeText={(text) => updateFormData("industry", text)}
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
                formData.timeCommitment === option &&
                  styles.selectedTimeCommitmentButton,
              ]}
              onPress={() => updateFormData("timeCommitment", option)}
            >
              <Text
                style={[
                  styles.timeCommitmentButtonText,
                  formData.timeCommitment === option &&
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
                    currentStep === "basicInfo" ? "#4B2E83" : "#D8D3E8",
                },
              ]}
            />
            <View style={styles.progressLine} />
            <View
              style={[
                styles.progressStep,
                {
                  backgroundColor:
                    currentStep === "skillsExpertise" ? "#4B2E83" : "#D8D3E8",
                },
              ]}
            />
            <View style={styles.progressLine} />
            <View
              style={[
                styles.progressStep,
                {
                  backgroundColor:
                    currentStep === "cofounderPreferences"
                      ? "#4B2E83"
                      : "#D8D3E8",
                },
              ]}
            />
          </View>

          {/* Form content based on current step */}
          {currentStep === "basicInfo" && renderBasicInfo()}
          {currentStep === "skillsExpertise" && renderSkillsExpertise()}
          {currentStep === "cofounderPreferences" &&
            renderCofounderPreferences()}

          {/* Navigation buttons */}
          <View style={styles.buttonContainer}>
            {currentStep !== "basicInfo" && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentStep === "cofounderPreferences" ? "Complete" : "Next"}
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
