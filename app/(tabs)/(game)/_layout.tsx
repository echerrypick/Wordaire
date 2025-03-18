import { Stack } from 'expo-router';

export default function GameLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="word-search" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="word-quiz" />
      <Stack.Screen name="crossword" />
    </Stack>
  );
}