import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { StackScreenProps } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { Event } from "../screens/EventsScreen";

// Screens
import SwipeableHomeScreen from "../screens/SwipeableHomeScreen";
import MatchScreen from "../screens/MatchScreen";
import MatchProfileScreen from "../screens/MatchProfileScreen";
import ChatScreen from "../screens/ChatScreen";
import ChatDetailScreen from "../screens/ChatDetailScreen";
import EventsScreen from "../screens/EventsScreen";
import EventDetailScreen from "../screens/EventDetailScreen";
import EventCalendarScreen from "../screens/EventCalenderScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import EditProfileScreen from "../screens/EditProfileScreen";

// Stack param types
export type ChatStackParamList = {
  MessagesList: undefined;
  Chat: {
    chatId: number;
    name: string;
    avatar?: string;
    isGroup?: boolean;
    isAi?: boolean;
  };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  EditProfile: { profile: any };
};

export type MatchStackParamList = {
  MatchesList: undefined;
  MatchProfile: { match: any };
};

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetail: { event: Event };
  EventCalendar: { event?: Event; newMeeting?: Event };
};

export type MainTabParamList = {
  Home: undefined;
  Match: undefined;
  Messages: undefined;
  Events: undefined;
  Profile: undefined;
};

export type TabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;
export type ChatStackScreenProps<T extends keyof ChatStackParamList> =
  StackScreenProps<ChatStackParamList, T>;
export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
  StackScreenProps<ProfileStackParamList, T>;
export type EventsStackScreenProps<T extends keyof EventsStackParamList> =
  StackScreenProps<EventsStackParamList, T>;
export type MatchStackScreenProps<T extends keyof MatchStackParamList> =
  StackScreenProps<MatchStackParamList, T>;

type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const ChatStack = createStackNavigator<ChatStackParamList>();
const EventsStack = createStackNavigator<EventsStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const MatchStack = createStackNavigator<MatchStackParamList>();

// === Stack Navigators ===
const ChatStackNavigator = () => (
  <ChatStack.Navigator screenOptions={{ headerShown: false }}>
    <ChatStack.Screen name="MessagesList" component={ChatScreen} />
    <ChatStack.Screen name="Chat" component={ChatDetailScreen} />
  </ChatStack.Navigator>
);

const MatchStackNavigator = () => (
  <MatchStack.Navigator screenOptions={{ headerShown: false }}>
    <MatchStack.Screen name="MatchesList" component={MatchScreen} />
    <MatchStack.Screen name="MatchProfile" component={MatchProfileScreen} />
  </MatchStack.Navigator>
);

const EventsStackNavigator = () => (
  <EventsStack.Navigator screenOptions={{ headerShown: false }}>
    <EventsStack.Screen name="EventsList" component={EventsScreen} />
    <EventsStack.Screen name="EventDetail" component={EventDetailScreen} />
    <EventsStack.Screen
      name="EventCalendar"
      component={EventCalendarScreen}
      options={{ title: "Event Calendar" }}
    />
  </EventsStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
  </ProfileStack.Navigator>
);

// === Wrapped Components ===
const ChatStackScreen = () => <ChatStackNavigator />;
const MatchStackScreen = () => <MatchStackNavigator />;
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
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Match":
              iconName = focused ? "people" : "people-outline";
              break;
            case "Messages":
              iconName = focused ? "chatbubbles" : "chatbubbles-outline";
              break;
            case "Events":
              iconName = focused ? "calendar" : "calendar-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "help-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4B2E83",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={SwipeableHomeScreen} />
      <Tab.Screen name="Match" component={MatchStackScreen} />
      <Tab.Screen name="Messages" component={ChatStackScreen} />
      <Tab.Screen name="Events" component={EventsStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
