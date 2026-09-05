import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/hooks/use-theme';

/**
 * Bouton flottant scan global (M10R-10) : accessible depuis Accueil,
 * Collection, Fiche et Paramètres. Positionné au-dessus de la tabBar
 * ou de la gesture bar.
 */
export function ScanFAB({ testID = 'scan-fab' }: { testID?: string }) {
  const router = useRouter();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(colors, insets);

  return (
    <Pressable
      style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      onPress={() => router.push('/scan')}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel="Scanner un magazine"
      android_ripple={{ color: 'rgba(0,0,0,0.15)' }}>
      <Feather name="camera" size={24} color={colors.accentText} />
    </Pressable>
  );
}

function makeStyles(
  colors: { accent: string; accentText: string; background: string },
  insets: { bottom: number },
) {
  return StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: insets.bottom + 16,
      right: 16,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
    },
    fabPressed: {
      opacity: 0.85,
    },
  });
}
