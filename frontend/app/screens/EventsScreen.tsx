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

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
}

interface EventsData {
  message: string;
  events: Event[];
}

const EventsScreen: React.FC = () => {
  const { data, loading, error } = useMockApi('events') as { data: EventsData | null; loading: boolean; error: string | null };
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
          onPress={() => navigation.navigate('Events')}
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
          <Text style={styles.headerTitle}>Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/75.jpg' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Events List */}
        <View style={styles.eventsList}>
          {data?.events?.map((event: Event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventDateBox}>
                <Text style={styles.eventMonth}>
                  {new Date(event.date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                </Text>
                <Text style={styles.eventDay}>
                  {new Date(event.date).getDate()}
                </Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventLocation}>{event.location}</Text>
                <Text style={styles.eventDescription}>{event.description}</Text>
              </View>
            </View>
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
  eventsList: {
    marginTop: 16,
  },
  eventCard: {
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
  eventDateBox: {
    backgroundColor: '#4B2E83',
    borderRadius: 8,
    padding: 8,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  eventMonth: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  eventDay: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default EventsScreen;