import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useMockApi } from '../hooks/useMockApi';
import { format, parseISO, isSameMonth, isSameDay } from 'date-fns';
import { RouteProp } from '@react-navigation/native';
import { EventsStackParamList } from '../navigation/TabNavigator';
import { Event } from '../screens/EventsScreen';
import { Ionicons } from '@expo/vector-icons';

type EventCalendarRouteProp = RouteProp<EventsStackParamList, 'EventCalendar'>;

type Props = {
  route: EventCalendarRouteProp;
  navigation: any;
};

const EventCalendarScreen: React.FC<Props> = ({ route, navigation }) => {
  const { data, loading, error } = useMockApi('events');
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthEvents, setMonthEvents] = useState<Event[]>([]);

  const initialEvent = route.params?.event;

  useEffect(() => {
    if (data?.events) {
      const marks: Record<string, any> = {};
      const filteredEvents: Event[] = [];

      data.events.forEach((event: Event) => {
        const eventDate = format(parseISO(event.date), 'yyyy-MM-dd');

        if (isSameMonth(parseISO(event.date), currentMonth)) {
          marks[eventDate] = {
            marked: true,
            dotColor: '#4B2E83',
            selected: initialEvent && isSameDay(parseISO(initialEvent.date), parseISO(event.date)),
            selectedColor: '#4B2E83',
          };

          filteredEvents.push(event);
        }
      });

      setMarkedDates(marks);
      setMonthEvents(filteredEvents);
    }
  }, [data, currentMonth, initialEvent]);

  const handleMonthChange = (month: { dateString: string }) => {
    setCurrentMonth(new Date(month.dateString));
  };

  const CustomDayComponent = ({
    date,
  }: {
    date: { dateString: string; day: string; month: string; year: string };
    state: string;
  }) => {
    const eventDateString = format(parseISO(date.dateString), 'yyyy-MM-dd');
    const isEventDay = markedDates[eventDateString];

    return (
      <View
        style={[
          styles.dayCircle,
          isEventDay && styles.eventDayCircle, // background when there is event
        ]}
      >
        <Text
          style={[
            styles.dayText,
            isEventDay && styles.eventDayText, // text color for event day
          ]}
        >
          {date.day}
        </Text>
      </View>
    );
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
        }}
        dayComponent={CustomDayComponent}
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
                style={styles.eventItem}
                onPress={() => handleEventPress(event)}
              >
                <Text style={styles.eventTitle}>{event.title}</Text>
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
    backgroundColor: '#f9f8fc', // overall background color
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B2E83',
    flex: 1,
    textAlign: 'center',
    marginRight: 30, // Offset for the back button to center the title
  },
  eventsContainer: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20, // event list padding
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B2E83', // purple title
    marginBottom: 10,
  },
  eventItem: {
    backgroundColor: 'white',
    borderRadius: 12, // rounded corner
    padding: 16,
    marginVertical: 8,
    shadowColor: '#ccc',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 }, // subtle shadow
  },
  eventTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#4B2E83', // purple title text
    marginBottom: 4,
  },
  eventTime: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  eventLocation: {
    color: '#666',
    fontSize: 14,
  },
  noEventsText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  dayCircle: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'center', // center the circle in grid
    backgroundColor: 'transparent', // default background
  },
  eventDayCircle: {
    backgroundColor: '#EDE6F7', // light purple background for event days
  },
  dayText: {
    fontSize: 14,
    color: '#000', // normal day text
  },
  eventDayText: {
    color: '#4B2E83', // purple text for event day
  },
});

export default EventCalendarScreen;

