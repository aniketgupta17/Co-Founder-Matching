import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  MainTabParamList,
  MatchStackParamList,
} from "../navigation/TabNavigator";
import { useMockApi } from "../hooks/useMockApi";
import { Ionicons } from "@expo/vector-icons";
import { Match } from "../types/matches";
import { useMatches } from "../hooks/useMatches";
import { useSupabase } from "../hooks/supabase";
// Define combined navigation type for Match screen
type MatchScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<MatchStackParamList, "MatchesList">,
  BottomTabNavigationProp<MainTabParamList>
>;

interface MatchData {
  message: string;
  matches: Match[];
}

const MatchScreen: React.FC = () => {
  const { data, loading, error } = useMockApi("matches") as {
    data: MatchData | null;
    loading: boolean;
    error: string | null;
  };
  const navigation = useNavigation<MatchScreenNavigationProp>();
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const { supabase } = useSupabase();
  const { matches } = useMatches(supabase);
  // Handle match profile press
  const handleMatchPress = (match: Match) => {
    // Navigate to profile view using the stack navigation
    navigation.navigate("MatchProfile", { match });
  };

  // Toggle QR code modal
  const toggleQrModal = () => {
    setQrModalVisible(!qrModalVisible);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B2E83" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.navigate("Match")}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Matches</Text>
          </View>
          <View style={styles.headerRight}>
            {/* QR Code Button */}
            <TouchableOpacity style={styles.qrButton} onPress={toggleQrModal}>
              <Ionicons name="qr-code-outline" size={24} color="#4B2E83" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Image
                source={{
                  uri: "https://randomuser.me/api/portraits/men/75.jpg",
                }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Matches List */}
        <View style={styles.matchesList}>
          {matches?.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={styles.matchCard}
              onPress={() => handleMatchPress(match)}
            >
              <Image
                source={{ uri: match.image || "" }}
                style={styles.matchImage}
              />
              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>{match.name}</Text>
                <Text style={styles.matchRole}>{match.role}</Text>
                <Text style={styles.matchBio}>{match.bio}</Text>
                <View style={styles.skillsContainer}>
                  {match.skills.map((skill, index) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.interestsContainer}>
                  {match.interests.map((interest, index) => (
                    <View key={index} style={styles.interestTag}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* QR Code Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={qrModalVisible}
        onRequestClose={toggleQrModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Your Profile</Text>
              <TouchableOpacity onPress={toggleQrModal}>
                <Ionicons name="close" size={24} color="#4B2E83" />
              </TouchableOpacity>
            </View>

            <View style={styles.qrContainer}>
              {/* Placeholder for QR code image */}
              <View style={styles.qrCode}>
                <Text style={styles.qrPlaceholder}>Your QR Code</Text>
              </View>
              <Text style={styles.qrInstructions}>
                Scan this QR code to instantly share your profile with others
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={toggleQrModal}
            >
              <Text style={styles.modalButtonText}>Close</Text>
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
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4B2E83",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4B2E83",
  },
  qrButton: {
    padding: 8,
    marginRight: 16,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  matchesList: {
    marginTop: 16,
  },
  matchCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  matchImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  matchRole: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  matchBio: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  skillTag: {
    backgroundColor: "#4B2E83",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  interestTag: {
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: "#666",
    fontSize: 12,
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
  qrContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  qrCode: {
    width: 200,
    height: 200,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  qrPlaceholder: {
    color: "#666",
    fontSize: 16,
  },
  qrInstructions: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: "#4B2E83",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MatchScreen;
