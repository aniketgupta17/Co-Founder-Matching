import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/TabNavigator';

type EditEducationScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'EditEducation'
>;

type EditEducationScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'EditEducation'
>;

type Props = {
  navigation: EditEducationScreenNavigationProp;
  route: EditEducationScreenRouteProp;
};

const EditEducationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { education, index, onSave } = route.params;
  
  const [institution, setInstitution] = useState(education.institution);
  const [degree, setDegree] = useState(education.degree);
  const [year, setYear] = useState(education.year);
  
  const handleSave = () => {
    if (!institution.trim() || !degree.trim() || !year.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    const updatedEducation = {
      institution: institution.trim(),
      degree: degree.trim(),
      year: year.trim()
    };

    onSave(index, updatedEducation);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#4B2E83" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Education</Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Institution</Text>
              <TextInput
                style={styles.input}
                value={institution}
                onChangeText={setInstitution}
                placeholder="University or school name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Degree</Text>
              <TextInput
                style={styles.input}
                value={degree}
                onChangeText={setDegree}
                placeholder="Degree or certification"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Year</Text>
              <TextInput
                style={styles.input}
                value={year}
                onChangeText={setYear}
                placeholder="e.g. 2015-2019"
                placeholderTextColor="#999"
              />
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
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
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});

export default EditEducationScreen; 