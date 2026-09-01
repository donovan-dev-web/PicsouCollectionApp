import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Introuvable' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Page introuvable</Text>
        <Text style={styles.subtitle}>Cette page nexiste pas ou a été déplacée.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Retour à la page daccueil</Text>
        </Link>
      </View>
    </>
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
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  link: {
    marginTop: Spacing.two,
  },
  linkText: {
    color: Colors.light.accent,
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
