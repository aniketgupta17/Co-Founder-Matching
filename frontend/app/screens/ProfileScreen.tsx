import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { ProfileStackScreenProps } from '../navigation/TabNavigator';
import { useProfile } from '../hooks/useProfile';
import { Ionicons } from '@expo/vector-icons';
import { Profile, profileRowToProfile } from '../types/profile';

const ProfileScreen: React.FC<ProfileStackScreenProps<'Profile'>> = ({ navigation }) => {
  const { profile, loading, error, refreshProfile } = useProfile();
  const [imageLoading, setImageLoading] = useState(false);

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
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
          onPress={refreshProfile}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profile data not available</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={refreshProfile}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userProfile = profileRowToProfile(profile);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile', { profile: userProfile })}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={handleSettingsPress}
            >
              <Ionicons name="settings-outline" size={24} color="#4B2E83" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: userProfile.image || 'https://randomuser.me/api/portraits/men/75.jpg' }} 
              style={styles.profileImage}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
            {imageLoading && (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="small" color="#4B2E83" />
              </View>
            )}
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.name}>{userProfile.name}</Text>
            <Text style={styles.role}>{userProfile.role}</Text>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.bioText}>{userProfile.bio}</Text>
        </View>

        {/* Skills */}
        {userProfile.skills && userProfile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {userProfile.skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Interests */}
        {userProfile.interests && userProfile.interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestsContainer}>
              {userProfile.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Experience */}
        {userProfile.experience && userProfile.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {userProfile.experience.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <Text style={styles.companyName}>{exp.company}</Text>
                <Text style={styles.jobTitle}>{exp.role}</Text>
                <Text style={styles.duration}>{exp.duration}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {userProfile.education && userProfile.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {userProfile.education.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <Text style={styles.institutionName}>{edu.institution}</Text>
                <Text style={styles.degreeName}>{edu.degree}</Text>
                <Text style={styles.year}>{edu.year}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4B2E83',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4B2E83',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4B2E83',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 4,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 40,
  },
  profileDetails: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bioText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B2E83',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#4B2E83',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: '#666',
    fontSize: 14,
  },
  experienceItem: {
    marginBottom: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#4B2E83',
    paddingLeft: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    color: '#999',
  },
  educationItem: {
    marginBottom: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#4B2E83',
    paddingLeft: 12,
  },
  institutionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  degreeName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  year: {
    fontSize: 12,
    color: '#999',
  },
});

export default ProfileScreen;