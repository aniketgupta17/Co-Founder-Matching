import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { EventsStackParamList } from '../navigation/TabNavigator';

type EventDetailProps = {
  route: RouteProp<EventsStackParamList, 'EventDetail'>;
};

const EventDetailScreen: React.FC<EventDetailProps> = ({ route }) => {
  const { event } = route.params;

  const formattedDate = new Date(event.date).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{event.title}</Text>
        {event.type && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{event.type}</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Date and Time</Text>
        <Text style={styles.cardContent}>{formattedDate}</Text>
      </View>

      <Text style={styles.sectionTitle}>Location</Text>
      <Text style={styles.sectionContent}>{event.location}</Text>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Map Preview</Text>
      </View>

      <Text style={styles.sectionTitle}>About This Event</Text>
      <Text style={styles.sectionContent}>{event.description}</Text>

      {event.tags.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Attending Startups</Text>
          <View style={styles.tagContainer}>
            {event.tags.map((tag, idx) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </>
      )}


      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Book via Student Hub</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 80, // Added top padding for space at the top
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4B2E83',
    textAlign: 'center',
  },
  badge: {
    marginTop: 8,
    backgroundColor: '#E9DFFB',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  badgeText: {
    fontSize: 14,
    color: '#4B2E83',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#F5F3F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 15,
    color: '#444',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  sectionContent: {
    fontSize: 15,
    color: '#444',
    marginBottom: 12,
    lineHeight: 22,
  },
  mapPlaceholder: {
    height: 80,
    backgroundColor: '#F5F3F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapText: {
    color: '#999',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#E9DFFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginTop: 6,
  },
  tagText: {
    color: '#4B2E83',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#4B2E83',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});


export default EventDetailScreen;
