import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🦆 Picsou Collection</Text>
      <Text style={styles.subtitle}>
        Collectionnez vos magazines Disney, sans doublons, sans internet.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
