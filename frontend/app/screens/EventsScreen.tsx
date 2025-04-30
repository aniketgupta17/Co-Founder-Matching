import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, EventsStackParamList } from '../navigation/TabNavigator';
import { useMockApi } from '../hooks/useMockApi';
import { Ionicons } from '@expo/vector-icons';

// Define the AppEvent data type
export interface Event {
  id: number;
  title: string;
  type?: string;
  date: string;
  location: string;
  description: string;
  tags: string[];
}

interface EventsData {
  message: string;
  events: Event[];
}

// Define combined navigation types
type EventsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>, // For tab navigation (e.g. navigating to Profile)
  StackNavigationProp<EventsStackParamList> // For event stack navigation (e.g. navigating to EventDetail)
>;

const EventsScreen: React.FC = () => {
  const { data, loading, error } = useMockApi('events') as {
    data: EventsData | null;
    loading: boolean;
    error: string | null;
  };

  const navigation = useNavigation<EventsScreenNavigationProp>(); // Use the combined navigation type

  // Handle event card click to navigate to event details
  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetail', { event }); // Navigate to event detail page
  };

  // Navigate to calendar view
  const handleViewCalendar = () => {
    navigation.navigate('EventCalendar', {});
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
          onPress={() => navigation.navigate('EventsList')} // Retry loading the event list
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
            <Text style={styles.headerTitle}>Events</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.calendarButton}
              onPress={handleViewCalendar}
            >
              <Ionicons name="calendar-outline" size={24} color="#4B2E83" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/75.jpg' }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Upcoming Events Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <Text style={styles.sectionSubtitle}>
            Connect with founders, mentors & investors
          </Text>
        </View>

        {/* Events List */}
        <View style={styles.eventsList}>
          {data?.events?.map((event: Event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => handleEventPress(event)} // Click to navigate to event detail
              activeOpacity={0.8}
            >
              <View style={styles.eventDateBox}>
                <Text style={styles.eventMonth}>
                  {new Date(event.date).toLocaleString('default', {
                    month: 'short',
                  }).toUpperCase()}
                </Text>
                <Text style={styles.eventDay}>
                  {new Date(event.date).getDate()}
                </Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventLocation}>{event.location}</Text>
                <Text style={styles.eventDescription} numberOfLines={2}>
                  {event.description}
                </Text>
                
                {/* Event type tag */}
                {event.type && (
                  <View style={styles.eventTypeContainer}>
                    <Text style={styles.eventType}>{event.type}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  scrollContent: { padding: 16 },
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
  errorText: { color: 'red', fontSize: 16, marginBottom: 20, textAlign: 'center' },
  retryButton: {
    backgroundColor: '#4B2E83',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  retryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#4B2E83' },
  calendarButton: {
    padding: 8,
    marginRight: 16,
  },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  eventsList: { marginTop: 16 },
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
    alignSelf: 'flex-start',
  },
  eventMonth: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  eventDay: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  eventInfo: { flex: 1 },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventLocation: { fontSize: 14, color: '#666', marginBottom: 4 },
  eventDescription: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 8 },
  eventTypeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDE6F7',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  eventType: {
    fontSize: 12,
    color: '#4B2E83',
  },
});

export default EventsScreen;
