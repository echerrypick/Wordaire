import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GameSettingsProvider } from '@/contexts/GameSettingsContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GameSettingsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </GameSettingsProvider>
  );
}
