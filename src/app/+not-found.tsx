import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

export default function NotFoundScreen() {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
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

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      padding: Spacing.four,
      gap: Spacing.three,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    link: {
      marginTop: Spacing.two,
    },
    linkText: {
      color: colors.accent,
      fontSize: 16,
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
  });
}
