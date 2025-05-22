import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  Switch,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';

// Define the types for our route params
interface Match {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
  skills: string[];
  interests: string[];
}

type MatchProfileStackParamList = {
  MatchProfile: {
    match: Match;
  };
};

type MatchProfileRouteProp = RouteProp<MatchProfileStackParamList, 'MatchProfile'>;

type Props = {
  route: MatchProfileRouteProp;
  navigation: StackNavigationProp<any>;
};

const MatchProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { match } = route.params;
  const [meetingModalVisible, setMeetingModalVisible] = useState(false);
  const [meetingDate, setMeetingDate] = useState(new Date());
  const [meetingNote, setMeetingNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isOnlineMeeting, setIsOnlineMeeting] = useState(true);
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  // Function to navigate to chat with this specific match
  const handleMessagePress = () => {
    // Navigate to the Messages tab first, then to the specific Chat screen
    navigation.navigate('Messages', { 
      screen: 'MessagesList' // Navigate to the first screen in the Messages stack
    });
    
    // Give it a moment to navigate to the Messages tab before trying to navigate to Chat
    setTimeout(() => {
      navigation.navigate('Messages', {
        screen: 'Chat', // Screen name in the Messages stack
        params: {
          chatId: match.id,
          name: match.name,
          avatar: match.image,
          isGroup: false
        }
      });
    }, 100);
  };

  // Function to toggle meeting scheduling modal
  const toggleMeetingModal = () => {
    setMeetingModalVisible(!meetingModalVisible);
  };

  // Function to handle date changes
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || meetingDate;
    setShowDatePicker(Platform.OS === 'ios');
    setMeetingDate(currentDate);
  };

  // Function to schedule the meeting
  const handleScheduleMeeting = () => {
    // Create a new event object for the calendar
    const locationStr = isOnlineMeeting 
      ? `Online Meeting: ${meetingLink || 'Link will be shared later'}`
      : `In-person: ${meetingLocation || 'Location to be confirmed'}`;
      
    const newEvent = {
      id: Date.now(), // Use timestamp as temporary ID
      title: `Meeting with ${match.name}`,
      date: meetingDate.toISOString(),
      location: locationStr,
      description: meetingNote || `Scheduled meeting with ${match.name}`,
      type: 'Meeting',
      tags: ['Meeting', 'Networking']
    };

    // Here you would save the meeting to your backend
    // For now, we'll just close the modal and show success
    toggleMeetingModal();

    // Store the event in local storage
    const storeMeeting = async () => {
      try {
        // In a real app, you would use proper state management like Redux or Context
        // For this demo, we'll navigate to the calendar with the new event
        navigation.navigate('Events', {
          screen: 'EventCalendar',
          params: { newMeeting: newEvent }
        });

        // Show success alert after navigation
        setTimeout(() => {
          alert(`Meeting scheduled with ${match.name} on ${meetingDate.toLocaleString()}`);
        }, 500);
      } catch (error) {
        console.error('Error saving meeting:', error);
        alert('There was an error scheduling your meeting. Please try again.');
      }
    };

    storeMeeting();
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
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: match.image }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{match.name}</Text>
          <Text style={styles.profileRole}>{match.role}</Text>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleMessagePress}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#4B2E83" />
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={toggleMeetingModal}
            >
              <Ionicons name="calendar-outline" size={24} color="#4B2E83" />
              <Text style={styles.actionButtonText}>Schedule Meeting</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{match.bio}</Text>
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.tagsContainer}>
            {match.skills.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.tagsContainer}>
            {match.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Meeting Scheduling Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={meetingModalVisible}
        onRequestClose={toggleMeetingModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule a Meeting</Text>
              <TouchableOpacity onPress={toggleMeetingModal}>
                <Ionicons name="close" size={24} color="#4B2E83" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Meeting with {match.name}</Text>
            
            {/* Date Time Picker */}
            <Text style={styles.inputLabel}>Date and Time</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {meetingDate.toLocaleString()}
              </Text>
              <Ionicons name="calendar" size={20} color="#4B2E83" />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={meetingDate}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                style={styles.datePicker}
                textColor="#000000"
              />
            )}
            
            {/* Meeting Type Selection */}
            <View style={styles.meetingTypeContainer}>
              <Text style={styles.inputLabel}>Meeting Type</Text>
              <View style={styles.meetingTypeToggle}>
                <Text style={isOnlineMeeting ? styles.meetingTypeText : styles.meetingTypeTextActive}>
                  In-person
                </Text>
                <Switch
                  value={isOnlineMeeting}
                  onValueChange={setIsOnlineMeeting}
                  trackColor={{ false: '#E5E5E5', true: '#4B2E83' }}
                  thumbColor={isOnlineMeeting ? '#FFFFFF' : '#FFFFFF'}
                  style={styles.meetingTypeSwitch}
                />
                <Text style={isOnlineMeeting ? styles.meetingTypeTextActive : styles.meetingTypeText}>
                  Online
                </Text>
              </View>
            </View>
            
            {/* Location Input - show different inputs based on meeting type */}
            {isOnlineMeeting ? (
              <>
                <Text style={styles.inputLabel}>Meeting Link</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Paste meeting link here (Zoom, Google Meet, etc.)"
                  placeholderTextColor="#999"
                  value={meetingLink}
                  onChangeText={setMeetingLink}
                />
              </>
            ) : (
              <>
                <Text style={styles.inputLabel}>Meeting Location</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter meeting location"
                  placeholderTextColor="#999"
                  value={meetingLocation}
                  onChangeText={setMeetingLocation}
                />
              </>
            )}
            
            <Text style={styles.inputLabel}>Meeting notes</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Add details about the meeting..."
              placeholderTextColor="#999"
              multiline
              value={meetingNote}
              onChangeText={setMeetingNote}
            />
            
            <TouchableOpacity 
              style={styles.scheduleButton}
              onPress={handleScheduleMeeting}
            >
              <Text style={styles.scheduleButtonText}>Schedule Meeting</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  actionButtonText: {
    marginTop: 4,
    color: '#4B2E83',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B2E83',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#4B2E83',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: 'white',
    fontSize: 14,
  },
  interestTag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: '#666',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B2E83',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  datePicker: {
    marginBottom: 16,
    backgroundColor: 'white',
    width: '100%',
  },
  meetingTypeContainer: {
    marginBottom: 16,
  },
  meetingTypeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  meetingTypeSwitch: {
    marginHorizontal: 12,
  },
  meetingTypeText: {
    fontSize: 16,
    color: '#999',
  },
  meetingTypeTextActive: {
    fontSize: 16,
    color: '#4B2E83',
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  scheduleButton: {
    backgroundColor: '#4B2E83',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MatchProfileScreen; 