import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useMockApi } from '../hooks/useMockApi';
import { format, parseISO, isSameMonth, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { RouteProp } from '@react-navigation/native';
import { EventsStackParamList } from '../navigation/TabNavigator';
import { Event } from '../screens/EventsScreen';
import { Ionicons } from '@expo/vector-icons';
import { EventsStackScreenProps } from '../navigation/TabNavigator';

type EventCalendarRouteProp = RouteProp<EventsStackParamList, 'EventCalendar'>;

type Props = EventsStackScreenProps<'EventCalendar'>;

// Helper function to mark dates with events
const getMarkedDates = (events: Event[]) => {
  const markedDates: { [key: string]: any } = {};
  
  events.forEach(event => {
    const dateStr = event.date.split('T')[0]; // extract YYYY-MM-DD part
    markedDates[dateStr] = { 
      marked: true, 
      dotColor: '#4B2E83',
      // If the event is a meeting, mark it with a different color
      ...(event.type === 'Meeting' && { dotColor: '#FF6B6B' })
    };
  });
  
  return markedDates;
};

// Custom day component to display event indicators
const CustomDayComponent = ({ date, state, marking }: { date: any; state: string; marking: any }) => {
  return (
    <View style={[
      styles.dayContainer,
      state === 'disabled' && styles.disabledDay,
      state === 'today' && styles.today
    ]}>
      <Text style={[
        styles.dayText,
        state === 'disabled' && styles.disabledDayText,
        state === 'today' && styles.todayText
      ]}>
        {date.day}
      </Text>
      {marking?.marked && (
        <View style={[styles.eventDot, { backgroundColor: marking.dotColor }]} />
      )}
    </View>
  );
};

const EventCalendarScreen: React.FC<Props> = ({ route, navigation }) => {
  const { data, loading } = useMockApi('events') as { 
    data: { events: Event[] } | null; 
    loading: boolean;
  };
  
  const [events, setEvents] = useState<Event[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthEvents, setMonthEvents] = useState<Event[]>([]);
  const [markedDates, setMarkedDates] = useState({});
  
  // Handle the newly scheduled meeting if present in route params
  useEffect(() => {
    if (route.params?.newMeeting) {
      // Add the new meeting to our events list
      setEvents(prevEvents => {
        const newEvents = [...prevEvents];
        // Check if we already have this meeting (by ID)
        const existingIndex = newEvents.findIndex(e => 
          e.id === (route.params.newMeeting ? route.params.newMeeting.id : -1)
        );
        
        if (existingIndex >= 0) {
          // Replace existing meeting
          if (route.params.newMeeting) {
            newEvents[existingIndex] = route.params.newMeeting;
          }
        } else {
          // Add new meeting
          if (route.params.newMeeting) {
            newEvents.push(route.params.newMeeting);
          }
        }
        
        return newEvents;
      });
    }
  }, [route.params?.newMeeting]);
  
  // Load events from API
  useEffect(() => {
    if (data && data.events) {
      setEvents(prevEvents => {
        // Combine API events with any scheduled meetings
        const apiEvents = [...data.events];
        
        // Filter out any duplicate meetings already in the API data
        const scheduledMeetings = prevEvents.filter(e => 
          e.type === 'Meeting' && !apiEvents.some(apiEvent => apiEvent.id === e.id)
        );
        
        return [...apiEvents, ...scheduledMeetings];
      });
    }
  }, [data]);

  // Filter events for current month and update marked dates when events or month changes
  useEffect(() => {
    if (events.length > 0) {
      // Update the marked dates object for the calendar
      setMarkedDates(getMarkedDates(events));
      
      // Filter events for the current month
      const filtered = events.filter(event => {
        const eventDate = parseISO(event.date);
        return isSameMonth(eventDate, currentMonth);
      });
      
      setMonthEvents(filtered);
    }
  }, [events, currentMonth]);

  const handleMonthChange = (month: { timestamp: number }) => {
    setCurrentMonth(new Date(month.timestamp));
  };

  // Function to handle event press
  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetail', { event });
  };

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
        <Text style={styles.headerTitle}>Events Calendar</Text>
      </View>

      <Calendar
        current={format(new Date(), 'yyyy-MM-dd')}
        markedDates={markedDates}
        onMonthChange={handleMonthChange}
        theme={{
          selectedDayBackgroundColor: '#4B2E83',
          todayTextColor: '#4B2E83',
          arrowColor: '#4B2E83',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          dotColor: '#4B2E83',
          selectedDotColor: 'white'
        }}
      />

      <View style={styles.eventsContainer}>
        <Text style={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy')} Events
        </Text>

        <ScrollView>
          {monthEvents.length === 0 ? (
            <Text style={styles.noEventsText}>No events this month</Text>
          ) : (
            monthEvents.map(event => (
              <TouchableOpacity 
                key={event.id} 
                style={[
                  styles.eventItem,
                  event.type === 'Meeting' && styles.meetingItem
                ]}
                onPress={() => handleEventPress(event)}
              >
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.type && (
                    <View style={[
                      styles.eventTypeTag,
                      event.type === 'Meeting' && styles.meetingTypeTag
                    ]}>
                      <Text style={styles.eventTypeText}>{event.type}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.eventTime}>
                  {format(parseISO(event.date), 'MMM do, h:mm a')}
                </Text>
                <Text style={styles.eventLocation}>{event.location}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
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
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B2E83',
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  eventItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  meetingItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  dayContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  disabledDay: {
    backgroundColor: '#E5E5E5',
  },
  today: {
    backgroundColor: '#EDE6F7',
  },
  dayText: {
    fontSize: 14,
    color: '#000',
  },
  disabledDayText: {
    color: '#ccc',
  },
  todayText: {
    color: '#4B2E83',
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
  },
  eventTypeTag: {
    backgroundColor: '#4B2E83',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  meetingTypeTag: {
    backgroundColor: '#FF6B6B',
  },
  eventTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default EventCalendarScreen;

