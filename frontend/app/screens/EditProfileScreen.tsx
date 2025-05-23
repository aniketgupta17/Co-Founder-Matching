import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackScreenProps } from '../navigation/TabNavigator';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/supabase/useAuth';
import { updateProfile } from '../services/profileService';
import { Profile } from '../types/profile';

const EditProfileScreen: React.FC<ProfileStackScreenProps<'EditProfile'>> = ({ route, navigation }) => {
  const { profile: uiProfile } = route.params;
  const { refreshProfile } = useProfile();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: uiProfile.name || '',
    role: uiProfile.role || '',
    bio: uiProfile.bio || '',
    skills: uiProfile.skills || [],
    interests: uiProfile.interests || [],
    image: uiProfile.image || '',
    experience: uiProfile.experience || [],
    education: uiProfile.education || [],
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [loading, setLoading] = useState(false);
  
  // New state for education and experience form inputs
  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    year: '',
  });
  
  const [newExperience, setNewExperience] = useState({
    company: '',
    role: '',
    duration: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s: string) => s !== skill),
    });
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i: string) => i !== interest),
    });
  };
  
  // Add education entry
  const handleAddEducation = () => {
    if (newEducation.institution.trim() && newEducation.degree.trim()) {
      setFormData({
        ...formData,
        education: [...formData.education, { ...newEducation }],
      });
      setNewEducation({
        institution: '',
        degree: '',
        year: '',
      });
    } else {
      Alert.alert('Error', 'Institution and Degree are required');
    }
  };
  
  // Remove education entry
  const handleRemoveEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_: any, i: number) => i !== index),
    });
  };
  
  // Add experience entry
  const handleAddExperience = () => {
    if (newExperience.company.trim() && newExperience.role.trim()) {
      setFormData({
        ...formData,
        experience: [...formData.experience, { ...newExperience }],
      });
      setNewExperience({
        company: '',
        role: '',
        duration: '',
      });
    } else {
      Alert.alert('Error', 'Company and Role are required');
    }
  };
  
  // Remove experience entry
  const handleRemoveExperience = (index: number) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_: any, i: number) => i !== index),
    });
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant photo library permissions to change your profile picture");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFormData({
        ...formData,
        image: result.assets[0].uri,
      });
    }
  };

  const handleSave = async () => {
    // Validate form
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to update your profile');
      return;
    }

    setLoading(true);

    try {
      // Prepare data for Supabase update
      const profileUpdate = {
        name: formData.name,
        role: formData.role,
        bio: formData.bio,
        skills: formData.skills,
        interests: formData.interests,
        avatar_url: formData.image,
        updated_at: new Date().toISOString(),
        experience: formData.experience,
        education: formData.education,
      };

      // Update the profile in Supabase
      const { success, error } = await updateProfile(user.id, profileUpdate);

      if (!success) {
        throw new Error(error ? String(error) : 'Failed to update profile');
      }

      // Refresh the profile data
      await refreshProfile();

      Alert.alert(
        'Success',
        'Profile updated successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to update profile'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#4B2E83" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Image */}
          <View style={styles.imageSection}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: formData.image || 'https://randomuser.me/api/portraits/men/75.jpg' }}
                style={styles.profileImage}
              />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickImage}
              >
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
              placeholder="Your name"
            />
            
            <Text style={styles.inputLabel}>Role</Text>
            <TextInput
              style={styles.input}
              value={formData.role}
              onChangeText={(text) => handleChange('role', text)}
              placeholder="Your professional role"
            />
            
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => handleChange('bio', text)}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Skills */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.input, styles.inputWithButtonField]}
                value={newSkill}
                onChangeText={setNewSkill}
                placeholder="Add a skill"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddSkill}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.tagsContainer}>
              {formData.skills.map((skill: string, index: number) => (
                <View key={index} style={styles.tagItem}>
                  <Text style={styles.tagText}>{skill}</Text>
                  <TouchableOpacity
                    style={styles.removeTagButton}
                    onPress={() => handleRemoveSkill(skill)}
                  >
                    <Ionicons name="close-circle" size={18} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Experience */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            
            <Text style={styles.inputLabel}>Company</Text>
            <TextInput
              style={styles.input}
              value={newExperience.company}
              onChangeText={(text) => setNewExperience({...newExperience, company: text})}
              placeholder="Company name"
            />
            
            <Text style={styles.inputLabel}>Role</Text>
            <TextInput
              style={styles.input}
              value={newExperience.role}
              onChangeText={(text) => setNewExperience({...newExperience, role: text})}
              placeholder="Your role"
            />
            
            <Text style={styles.inputLabel}>Duration</Text>
            <TextInput
              style={styles.input}
              value={newExperience.duration}
              onChangeText={(text) => setNewExperience({...newExperience, duration: text})}
              placeholder="e.g. 2020 - 2022"
            />
            
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={handleAddExperience}
            >
              <Text style={styles.addItemButtonText}>Add Experience</Text>
            </TouchableOpacity>
            
            {formData.experience.length > 0 ? (
              <View style={styles.itemsContainer}>
                {formData.experience.map((exp: {company: string, role: string, duration: string}, index: number) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{exp.company}</Text>
                      <Text style={styles.itemSubtitle}>{exp.role}</Text>
                      <Text style={styles.itemDetails}>{exp.duration}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeItemButton}
                      onPress={() => handleRemoveExperience(index)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF4D4D" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No experience added yet</Text>
            )}
          </View>
          
          {/* Education */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            
            <Text style={styles.inputLabel}>Institution</Text>
            <TextInput
              style={styles.input}
              value={newEducation.institution}
              onChangeText={(text) => setNewEducation({...newEducation, institution: text})}
              placeholder="School or university name"
            />
            
            <Text style={styles.inputLabel}>Degree</Text>
            <TextInput
              style={styles.input}
              value={newEducation.degree}
              onChangeText={(text) => setNewEducation({...newEducation, degree: text})}
              placeholder="Degree or certificate"
            />
            
            <Text style={styles.inputLabel}>Year</Text>
            <TextInput
              style={styles.input}
              value={newEducation.year}
              onChangeText={(text) => setNewEducation({...newEducation, year: text})}
              placeholder="e.g. 2022"
            />
            
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={handleAddEducation}
            >
              <Text style={styles.addItemButtonText}>Add Education</Text>
            </TouchableOpacity>
            
            {formData.education.length > 0 ? (
              <View style={styles.itemsContainer}>
                {formData.education.map((edu: {institution: string, degree: string, year: string}, index: number) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{edu.institution}</Text>
                      <Text style={styles.itemSubtitle}>{edu.degree}</Text>
                      <Text style={styles.itemDetails}>{edu.year}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeItemButton}
                      onPress={() => handleRemoveEducation(index)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF4D4D" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No education added yet</Text>
            )}
          </View>

          {/* Interests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.input, styles.inputWithButtonField]}
                value={newInterest}
                onChangeText={setNewInterest}
                placeholder="Add an interest"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddInterest}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.tagsContainer}>
              {formData.interests.map((interest: string, index: number) => (
                <View key={index} style={styles.tagItem}>
                  <Text style={styles.tagText}>{interest}</Text>
                  <TouchableOpacity
                    style={styles.removeTagButton}
                    onPress={() => handleRemoveInterest(interest)}
                  >
                    <Ionicons name="close-circle" size={18} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B2E83',
  },
  saveButton: {
    backgroundColor: '#4B2E83',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4B2E83',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
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
  textArea: {
    minHeight: 100,
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputWithButtonField: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#4B2E83',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B2E83',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
    marginRight: 4,
  },
  removeTagButton: {
    padding: 2,
  },
  addItemButton: {
    backgroundColor: '#4B2E83',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addItemButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B2E83',
    marginRight: 8,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  removeItemButton: {
    padding: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default EditProfileScreen; 