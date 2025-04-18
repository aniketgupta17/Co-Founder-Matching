import React from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/TabNavigator';
import { useMockApi } from '../hooks/useMockApi';

interface Match {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
  skills: string[];
  interests: string[];
}

interface MatchData {
  message: string;
  matches: Match[];
}

const MatchScreen: React.FC = () => {
  const { data, loading, error } = useMockApi('matches') as { data: MatchData | null; loading: boolean; error: string | null };
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

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
          onPress={() => navigation.navigate('Match')}
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
          <Text style={styles.headerTitle}>Matches</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/75.jpg' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Matches List */}
        <View style={styles.matchesList}>
          {data?.matches?.map((match) => (
            <TouchableOpacity 
              key={match.id} 
              style={styles.matchCard}
              onPress={() => navigation.navigate('Messages')}
            >
              <Image source={{ uri: match.image }} style={styles.matchImage} />
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
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  matchesList: {
    marginTop: 16,
  },
  matchCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
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
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  matchRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  matchBio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  skillTag: {
    backgroundColor: '#4B2E83',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: '#666',
    fontSize: 12,
  },
});

export default MatchScreen;