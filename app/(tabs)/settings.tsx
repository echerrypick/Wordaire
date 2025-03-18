import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Volume2, VolumeOff as Volume2Off, Clock, Grid3x3, Palette, Trophy, Bell } from 'lucide-react-native';
import { useGameSettings } from '@/contexts/GameSettingsContext';
import { useFonts, Inter_700Bold, Inter_500Medium } from '@expo-google-fonts/inter';

interface SettingItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function SettingItem({ icon: Icon, title, description, value, onValueChange }: SettingItemProps) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Icon size={24} color="#8A2BE2" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: '#8A2BE2' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );
}

interface DifficultyOption {
  id: string;
  label: string;
  description: string;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    id: 'easy',
    label: 'Easy',
    description: 'Perfect for beginners',
  },
  {
    id: 'medium',
    label: 'Medium',
    description: 'Balanced challenge',
  },
  {
    id: 'hard',
    label: 'Hard',
    description: 'For word game experts',
  },
];

export default function SettingsScreen() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_500Medium,
  });

  const [settings, setSettings] = useState({
    sound: true,
    notifications: true,
    timer: true,
    largeGrid: false,
    highContrast: false,
    showHints: true,
  });

  const { difficulty: selectedDifficulty, setDifficulty: setSelectedDifficulty } = useGameSettings();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient colors={['#8A2BE2', '#4B0082']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Preferences</Text>
          <SettingItem
            icon={settings.sound ? Volume2 : Volume2Off}
            title="Sound Effects"
            description="Play sounds during gameplay"
            value={settings.sound}
            onValueChange={(value) => setSettings({ ...settings, sound: value })}
          />
          <SettingItem
            icon={Bell}
            title="Notifications"
            description="Get notified about daily challenges"
            value={settings.notifications}
            onValueChange={(value) => setSettings({ ...settings, notifications: value })}
          />
          <SettingItem
            icon={Clock}
            title="Timer"
            description="Show countdown timer during games"
            value={settings.timer}
            onValueChange={(value) => setSettings({ ...settings, timer: value })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          <SettingItem
            icon={Grid3x3}
            title="Large Grid"
            description="Increase grid size for better visibility"
            value={settings.largeGrid}
            onValueChange={(value) => setSettings({ ...settings, largeGrid: value })}
          />
          <SettingItem
            icon={Palette}
            title="High Contrast"
            description="Enhance color contrast for better readability"
            value={settings.highContrast}
            onValueChange={(value) => setSettings({ ...settings, highContrast: value })}
          />
          <SettingItem
            icon={Trophy}
            title="Show Hints"
            description="Display helpful hints during gameplay"
            value={settings.showHints}
            onValueChange={(value) => setSettings({ ...settings, showHints: value })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty Level</Text>
          <View style={styles.difficultyContainer}>
            {DIFFICULTY_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                style={[
                  styles.difficultyOption,
                  selectedDifficulty === option.id && styles.selectedDifficulty,
                ]}
                onPress={() => setSelectedDifficulty(option.id)}>
                <Text
                  style={[
                    styles.difficultyLabel,
                    selectedDifficulty === option.id && styles.selectedDifficultyText,
                  ]}>
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.difficultyDescription,
                    selectedDifficulty === option.id && styles.selectedDifficultyText,
                  ]}>
                  {option.description}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
    marginTop: 60,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
    opacity: 0.9,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#4B0082',
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter_500Medium',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  selectedDifficulty: {
    backgroundColor: '#8A2BE2',
  },
  difficultyLabel: {
    fontSize: 16,
    color: '#4B0082',
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  difficultyDescription: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  selectedDifficultyText: {
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  version: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter_500Medium',
  },
});