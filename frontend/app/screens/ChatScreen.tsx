import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useMockApi } from '../hooks/useMockApi';

export default function ChatScreen() {
  const { data, loading, error } = useMockApi('chat');

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
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Chat Screen</Text>
      <Text style={{ marginBottom: 16 }}>{data?.message}</Text>
      {data?.chats?.map((c: any) => (
        <View key={c.id} style={{ marginBottom: 4 }}>
          <Text>{c.name}: {c.lastMessage}</Text>
        </View>
      ))}
    </View>
  );
}