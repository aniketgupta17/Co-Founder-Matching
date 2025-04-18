import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { EventsStackScreenProps } from '../navigation/TabNavigator';

type Props = EventsStackScreenProps<'EventDetail'>;

const EventDetailScreen: React.FC<Props> = ({ route, navigation }) => {
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

      {/* 添加的日历按钮 - 保持原有样式不变 */}
      <TouchableOpacity 
        style={styles.calendarButton}
        onPress={() => navigation.navigate('EventCalendar', { event })}
      >
        <Text style={styles.buttonText}>View in Calendar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 80,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4B2E83',
    textAlign: 'center',
  },
  badge: {
    backgroundColor: '#4B2E83',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 8,
  },
  mapText: {
    color: '#666',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#EDE7F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#4B2E83',
    fontSize: 12,
  },
  // 新增的日历按钮样式
  calendarButton: {
    backgroundColor: '#4B2E83',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default EventDetailScreen;