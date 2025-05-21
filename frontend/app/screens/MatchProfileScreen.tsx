import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useChatMessages } from "hooks/useChatMessages";
import { useSupabase } from "../hooks/supabase";
import { useChats } from "../hooks/useChats";
import { useApi } from "../hooks/useAPI";
import { createChat } from "../services/chatService";
import { useProfile } from "../hooks/useProfile";
import { create } from "axios";

// Define the types for our route params
interface Match {
  id: number;
  memberId: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  skills: string[];
  interests: string[];
}

type MatchProfileStackParamList = {
  MatchProfile: {
    match: Match;
  };
};

type MatchProfileRouteProp = RouteProp<
  MatchProfileStackParamList,
  "MatchProfile"
>;

type Props = {
  route: MatchProfileRouteProp;
  navigation: StackNavigationProp<any>;
};

const MatchProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { match } = route.params;
  const [meetingModalVisible, setMeetingModalVisible] = useState(false);
  const [meetingDate, setMeetingDate] = useState(new Date());
  const [meetingNote, setMeetingNote] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { supabase } = useSupabase();
  const { createPrivateChat } = useChats(supabase);
  const {
    loading,
    data,
    errors,
    submit: submitCreateChat,
  } = useApi(createChat);
  const { profile } = useProfile();

  if (!profile) {
    throw Error("MatchProfile requires profile");
  }

  // Function to navigate to chat with this specific match
  const handleMessagePress = async () => {
    console.info("Creating new private chat");
    const userIds = [profile.id, "080d0fda-47ef-4348-a17e-523579d45b95"];
    console.info("User IDS:", userIds);
    const chat = await submitCreateChat(userIds);

    if (!chat) return;

    // Navigate to the Messages tab first, then to the specific Chat screen
    navigation.navigate("Messages", {
      screen: "MessagesList", // Navigate to the first screen in the Messages stack
    });

    // Give it a moment to navigate to the Messages tab before trying to navigate to Chat
    setTimeout(() => {
      navigation.navigate("Messages", {
        screen: "Chat", // Screen name in the Messages stack
        params: {
          chatId: chat.id,
          name: match.name,
          avatar: match.image,
          isGroup: false,
        },
      });
    }, 100);
  };

  // Function to toggle meeting scheduling modal
  const toggleMeetingModal = () => {
    setMeetingModalVisible(!meetingModalVisible);
  };

  // Function to handle date changes
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || meetingDate;
    setShowDatePicker(false);
    setMeetingDate(currentDate);
  };

  // Function to schedule the meeting
  const handleScheduleMeeting = () => {
    // Here you would save the meeting to your backend
    // For now, we'll just close the modal and show a success message
    toggleMeetingModal();
    alert(
      `Meeting scheduled with ${match.name} on ${meetingDate.toLocaleString()}`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#4B2E83" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: match.image }} style={styles.profileImage} />
          <Text style={styles.profileName}>{match.name}</Text>
          <Text style={styles.profileRole}>{match.role}</Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleMessagePress}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#4B2E83" />
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={toggleMeetingModal}
            >
              <Ionicons name="calendar-outline" size={24} color="#4B2E83" />
              <Text style={styles.actionButtonText}>Schedule Meeting</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{match.bio}</Text>
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.tagsContainer}>
            {match.skills.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.tagsContainer}>
            {match.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Compatibility Section - Mock data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compatibility</Text>
          <View style={styles.compatibilityContainer}>
            <View style={styles.compatibilityItem}>
              <Text style={styles.compatibilityLabel}>Skills Match</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "75%" }]} />
              </View>
              <Text style={styles.compatibilityValue}>75%</Text>
            </View>

            <View style={styles.compatibilityItem}>
              <Text style={styles.compatibilityLabel}>Interest Overlap</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "60%" }]} />
              </View>
              <Text style={styles.compatibilityValue}>60%</Text>
            </View>

            <View style={styles.compatibilityItem}>
              <Text style={styles.compatibilityLabel}>Overall Match</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "82%" }]} />
              </View>
              <Text style={styles.compatibilityValue}>82%</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Meeting Scheduling Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={meetingModalVisible}
        onRequestClose={toggleMeetingModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule a Meeting</Text>
              <TouchableOpacity onPress={toggleMeetingModal}>
                <Ionicons name="close" size={24} color="#4B2E83" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Meeting with {match.name}</Text>

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {meetingDate.toLocaleString()}
              </Text>
              <Ionicons name="calendar" size={20} color="#4B2E83" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={meetingDate}
                mode="datetime"
                display="default"
                onChange={onDateChange}
              />
            )}

            <Text style={styles.inputLabel}>Meeting notes</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Add details about the meeting..."
              placeholderTextColor="#999"
              multiline
              value={meetingNote}
              onChangeText={setMeetingNote}
            />

            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={handleScheduleMeeting}
            >
              <Text style={styles.scheduleButtonText}>Schedule Meeting</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4B2E83",
    flex: 1,
    textAlign: "center",
    marginRight: 30, // Offset for the back button to center the title
  },
  backButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  actionButton: {
    alignItems: "center",
    marginHorizontal: 16,
  },
  actionButtonText: {
    marginTop: 4,
    color: "#4B2E83",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B2E83",
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillTag: {
    backgroundColor: "#4B2E83",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: "white",
    fontSize: 14,
  },
  interestTag: {
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: "#666",
    fontSize: 14,
  },
  compatibilityContainer: {
    marginTop: 8,
  },
  compatibilityItem: {
    marginBottom: 12,
  },
  compatibilityLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4B2E83",
    borderRadius: 4,
  },
  compatibilityValue: {
    fontSize: 14,
    color: "#4B2E83",
    fontWeight: "bold",
    textAlign: "right",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 340,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4B2E83",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    height: 100,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  scheduleButton: {
    backgroundColor: "#4B2E83",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  scheduleButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MatchProfileScreen;
