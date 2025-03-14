import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { ArrowRight, TrendingUp, Users, Zap } from 'lucide-react-native';

const features = [
  {
    icon: TrendingUp,
    title: 'Analytics',
    description: 'Track your progress with detailed insights',
    color: '#818cf8',
  },
  {
    icon: Users,
    title: 'Team',
    description: 'Collaborate with your team members',
    color: '#34d399',
  },
  {
    icon: Zap,
    title: 'Quick Actions',
    description: 'Get things done faster with shortcuts',
    color: '#fb923c',
  },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>Sarah</Text>
      </View>

      <View style={styles.heroSection}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80' }}
          style={styles.heroImage}
        />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Team Meeting</Text>
          <Text style={styles.heroTime}>Today at 2:00 PM</Text>
          <Pressable style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Join Now</Text>
            <ArrowRight size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <Pressable key={index} style={styles.featureCard}>
            <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
              <feature.icon size={24} color="#ffffff" />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    backgroundColor: '#ffffff',
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
  },
  name: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#1e293b',
    marginTop: 4,
  },
  heroSection: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  heroContent: {
    padding: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  heroTime: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    marginBottom: 16,
  },
  joinButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  featuresGrid: {
    padding: 16,
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    lineHeight: 20,
  },
});