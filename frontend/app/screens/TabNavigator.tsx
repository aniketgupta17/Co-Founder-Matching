import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../screens/EventsScreen';

// Screens
import SwipeableHomeScreen from '../screens/SwipeableHomeScreen';
import MatchScreen from '../screens/MatchScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import EventsScreen from '../screens/EventsScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Stack param types
export type ChatStackParamList = {
  MessagesList: undefined;
  Chat: { chatId: number };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
};

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetail: { event: Event };
};

export type MainTabParamList = {
  Home: undefined;
  Match: undefined;
  Messages: undefined;
  Events: undefined;
  Profile: undefined;
};

export type TabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<MainTabParamList, T>;
export type ChatStackScreenProps<T extends keyof ChatStackParamList> = StackScreenProps<ChatStackParamList, T>;
export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = StackScreenProps<ProfileStackParamList, T>;
export type EventsStackScreenProps<T extends keyof EventsStackParamList> = StackScreenProps<EventsStackParamList, T>;

type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<ChatStackParamList>();
const EventsStack = createStackNavigator<EventsStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// === Stack Navigators ===
const ChatStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MessagesList" component={ChatScreen} />
    <Stack.Screen name="Chat" component={ChatDetailScreen} />
  </Stack.Navigator>
);

const EventsStackNavigator = () => (
  <EventsStack.Navigator screenOptions={{ headerShown: false }}>
    <EventsStack.Screen name="EventsList" component={EventsScreen} />
    <EventsStack.Screen name="EventDetail" component={EventDetailScreen} />
  </EventsStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
  </ProfileStack.Navigator>
);

// === Wrapped Components ===
const ChatStackScreen = () => <ChatStack />;
const EventsStackScreen = () => <EventsStackNavigator />;
const ProfileStackScreen = () => <ProfileStackNavigator />;

// === Main Tab Navigator ===
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }: TabBarIconProps) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Match':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Events':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4B2E83',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={SwipeableHomeScreen} />
      <Tab.Screen name="Match" component={MatchScreen} />
      <Tab.Screen name="Messages" component={ChatStackScreen} />
      <Tab.Screen name="Events" component={EventsStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;

