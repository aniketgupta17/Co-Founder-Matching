import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useMockApi } from '../hooks/useMockApi';

export default function MatchScreen() {
  const { data, loading, error } = useMockApi('match');

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
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Match Screen</Text>
      <Text style={{ marginBottom: 16 }}>{data?.message}</Text>

      {data?.recommendedUsers?.map((user: any) => (
        <View key={user.id} style={{ marginBottom: 8 }}>
          <Text style={{ fontWeight: '600' }}>- {user.name}</Text>
        </View>
      ))}
    </View>
  );
}