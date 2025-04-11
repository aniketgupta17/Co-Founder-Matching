import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useMockApi } from '../hooks/useMockApi';
import { format, parseISO, isSameMonth, isSameDay } from 'date-fns';
import { RouteProp } from '@react-navigation/native';
import { EventsStackParamList } from '../navigation/TabNavigator';
import { Event } from '../screens/EventsScreen';

type EventCalendarRouteProp = RouteProp<EventsStackParamList, 'EventCalendar'>;

type Props = {
  route: EventCalendarRouteProp;
};

const EventCalendarScreen: React.FC<Props> = ({ route }) => {
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

  return (
    <SafeAreaView style={styles.container}>
      <Calendar
        current={format(new Date(), 'yyyy-MM-dd')}
        markedDates={markedDates}
        onMonthChange={handleMonthChange}
        theme={{
          selectedDayBackgroundColor: '#4B2E83',
          todayTextColor: '#4B2E83',
          arrowColor: '#4B2E83',
        }}
        dayComponent={CustomDayComponent}
      />

      <View style={styles.eventsContainer}>
        <Text style={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy')} Events
        </Text>

        {monthEvents.map(event => (
          <View key={event.id} style={styles.eventItem}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventTime}>
              {format(parseISO(event.date), 'MMM do, h:mm a')}
            </Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f8fc', // overall background color
  },
  eventsContainer: {
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
    padding: 12,
    marginVertical: 8,
    shadowColor: '#ccc',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 }, // subtle shadow
  },
  eventTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#4B2E83', // purple title text
  },
  eventTime: {
    color: '#4B2E83',
    fontSize: 14,
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

