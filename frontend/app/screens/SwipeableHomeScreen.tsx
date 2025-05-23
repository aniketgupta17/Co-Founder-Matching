import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../navigation/TabNavigator";
import { useApi } from "../hooks/useAPI";
import { fetchRecommendedMatches } from "../services/matchService";
import { ProfileData } from "../types/matches";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SWIPE_THRESHOLD = 120;

interface ProfileCardProps {
  profile: ProfileData;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onBookmark?: (profileId: string) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onSwipeLeft,
  onSwipeRight,
  onBookmark,
}) => {
  const position = useRef(new Animated.ValueXY()).current;
  const [isScrolling, setIsScrolling] = useState(false);

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  const cardStyle = {
    transform: [
      { translateX: position.x },
      { rotate: isScrolling ? "0deg" : rotate },
    ],
  };

  // Function to handle manual like button press
  const handleLike = () => {
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onSwipeRight();
    });
  };

  // Function to handle manual dislike button press
  const handleReject = () => {
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onSwipeLeft();
    });
  };

  const handleBookmark = () => {
    onBookmark && onBookmark(profile.id);
  };

  // Reset position when profile changes
  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
  }, [profile.id]);

  // Use either avatar or image depending on what's available
  const profileImage =
    profile.avatar || "https://randomuser.me/api/portraits/men/1.jpg";

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.cardContent, cardStyle]}>
        <ScrollView
          showsVerticalScrollIndicator={true}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScrollBeginDrag={() => setIsScrolling(true)}
          onScrollEndDrag={() => setIsScrolling(false)}
        >
          {/* Basic profile info header */}
          <View style={styles.profileHeader}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileRole}>{profile.role || ""}</Text>
            {profile.location && (
              <View style={styles.locationContainer}>
                <Text style={styles.locationText}>📍 {profile.location}</Text>
              </View>
            )}
          </View>

          {/* Status indicators */}
          <View style={styles.statusContainer}>
            {profile.lookingForCofounders && (
              <View style={styles.statusItem}>
                <Text style={styles.statusEmoji}>🔍</Text>
                <Text style={styles.statusText}>
                  Looking for cofounder to join existing idea
                </Text>
              </View>
            )}
            {profile.fullTimeStartup && (
              <View style={styles.statusItem}>
                <Text style={styles.statusEmoji}>⏱</Text>
                <Text style={styles.statusText}>
                  Already full-time on a startup
                </Text>
              </View>
            )}
            {profile.foundedCompany && (
              <View style={styles.statusItem}>
                <Text style={styles.statusEmoji}>🚀</Text>
                <Text style={styles.statusText}>
                  Founded/cofounded a company
                </Text>
              </View>
            )}
          </View>

          {/* Experience section */}
          {profile.experience && profile.experience.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experiences</Text>

              {profile.experience.map((exp, index) => (
                <View key={index} style={styles.experienceItem}>
                  <View style={styles.companyLogoContainer}>
                    {exp.logo ? (
                      <Image
                        source={{ uri: exp.logo }}
                        style={styles.companyLogo}
                      />
                    ) : (
                      <View
                        style={[styles.companyLogo, styles.placeholderLogo]}
                      >
                        <Text style={styles.placeholderText}>
                          {exp.company.charAt(0).toLowerCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.experienceDetails}>
                    <Text style={styles.roleText}>{exp.role}</Text>
                    <Text style={styles.companyText}>{exp.company}</Text>
                    <Text style={styles.durationText}>{exp.duration}</Text>
                  </View>
                </View>
              ))}

              {profile.experience.length > 3 && (
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>See all experiences</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Interests section */}
          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>I'm interested in</Text>
              <View style={styles.interestsContainer}>
                {profile.interests.map((interest, index) => (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Education section */}
          {profile.education && profile.education.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              {profile.education.map((edu, index) => (
                <View key={index} style={styles.educationItem}>
                  {edu.logo ? (
                    <Image source={{ uri: edu.logo }} style={styles.eduLogo} />
                  ) : (
                    <View style={[styles.eduLogo, styles.placeholderLogo]}>
                      <Text style={styles.placeholderText}>🎓</Text>
                    </View>
                  )}
                  <View style={styles.eduDetails}>
                    <Text style={styles.eduName}>{edu.institution}</Text>
                    <Text style={styles.eduDegree}>{edu.degree}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Skills section */}
          {profile.skills && profile.skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills & Expertise</Text>
              <View style={styles.skillsContainer}>
                {profile.skills.map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Current project */}
          {profile.currentProject && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Project</Text>
              <Text style={styles.projectTitle}>
                {profile.currentProject.title}
              </Text>
              <Text style={styles.projectDescription}>
                {profile.currentProject.description}
              </Text>
            </View>
          )}

          {/* Add extra padding at bottom to ensure content is visible above buttons */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </Animated.View>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
          <Text style={styles.rejectButtonText}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Text style={styles.likeButtonText}>✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Add a PanResponder component to handle swipe gestures
const SwipeableCard: React.FC<ProfileCardProps> = (props) => {
  const { profile, onSwipeLeft, onSwipeRight } = props;
  const position = useRef(new Animated.ValueXY()).current;
  const [isScrolling, setIsScrolling] = useState(false);

  // Create interpolated values for rotation and opacity
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isScrolling,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return !isScrolling && Math.abs(dx) > Math.abs(dy) * 2;
      },
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: 0 });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swiped right - like
          Animated.spring(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: 0 },
            useNativeDriver: true,
          }).start(() => {
            onSwipeRight();
          });
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swiped left - dislike
          Animated.spring(position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
            useNativeDriver: true,
          }).start(() => {
            onSwipeLeft();
          });
        } else {
          // Return to center
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Reset position when profile changes
  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
  }, [profile.id]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            { translateX: position.x },
            { rotate: isScrolling ? "0deg" : rotate },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <ProfileCard
        profile={profile}
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
        onBookmark={() => {}}
      />
    </Animated.View>
  );
};

const SwipeableHomeScreen: React.FC = () => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookmarkedProfiles, setBookmarkedProfiles] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { submit: fetchRecommended } = useApi(fetchRecommendedMatches);
  const [errors, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const profileData = await fetchRecommended();
      if (!profileData) {
        console.error("Failed to fetch profiles");
        return;
      }
      setProfiles(profileData);
    };
    fetch();
  }, [fetchRecommended]);

  const handleSwipeLeft = () => {
    // Handle reject action
    console.log("Rejected profile:", profiles[currentIndex]?.name);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleSwipeRight = () => {
    // Handle like action
    console.log("Liked profile:", profiles[currentIndex]?.name);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleBookmark = (profileId: number) => {
    if (bookmarkedProfiles.includes(profileId)) {
      setBookmarkedProfiles(
        bookmarkedProfiles.filter((id) => id !== profileId)
      );
      console.log("Unbookmarked profile:", profileId);
    } else {
      setBookmarkedProfiles([...bookmarkedProfiles, profileId]);
      console.log("Bookmarked profile:", profileId);
    }
  };

  const resetProfiles = () => {
    setCurrentIndex(0);
    // In a real app, you would fetch new profiles here
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B2E83" />
      </View>
    );
  }

  if (errors) {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>Error loading profiles</Text>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.resetButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>No profiles available</Text>
      </View>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>No more profiles</Text>
        <TouchableOpacity style={styles.resetButton} onPress={resetProfiles}>
          <Text style={styles.resetButtonText}>Start Over</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
      </View>

      <View style={styles.cardContainer}>
        {/* Only render the current profile card */}
        {currentIndex < profiles.length && (
          <SwipeableCard
            profile={profiles[currentIndex]}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: "#F8F8F8",
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4B2E83",
    marginBottom: 16,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  card: {
    width: SCREEN_WIDTH - 20,
    height: "95%",
    borderRadius: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileHeader: {
    padding: 16,
    backgroundColor: "white",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 18,
    color: "#666",
    marginBottom: 8,
  },
  locationContainer: {
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: "#666",
  },
  statusContainer: {
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#333",
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B2E83",
    marginBottom: 12,
  },
  experienceItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  companyLogoContainer: {
    marginRight: 12,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderLogo: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  experienceDetails: {
    flex: 1,
  },
  roleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  companyText: {
    fontSize: 14,
    color: "#666",
  },
  durationText: {
    fontSize: 12,
    color: "#999",
  },
  seeAllButton: {
    alignSelf: "center",
    marginTop: 8,
  },
  seeAllText: {
    color: "#4B2E83",
    fontSize: 14,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    fontSize: 12,
    color: "#4B2E83",
  },
  educationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  eduLogo: {
    width: 36,
    height: 36,
    borderRadius: 6,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  eduDetails: {
    flex: 1,
  },
  eduName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  eduDegree: {
    fontSize: 14,
    color: "#666",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillTag: {
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: "#4B2E83",
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  actionButtons: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  rejectButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  rejectButtonText: {
    fontSize: 24,
    color: "#FF6B6B",
  },
  likeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#4CD964",
  },
  likeButtonText: {
    fontSize: 24,
    color: "#4CD964",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  resetButton: {
    backgroundColor: "#4B2E83",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SwipeableHomeScreen;
