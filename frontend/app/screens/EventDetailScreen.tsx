import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventsStackScreenProps } from '../navigation/TabNavigator';
import { format, parseISO } from 'date-fns';

type Props = EventsStackScreenProps<'EventDetail'>;

const EventDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  // Add safety check for route.params
  const { event } = route.params || {};
  
  // Safety check to handle missing event data
  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#4B2E83" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event details not available</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Format date for display
  const formattedDate = event.date ? format(parseISO(event.date), 'dd MMMM yyyy, h:mm a') : 'Date not specified';
  
  // Safely get date components for the header
  const eventDate = event.date ? parseISO(event.date) : new Date();
  const dayOfMonth = format(eventDate, 'd');
  const month = format(eventDate, 'MMM');

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
        <Text style={styles.headerTitle}>{event.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Event Type Label */}
        {event.type && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{event.type}</Text>
          </View>
        )}

        {/* Date and Time Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date and Time</Text>
          <View style={styles.sectionContent}>
            <View style={styles.dateTimeRow}>
              <View style={styles.dateBox}>
                <Text style={styles.dateDay}>{dayOfMonth}</Text>
                <Text style={styles.dateMonth}>{month}</Text>
              </View>
              <View style={styles.timeDetails}>
                <Text style={styles.timeText}>{formattedDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.locationText}>{event.location || 'Location not specified'}</Text>
            
            {/* Map Preview Placeholder */}
            <View style={styles.mapPreview}>
              <Text style={styles.mapPreviewText}>Map Preview</Text>
            </View>
          </View>
        </View>

        {/* About This Event Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Event</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.descriptionText}>
              {event.description || 'No description available'}
            </Text>
          </View>
        </View>

        {/* Attending Startups Section - with safety checks */}
        {event.tags && event.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attending Startups</Text>
            <View style={styles.tagsContainer}>
              {event.tags.map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Book Button */}
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book via Student Hub</Text>
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
    paddingBottom: 32,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4B2E83',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B2E83',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBox: {
    backgroundColor: '#4B2E83',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    marginRight: 16,
  },
  dateDay: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateMonth: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  timeDetails: {
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  mapPreview: {
    height: 150,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPreviewText: {
    color: '#666',
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#4B2E83',
    fontSize: 14,
  },
  bookButton: {
    backgroundColor: '#4B2E83',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4B2E83',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default EventDetailScreen;