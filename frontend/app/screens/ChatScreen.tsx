import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { useMockApi } from "../hooks/useMockApi";
import { ChatStackScreenProps } from "../navigation/TabNavigator";
import { Ionicons } from "@expo/vector-icons";
import { useChats } from "../hooks/useChats";
import { useSupabase } from "../hooks/supabase";
import { Chat } from "../types/chats";
import { useApi } from "../hooks/useAPI";
import { createAIChat } from "../services/chatService";

// Mock QR code SVG - this would be generated dynamically in a real app
const QR_CODE_SVG = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="190" height="190" fill="#ffffff" stroke="#000000" stroke-width="5"/>
  <g fill="#000000">
    <!-- QR Code pattern - simplified for example -->
    <rect x="20" y="20" width="20" height="20"/>
    <rect x="40" y="20" width="20" height="20"/>
    <rect x="60" y="20" width="20" height="20"/>
    <rect x="20" y="40" width="20" height="20"/>
    <rect x="60" y="40" width="20" height="20"/>
    <rect x="20" y="60" width="20" height="20"/>
    <rect x="40" y="60" width="20" height="20"/>
    <rect x="60" y="60" width="20" height="20"/>
    
    <rect x="120" y="20" width="20" height="20"/>
    <rect x="140" y="20" width="20" height="20"/>
    <rect x="160" y="20" width="20" height="20"/>
    <rect x="120" y="40" width="20" height="20"/>
    <rect x="160" y="40" width="20" height="20"/>
    <rect x="120" y="60" width="20" height="20"/>
    <rect x="140" y="60" width="20" height="20"/>
    <rect x="160" y="60" width="20" height="20"/>
    
    <rect x="20" y="120" width="20" height="20"/>
    <rect x="40" y="120" width="20" height="20"/>
    <rect x="60" y="120" width="20" height="20"/>
    <rect x="20" y="140" width="20" height="20"/>
    <rect x="60" y="140" width="20" height="20"/>
    <rect x="20" y="160" width="20" height="20"/>
    <rect x="40" y="160" width="20" height="20"/>
    <rect x="60" y="160" width="20" height="20"/>
    
    <rect x="100" y="100" width="20" height="20"/>
    <rect x="120" y="100" width="20" height="20"/>
    <rect x="100" y="120" width="20" height="20"/>
    <rect x="80" y="80" width="20" height="20"/>
  </g>
</svg>`;

// Tab types
type TabType = "Direct" | "Groups" | "AI";

const ChatScreen: React.FC<ChatStackScreenProps<"MessagesList">> = ({
  navigation,
}) => {
  const { data, loading, error } = useMockApi("chat");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("Direct");
  const [createGroupVisible, setCreateGroupVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const { chats, readChat } = useChats();
  const [qrGroup, setQrGroup] = useState<{
    name: string;
    participants: number;
  } | null>(null);
  const [groups, setGroups] = useState<Chat[]>([]);
  const {
    data: aiChatData,
    loading: loadingAiChat,
    errors: errorsAiChat,
    submit: createAi,
  } = useApi(createAIChat);

  // Mock contacts for group creation
  const mockContacts = [
    {
      id: 1,
      name: "Alex Johnson",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 2,
      name: "Taylor Wong",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 3,
      name: "Sarah Miller",
      avatar: "https://randomuser.me/api/portraits/women/67.jpg",
    },
    {
      id: 4,
      name: "James Wilson",
      avatar: "https://randomuser.me/api/portraits/men/91.jpg",
    },
    {
      id: 5,
      name: "Emma Brown",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    },
  ];

  // Filter chats by tab and search query
  const getFilteredChats = () => {
    // Populate chats by active tab
    let filteredChats: Chat[] = [];

    switch (activeTab) {
      case "Direct":
        filteredChats =
          chats.filter((chat) => !chat.isGroup && !chat.isAi) || [];
        break;

      case "Groups":
        filteredChats =
          chats.filter((chat) => chat.isGroup && !chat.isAi) || [];
        break;

      case "AI":
        filteredChats = chats.filter((chat) => chat.isAi);
        break;
    }

    filteredChats.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Filter chats search query
    if (searchQuery.trim()) {
      return filteredChats.filter((chat) =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filteredChats;
  };

  const handleChatPress = (chat: Chat) => {
    // Navigate to the specific chat screen
    console.log("Chat ID", chat.id);
    readChat(chat.id);
    navigation.navigate("Chat", {
      chatId: chat.id,
      name: chat.name,
      avatar: chat.avatar ? chat.avatar : "",
      isGroup: chat.isGroup,
      isAi: chat.isAi,
    });
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedContacts.length === 0) {
      Alert.alert(
        "Error",
        "Please enter a group name and select at least one contact"
      );
      return;
    }

    // Create a new group chat
    const newGroup: Chat = {
      id: 100 + groups.length + 1,
      name: groupName,
      lastMessage: "Group created",
      timestamp: new Date().toISOString(),
      unread: false,
      isGroup: true,
      participants: selectedContacts.length + 1, // +1 for current user
    };

    // Add the new group to our state
    setGroups([...groups, newGroup]);

    // Close the create group modal and show the QR code
    setCreateGroupVisible(false);

    // Set up the QR group info for sharing
    setQrGroup({
      name: groupName,
      participants: selectedContacts.length + 1,
    });

    // Show the QR code modal
    setShowQRCodeModal(true);
  };

  const toggleContactSelection = (contactId: number) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter((id) => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.initialsContainer}>
            <Text style={styles.initials}>{getInitials(item.name)}</Text>
          </View>
        )}
        {item.unread && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.timestamp}>
            {item.timestamp ? formatTime(item.timestamp) : ""}
          </Text>
        </View>

        <Text
          style={[styles.lastMessage, item.unread && styles.unreadMessage]}
          numberOfLines={1}
        >
          {item.isGroup && item.participants && (
            <Text style={styles.groupInfo}>
              {item.participants} participants •{" "}
            </Text>
          )}
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Simplified QR code component
  const QRCode = ({ data }: { data: string }) => (
    <View style={styles.qrCodeImage}>
      <Image
        source={{
          uri: `data:image/svg+xml;utf8,${encodeURIComponent(QR_CODE_SVG)}`,
        }}
        style={styles.qrImage}
        resizeMode="contain"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity
          style={styles.createGroupButton}
          onPress={() => {
            setGroupName("");
            setGroupDescription("");
            setSelectedContacts([]);
            setCreateGroupVisible(true);
          }}
        >
          <Ionicons name="people" size={24} color="#4B2E83" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Direct" && styles.activeTab]}
          onPress={() => setActiveTab("Direct")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Direct" && styles.activeTabText,
            ]}
          >
            Direct
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "Groups" && styles.activeTab]}
          onPress={() => setActiveTab("Groups")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Groups" && styles.activeTabText,
            ]}
          >
            Groups
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "AI" && styles.activeTab]}
          onPress={() => setActiveTab("AI")}
        >
          <Text
            style={[styles.tabText, activeTab === "AI" && styles.activeTabText]}
          >
            AI Chat
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <Text>Loading chats...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : getFilteredChats().length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.noChatsText}>
            {searchQuery
              ? "No chats found matching your search"
              : `No ${activeTab.toLowerCase()} chats yet`}
          </Text>
          {activeTab === "Groups" && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setCreateGroupVisible(true)}
            >
              <Text style={styles.createButtonText}>Create a Group</Text>
            </TouchableOpacity>
          )}
          {activeTab === "AI" && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => createAi()}
            >
              <Text style={styles.createButtonText}>Chat with Venture Bot</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={getFilteredChats()}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.chatList}
        />
      )}

      {/* Create Group Modal */}
      <Modal
        visible={createGroupVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateGroupVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Group Chat</Text>
              <TouchableOpacity onPress={() => setCreateGroupVisible(false)}>
                <Ionicons name="close" size={24} color="#4B2E83" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Group Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter group name"
              value={groupName}
              onChangeText={setGroupName}
            />

            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What's this group about?"
              multiline
              numberOfLines={3}
              value={groupDescription}
              onChangeText={setGroupDescription}
            />

            <Text style={styles.inputLabel}>Add People</Text>
            <ScrollView style={styles.contactsList}>
              {mockContacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.contactItem}
                  onPress={() => toggleContactSelection(contact.id)}
                >
                  <View style={styles.contactInfo}>
                    <Image
                      source={{ uri: contact.avatar }}
                      style={styles.contactAvatar}
                    />
                    <Text style={styles.contactName}>{contact.name}</Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      selectedContacts.includes(contact.id) &&
                        styles.checkboxSelected,
                    ]}
                  >
                    {selectedContacts.includes(contact.id) && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.createGroupBtn,
                (!groupName || selectedContacts.length === 0) &&
                  styles.disabledButton,
              ]}
              onPress={handleCreateGroup}
              disabled={!groupName || selectedContacts.length === 0}
            >
              <Text style={styles.createGroupBtnText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        visible={showQRCodeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQRCodeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Group Invite</Text>
              <TouchableOpacity onPress={() => setShowQRCodeModal(false)}>
                <Ionicons name="close" size={24} color="#4B2E83" />
              </TouchableOpacity>
            </View>

            <Text style={styles.qrInstructions}>
              Share this QR code to invite others to join your group
            </Text>

            <View style={styles.qrCodeContainer}>
              <QRCode data={`group-invite:${qrGroup?.name}`} />
            </View>

            <Text style={styles.groupNameDisplay}>{qrGroup?.name}</Text>
            {qrGroup && (
              <Text style={styles.participantsText}>
                {qrGroup.participants} participant
                {qrGroup.participants !== 1 ? "s" : ""}
              </Text>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.shareButton}>
                <Ionicons name="share-outline" size={20} color="white" />
                <Text style={styles.shareButtonText}>Share Link</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => {
                  setShowQRCodeModal(false);
                  // Switch to Groups tab to show the new group
                  setActiveTab("Groups");
                }}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4B2E83",
  },
  createGroupButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#4B2E83",
  },
  tabText: {
    fontSize: 14,
    color: "#4B2E83",
  },
  activeTabText: {
    color: "white",
    fontWeight: "bold",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4B2E83",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontWeight: "bold",
  },
  noChatsText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: "#4B2E83",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  chatList: {
    padding: 16,
  },
  chatItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  initialsContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4B2E83",
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4B2E83",
    borderWidth: 2,
    borderColor: "white",
  },
  chatInfo: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
  unreadMessage: {
    fontWeight: "bold",
    color: "#333",
  },
  groupInfo: {
    fontWeight: "500",
    color: "#4B2E83",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4B2E83",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  contactsList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  contactName: {
    fontSize: 16,
    color: "#333",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4B2E83",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#4B2E83",
  },
  createGroupBtn: {
    backgroundColor: "#4B2E83",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  createGroupBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  qrInstructions: {
    textAlign: "center",
    marginBottom: 16,
    color: "#666",
  },
  qrCodeContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 8,
  },
  qrImage: {
    width: "100%",
    height: "100%",
  },
  groupNameDisplay: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 4,
  },
  participantsText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  shareButton: {
    flex: 1,
    backgroundColor: "#4B2E83",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  shareButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  doneButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  doneButtonText: {
    color: "#4B2E83",
    fontWeight: "bold",
  },
});

export default ChatScreen;
