import React from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { useMockApi } from '../hooks/useMockApi';

export default function ProfileScreen() {
  const { data, loading, error } = useMockApi('profile');

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
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Profile Screen</Text>
      <Text style={{ marginBottom: 16 }}>Welcome, {data?.profile?.name}</Text>
      {data?.profile?.avatar && (
        <Image
          source={{ uri: data.profile.avatar }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
      )}
      <Text style={{ marginTop: 16 }}>Skills: {data?.profile?.skills.join(', ')}</Text>
    </View>
  );
}