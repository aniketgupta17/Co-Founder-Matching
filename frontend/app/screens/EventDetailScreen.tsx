import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Platform,
  Linking,
  Dimensions,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventsStackScreenProps } from '../navigation/TabNavigator';
import { format, parseISO } from 'date-fns';

type Props = EventsStackScreenProps<'EventDetail'>;

// Basic geocoding function to get coordinates from address
// In a real app, you would use a geocoding service API
const geocodeLocation = (locationStr: string) => {
  // For demo purposes, we'll return fixed coordinates based on some keywords in the location
  // In a real app, use Google Geocoding API or similar service
  if (locationStr.toLowerCase().includes('brisbane')) {
    return { latitude: -27.4698, longitude: 153.0251, name: 'Brisbane' };
  } else if (locationStr.toLowerCase().includes('sydney')) {
    return { latitude: -33.8688, longitude: 151.2093, name: 'Sydney' };
  } else if (locationStr.toLowerCase().includes('melbourne')) {
    return { latitude: -37.8136, longitude: 144.9631, name: 'Melbourne' };
  } else if (locationStr.toLowerCase().includes('perth')) {
    return { latitude: -31.9505, longitude: 115.8605, name: 'Perth' };
  } else {
    // Default to UQ St Lucia campus if no known location
    return { latitude: -27.4975, longitude: 153.0137, name: 'Brisbane' };
  }
};

// Function to get a static map image URL
const getStaticMapUrl = (latitude: number, longitude: number, zoom: number = 14) => {
  // Use OpenStreetMap static map service
  return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=600x400&markers=color:red%7C${latitude},${longitude}&key=AIzaSyDFNBNpGrqiSzn7VRbaVQT5s-IW2FboJl4`;
};

const EventDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  // Add safety check for route.params
  const { event } = route.params || {};
  
  const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0, name: '' });
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (event && event.location) {
      // Get coordinates from location string
      const coords = geocodeLocation(event.location);
      setCoordinates(coords);
    }
  }, [event]);
  
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

  // Handle open in maps
  const openInMaps = () => {
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = Platform.OS === 'ios' 
      ? `${scheme}?q=${event.location}` 
      : `${scheme}0,0?q=${event.location}`;
    
    Linking.openURL(url).catch(err => {
      console.error('An error occurred', err);
    });
  };

  // Get static map image URL
  const mapImageUrl = getStaticMapUrl(coordinates.latitude, coordinates.longitude);

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
            
            {/* Static Map Image */}
            <View style={styles.mapContainer}>
              {coordinates.latitude !== 0 && (
                <>
                  <View style={styles.staticMapContainer}>
                    <Image
                      source={{ uri: mapImageUrl }}
                      style={styles.staticMapImage}
                      onLoadStart={() => setImageLoading(true)}
                      onLoadEnd={() => setImageLoading(false)}
                    />
                    {imageLoading && (
                      <View style={styles.mapLoadingOverlay}>
                        <ActivityIndicator size="large" color="#4B2E83" />
                      </View>
                    )}
                    
                    {/* Map Pin */}
                    <View style={styles.mapPinContainer}>
                      <Ionicons name="location" size={30} color="#4B2E83" />
                    </View>
                    
                    {/* Location Label */}
                    <View style={styles.mapLabelContainer}>
                      <Text style={styles.mapLabelText}>{coordinates.name}</Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.openMapsButton}
                    onPress={openInMaps}
                  >
                    <Ionicons name="navigate" size={16} color="white" />
                    <Text style={styles.openMapsText}>Open in Maps</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>

        {/* About This Event Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Event</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
        </View>
        
        {/* Tags Section */}
        {event.tags && event.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.sectionContent}>
              <View style={styles.tagsContainer}>
                {event.tags.map((tag, index) => (
                  <View key={index} style={styles.tagItem}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
        
        {/* Register for Event Button */}
        {event.type !== 'Meeting' && (
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Register for Event</Text>
          </TouchableOpacity>
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
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 16,
    position: 'relative',
  },
  staticMapContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  staticMapImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  mapPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -30,
    marginLeft: -15,
  },
  mapLabelContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mapLabelText: {
    color: '#4B2E83',
    fontWeight: 'bold',
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.7)',
  },
  openMapsButton: {
    flexDirection: 'row',
    backgroundColor: '#4B2E83',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  openMapsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
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
  tagItem: {
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
  registerButton: {
    backgroundColor: '#4B2E83',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  registerButtonText: {
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