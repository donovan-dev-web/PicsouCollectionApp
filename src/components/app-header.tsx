import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { useDrawer } from '@/lib/drawer-context';

type Props = {
  title: string;
  /** Action supplémentaire rendue à droite (ex. fermeture d'un modal). */
  trailing?: ReactNode;
};

/**
 * Header commun des écrans tabs (M10R-04) : burger (menu) à gauche, titre
 * centré, lien rapide scan discret à droite. Le bouton scan est petit et
 * peu contrasté — accès rapide, pas un CTA primaire (M10R-10 revu).
 */
export function AppHeader({ title, trailing }: Props) {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const { open: openDrawer } = useDrawer();

  return (
    <View style={styles.header}>
      <Pressable
        style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
        onPress={openDrawer}
        testID="header-menu"
        accessibilityRole="button"
        accessibilityLabel="Ouvrir le menu"
        android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
        <Feather name="menu" size={22} color={colors.text} />
      </Pressable>

      <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>

      <Pressable
        style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
        onPress={() => router.push('/scan')}
        testID="header-scan"
        accessibilityRole="button"
        accessibilityLabel="Scanner un magazine"
        android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
        <Feather name="crop" size={20} color={colors.textSecondary} />
      </Pressable>

      {trailing}
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 44,
      paddingHorizontal: Spacing.two,
      borderBottomWidth: 1,
      borderBottomColor: colors.backgroundElement,
    },
    headerButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    pressed: {
      opacity: 0.6,
    },
  });
}
