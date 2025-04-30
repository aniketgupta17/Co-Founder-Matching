import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  Modal,
} from 'react-native';
import { ChatStackScreenProps } from '../navigation/TabNavigator';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: number;
  text: string;
  timestamp: string;
  senderId: number;
  senderName?: string;
  senderAvatar?: string;
}

const ChatDetailScreen: React.FC<ChatStackScreenProps<'Chat'>> = ({ route, navigation }) => {
  const { chatId, name, avatar, isGroup } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Mock group participants
  const mockParticipants = [
    { id: 1, name: 'Alex Johnson', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 2, name: 'Taylor Wong', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 3, name: 'Sarah Miller', avatar: 'https://randomuser.me/api/portraits/women/67.jpg' },
    { id: 4, name: 'You', avatar: 'https://randomuser.me/api/portraits/men/75.jpg' },
  ];

  // Initialize with some mock messages
  useEffect(() => {
    const mockMessages = [
      {
        id: 1,
        text: isGroup 
          ? 'Welcome to the group! Let\'s collaborate!' 
          : 'Hey! How are you?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        senderId: isGroup ? 1 : 2,
        senderName: isGroup ? 'Alex Johnson' : undefined,
        senderAvatar: isGroup ? 'https://randomuser.me/api/portraits/men/32.jpg' : undefined
      },
      {
        id: 2,
        text: isGroup 
          ? 'Thanks for adding me! I\'m excited to work with everyone.' 
          : 'I\'m doing great, thanks! How about you?',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        senderId: isGroup ? 3 : 4,
        senderName: isGroup ? 'Sarah Miller' : undefined,
        senderAvatar: isGroup ? 'https://randomuser.me/api/portraits/women/67.jpg' : undefined
      },
      {
        id: 3,
        text: isGroup 
          ? 'I have some ideas I\'d like to share about our project.' 
          : 'Just working on our co-founder app. Making good progress!',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        senderId: isGroup ? 2 : 2,
        senderName: isGroup ? 'Taylor Wong' : undefined,
        senderAvatar: isGroup ? 'https://randomuser.me/api/portraits/women/44.jpg' : undefined
      }
    ];
    
    setMessages(mockMessages);
  }, [isGroup]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: message.trim(),
        timestamp: new Date().toISOString(),
        senderId: 4, // Current user
        senderName: isGroup ? 'You' : undefined,
        senderAvatar: isGroup ? 'https://randomuser.me/api/portraits/men/75.jpg' : undefined
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Scroll to bottom when new message is added
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const isSameDay = (timestamp1: string, timestamp2: string) => {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return date1.toDateString() === date2.toDateString();
  };

  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isCurrentUser = item.senderId === 4;
    const showSender = isGroup && !isCurrentUser;
    
    // Check if we need to show date header
    const showDateHeader = index === 0 || !isSameDay(messages[index - 1].timestamp, item.timestamp);
    
    return (
      <>
        {showDateHeader && (
          <View style={styles.dateHeaderContainer}>
            <Text style={styles.dateHeader}>{formatDate(item.timestamp)}</Text>
          </View>
        )}
        
        <View style={[
          styles.messageRow,
          isCurrentUser ? styles.userMessageRow : styles.otherMessageRow
        ]}>
          {/* Avatar for group chats when not current user */}
          {showSender && item.senderAvatar && (
            <Image source={{ uri: item.senderAvatar }} style={styles.messageSenderAvatar} />
          )}
          
          {/* Extra space when no avatar is shown but in a group chat */}
          {isGroup && isCurrentUser && <View style={styles.messageSpacing} />}
          
          <View style={[
            styles.messageContainer,
            isCurrentUser ? styles.userMessage : styles.otherMessage
          ]}>
            {/* Show sender name in group chats */}
            {showSender && item.senderName && (
              <Text style={styles.messageSender}>{item.senderName}</Text>
            )}
            
            <Text style={[
              styles.messageText, 
              isCurrentUser ? styles.userMessageText : styles.otherMessageText
            ]}>
              {item.text}
            </Text>
            <Text style={[
              styles.timestamp,
              isCurrentUser ? styles.userTimestamp : styles.otherTimestamp
            ]}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#4B2E83" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerTitleContainer}
          onPress={() => isGroup && setShowGroupInfo(true)}
        >
          <View style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.initialsContainer}>
                <Text style={styles.initials}>
                  {name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                </Text>
              </View>
            )}
          </View>
          <View>
            <Text style={styles.headerTitle}>{name}</Text>
            {isGroup && (
              <Text style={styles.headerSubtitle}>{mockParticipants.length} participants</Text>
            )}
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerAction}>
          {isGroup ? (
            <TouchableOpacity onPress={() => setShowGroupInfo(true)}>
              <Ionicons name="information-circle-outline" size={24} color="#4B2E83" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity>
              <Ionicons name="call-outline" size={22} color="#4B2E83" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add-circle-outline" size={24} color="#4B2E83" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
        />
        
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.disabledSendButton]}
          onPress={sendMessage}
          disabled={!message.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={message.trim() ? "white" : "#CCCCCC"} 
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* Group Info Modal */}
      <Modal
        visible={showGroupInfo}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGroupInfo(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Group Information</Text>
              <TouchableOpacity onPress={() => setShowGroupInfo(false)}>
                <Ionicons name="close" size={24} color="#4B2E83" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.groupInfoHeader}>
              <View style={styles.groupAvatarContainer}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.groupAvatar} />
                ) : (
                  <View style={styles.groupInitialsContainer}>
                    <Text style={styles.groupInitials}>
                      {name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.groupName}>{name}</Text>
              <Text style={styles.groupParticipantsCount}>
                {mockParticipants.length} participants
              </Text>
            </View>
            
            <View style={styles.groupActions}>
              <TouchableOpacity style={styles.groupAction}>
                <View style={styles.groupActionIcon}>
                  <Ionicons name="qr-code-outline" size={24} color="#4B2E83" />
                </View>
                <Text style={styles.groupActionText}>Group QR Code</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.groupAction}>
                <View style={styles.groupActionIcon}>
                  <Ionicons name="person-add-outline" size={24} color="#4B2E83" />
                </View>
                <Text style={styles.groupActionText}>Add Participant</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.participantsLabel}>Participants</Text>
            
            <FlatList
              data={mockParticipants}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.participantItem}>
                  <Image source={{ uri: item.avatar }} style={styles.participantAvatar} />
                  <Text style={styles.participantName}>{item.name}</Text>
                  {item.name === 'You' && (
                    <Text style={styles.youLabel}>(You)</Text>
                  )}
                </View>
              )}
            />
            
            <TouchableOpacity style={styles.leaveButton}>
              <Ionicons name="exit-outline" size={20} color="#FF6B6B" />
              <Text style={styles.leaveButtonText}>Leave Group</Text>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    marginLeft: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  initialsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4B2E83',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  dateHeaderContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateHeader: {
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#666',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageRow: {
    alignSelf: 'flex-end',
  },
  otherMessageRow: {
    alignSelf: 'flex-start',
  },
  messageSenderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  messageSpacing: {
    width: 36,
  },
  messageContainer: {
    borderRadius: 16,
    padding: 12,
  },
  userMessage: {
    backgroundColor: '#4B2E83',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B2E83',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    alignItems: 'center',
  },
  attachButton: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4B2E83',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledSendButton: {
    backgroundColor: '#F5F5F5',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B2E83',
  },
  groupInfoHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  groupAvatarContainer: {
    marginBottom: 12,
  },
  groupAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  groupInitialsContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4B2E83',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInitials: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  groupParticipantsCount: {
    fontSize: 14,
    color: '#666',
  },
  groupActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  groupAction: {
    alignItems: 'center',
  },
  groupActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupActionText: {
    fontSize: 12,
    color: '#4B2E83',
  },
  participantsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  participantName: {
    fontSize: 16,
    color: '#333',
  },
  youLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  leaveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  leaveButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  }
});

export default ChatDetailScreen; 
