import React from 'react';
import { View, Text, ActivityIndicator, Button } from 'react-native';
import { useMockApi } from '../hooks/useMockApi';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function HomeScreen() {
  const { data, loading, error } = useMockApi('home');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Home Screen</Text>
      <Text style={{ marginBottom: 16 }}>{data?.message}</Text>

      <Button title="Go to Match" onPress={() => navigation.navigate('Match')} />
      <Button title="Go to Chat" onPress={() => navigation.navigate('Chat')} />
      <Button title="Go to Profile" onPress={() => navigation.navigate('Profile')} />
    </View>
  );
}