import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the types for our route params
interface Profile {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
  skills: string[];
  interests: string[];
  source?: 'search' | 'qr' | 'recommended'; // Where this profile was found
}

type SearchProfileStackParamList = {
  SearchProfile: {
    profile: Profile;
  };
};

type SearchProfileRouteProp = RouteProp<SearchProfileStackParamList, 'SearchProfile'>;

type Props = {
  route: SearchProfileRouteProp;
  navigation: StackNavigationProp<any>;
};

// Define valid icon names
type IconName = React.ComponentProps<typeof Ionicons>['name'];

const SearchedProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { profile } = route.params;
  const [connectionSent, setConnectionSent] = useState(false);
  
  // Function to send connection request
  const handleSendConnection = () => {
    // In a real app, this would call your API to send a connection request
    Alert.alert(
      "Connection Request",
      `Connection request sent to ${profile.name}!`,
      [{ text: "OK" }]
    );
    setConnectionSent(true);
  };

  // Get source label text based on where the profile was found
  const getSourceLabel = (): { icon: IconName; text: string } => {
    switch (profile.source) {
      case 'qr':
        return { icon: 'qr-code-outline', text: 'Found via QR Code' };
      case 'search':
        return { icon: 'search-outline', text: 'Found via Search' };
      case 'recommended':
        return { icon: 'thumbs-up-outline', text: 'Recommended for You' };
      default:
        return { icon: 'person-outline', text: 'Profile View' };
    }
  };

  const sourceInfo = getSourceLabel();

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
          <Image
            source={{ uri: profile.image }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileRole}>{profile.role}</Text>
          
          {/* Source label - Shows how you found this person */}
          <View style={styles.sourceLabel}>
            <Ionicons name={sourceInfo.icon} size={16} color="#4B2E83" />
            <Text style={styles.sourceLabelText}>{sourceInfo.text}</Text>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.tagsContainer}>
            {profile.skills.map((skill, index) => (
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
            {profile.interests.map((interest, index) => (
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
                <View style={[styles.progressFill, { width: '65%' }]} />
              </View>
              <Text style={styles.compatibilityValue}>65%</Text>
            </View>
            
            <View style={styles.compatibilityItem}>
              <Text style={styles.compatibilityLabel}>Interest Overlap</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '55%' }]} />
              </View>
              <Text style={styles.compatibilityValue}>55%</Text>
            </View>
            
            <View style={styles.compatibilityItem}>
              <Text style={styles.compatibilityLabel}>Overall Match</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '70%' }]} />
              </View>
              <Text style={styles.compatibilityValue}>70%</Text>
            </View>
          </View>
        </View>

        {/* Connection Request Button */}
        <TouchableOpacity 
          style={[
            styles.connectButton,
            connectionSent && styles.connectButtonDisabled
          ]}
          onPress={handleSendConnection}
          disabled={connectionSent}
        >
          <Text style={styles.connectButtonText}>
            {connectionSent ? "Connection Request Sent" : "Send Connection Request"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B2E83',
    flex: 1,
    textAlign: 'center',
    marginRight: 30, // Offset for the back button to center the title
  },
  backButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
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
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  sourceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE6F7',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 8,
  },
  sourceLabelText: {
    fontSize: 12,
    color: '#4B2E83',
    marginLeft: 4,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B2E83',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  tagsContainer: {
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
  compatibilityContainer: {
    marginTop: 8,
  },
  compatibilityItem: {
    marginBottom: 12,
  },
  compatibilityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4B2E83',
    borderRadius: 4,
  },
  compatibilityValue: {
    fontSize: 14,
    color: '#4B2E83',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  connectButton: {
    backgroundColor: '#4B2E83',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  connectButtonDisabled: {
    backgroundColor: '#A99BC7', // Lighter purple
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchedProfileScreen; 