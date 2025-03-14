import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { Settings as SettingsIcon } from 'lucide-react-native';

export default function SettingsScreen() {
  const { unlockedLevels, unlockLevel } = useGameStore();

  const toggleLevel = (level: 'medium' | 'hard') => {
    if (!unlockedLevels.includes(level)) {
      unlockLevel(level);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SettingsIcon size={24} color="#1e293b" />
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Levels</Text>
        <Text style={styles.sectionDescription}>
          Toggle to unlock different difficulty levels
        </Text>

        <View style={styles.optionsList}>
          <View style={styles.optionItem}>
            <View>
              <Text style={styles.optionTitle}>Easy</Text>
              <Text style={styles.optionDescription}>Always unlocked</Text>
            </View>
            <Switch value={true} disabled />
          </View>

          <Pressable 
            style={styles.optionItem}
            onPress={() => toggleLevel('medium')}
          >
            <View>
              <Text style={styles.optionTitle}>Medium</Text>
              <Text style={styles.optionDescription}>8x8 grid with 6 words</Text>
            </View>
            <Switch
              value={unlockedLevels.includes('medium')}
              onValueChange={() => toggleLevel('medium')}
            />
          </Pressable>

          <Pressable 
            style={styles.optionItem}
            onPress={() => toggleLevel('hard')}
          >
            <View>
              <Text style={styles.optionTitle}>Hard</Text>
              <Text style={styles.optionDescription}>12x12 grid with 8 words</Text>
            </View>
            <Switch
              value={unlockedLevels.includes('hard')}
              onValueChange={() => toggleLevel('hard')}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
  },
  section: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    marginBottom: 16,
  },
  optionsList: {
    gap: 16,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
  },
});