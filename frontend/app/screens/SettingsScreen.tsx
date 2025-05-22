import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackScreenProps } from '../navigation/TabNavigator';

const SettingsScreen: React.FC<ProfileStackScreenProps<'Settings'>> = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAccountPress = () => {
    // You could navigate to a dedicated account screen or show options in a modal
    Alert.alert(
      'Account Options',
      'What would you like to do?',
      [
        { text: 'Change Password', onPress: () => setShowPasswordModal(true) },
        { text: 'Delete Account', onPress: handleDeleteAccount, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleChangePassword = () => {
    // Validate passwords
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }
    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    // Here you would call your API to change the password
    // For now, we'll just simulate success
    setTimeout(() => {
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed successfully');
    }, 1000);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Here you would call your API to delete the account
            // For now, navigate back to welcome screen
            Alert.alert('Account Deleted', 'Your account has been deleted');
            // We need to access the root navigator to navigate outside the profile stack
            navigation.getParent()?.navigate('Welcome');
          }
        }
      ]
    );
  };

  const handlePrivacyPress = () => {
    // Show privacy options
    Alert.alert(
      'Privacy Settings',
      'Manage who can see your profile and contact you',
      [
        { text: 'Profile Visibility', onPress: () => console.log('Profile visibility settings') },
        { text: 'Blocked Users', onPress: () => console.log('Blocked users list') },
        { text: 'Data Usage', onPress: () => console.log('Data usage settings') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleHelpPress = () => {
    // Navigate to help & support section
    Alert.alert(
      'Help & Support',
      'How can we help you?',
      [
        { text: 'Contact Support', onPress: () => console.log('Contact support') },
        { text: 'FAQ', onPress: () => console.log('Open FAQ') },
        { text: 'Report a Bug', onPress: () => console.log('Report bug') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleAboutPress = () => {
    // Show about information
    Alert.alert(
      'About',
      'Co-Founder Match App\nVersion 1.0.0\n\nDeveloped by Team 23',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => {
            // Here you would call your logout function
            // For demo, navigate to welcome screen
            navigation.getParent()?.navigate('Welcome');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#4B2E83" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account</Text>
        </View>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={handleAccountPress}
        >
          <View style={styles.settingItemContent}>
            <Ionicons name="person-outline" size={24} color="#4B2E83" />
            <Text style={styles.settingItemText}>Account Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Preferences</Text>
        </View>

        <View style={styles.settingToggleItem}>
          <View style={styles.settingItemContent}>
            <Ionicons name="notifications-outline" size={24} color="#4B2E83" />
            <Text style={styles.settingItemText}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#ccc", true: "#4B2E83" }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingToggleItem}>
          <View style={styles.settingItemContent}>
            <Ionicons name="moon-outline" size={24} color="#4B2E83" />
            <Text style={styles.settingItemText}>Dark Mode</Text>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: "#ccc", true: "#4B2E83" }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingToggleItem}>
          <View style={styles.settingItemContent}>
            <Ionicons name="location-outline" size={24} color="#4B2E83" />
            <Text style={styles.settingItemText}>Location Services</Text>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: "#ccc", true: "#4B2E83" }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Support</Text>
        </View>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={handlePrivacyPress}
        >
          <View style={styles.settingItemContent}>
            <Ionicons name="lock-closed-outline" size={24} color="#4B2E83" />
            <Text style={styles.settingItemText}>Privacy</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={handleHelpPress}
        >
          <View style={styles.settingItemContent}>
            <Ionicons name="help-circle-outline" size={24} color="#4B2E83" />
            <Text style={styles.settingItemText}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={handleAboutPress}
        >
          <View style={styles.settingItemContent}>
            <Ionicons name="information-circle-outline" size={24} color="#4B2E83" />
            <Text style={styles.settingItemText}>About</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, styles.logoutButton]}
          onPress={handleLogout}
        >
          <View style={styles.settingItemContent}>
            <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
            <Text style={[styles.settingItemText, { color: '#FF6B6B' }]}>Logout</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color="#4B2E83" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
            />

            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
            />

            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleChangePassword}
            >
              <Text style={styles.submitButtonText}>Change Password</Text>
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
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B2E83',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#F8F8F8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  settingToggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#333',
  },
  logoutButton: {
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B2E83',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#4B2E83',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;