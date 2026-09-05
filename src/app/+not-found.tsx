import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Screen } from '@/components/screen';
import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

export default function NotFoundScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Introuvable' }} />
      <View style={styles.container}>
        <Feather name="search" size={48} color={colors.textSecondary} />
        <Text style={styles.title}>Page introuvable</Text>
        <Text style={styles.subtitle}>Cette page n&apos;existe pas ou a été déplacée.</Text>
        <Pressable
          style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]}
          onPress={() => router.replace('/')}
          testID="not-found-home"
          accessibilityRole="button"
          accessibilityLabel="Retour à la page d'accueil"
          android_ripple={{ color: 'rgba(0,0,0,0.12)' }}>
          <Feather name="home" size={20} color={colors.accentText} />
          <Text style={styles.homeButtonText}>Retour à l&apos;accueil</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.four,
      gap: Spacing.three,
    },
    title: {
      fontSize: 22,
      lineHeight: 30,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    homeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      marginTop: Spacing.two,
      backgroundColor: colors.accent,
      minHeight: 48,
      paddingHorizontal: Spacing.four,
      borderRadius: 12,
    },
    pressed: {
      opacity: 0.8,
    },
    homeButtonText: {
      color: colors.accentText,
      fontSize: 17,
      lineHeight: 24,
      fontWeight: '700',
    },
  });
}
