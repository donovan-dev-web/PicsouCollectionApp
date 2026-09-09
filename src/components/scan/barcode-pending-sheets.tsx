import { Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/use-theme';
import type { Pending } from './use-barcode-scanning';
import type { BarcodeStyles } from './barcode-styles';

type Props = {
  styles: BarcodeStyles;
  pending: Pending;
  onResume: () => void;
  onManual: (barcode: string) => void;
};

/**
 * Paniers du scan de code-barres (mode continu). Retours test physique : le
 * système d'exemplaires étant supprimé, un magazine scanné est toujours
 * possédé — le panier propose simplement de continuer.
 */
export function BarcodePendingSheets({ styles, pending, onResume, onManual }: Props) {
  const colors = useThemeColors();

  if (pending.kind === 'owned') {
    return (
      <View style={styles.backdrop}>
        <ScrollView contentContainerStyle={styles.sheetScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.pendingCard} testID="pending-owned">
            <Pressable
              style={({ pressed }) => [styles.sheetClose, pressed && styles.buttonPressed]}
              onPress={onResume}
              testID="pending-close"
              accessibilityRole="button"
              accessibilityLabel="Fermer">
              <Feather name="x" size={20} color={colors.textSecondary} />
            </Pressable>
            <Text style={styles.pendingTitle}>Déjà dans votre collection</Text>
            <Text style={styles.pendingMagazine}>
              {pending.magazine.publication}
              {pending.magazine.issueNumber != null ? ` n° ${pending.magazine.issueNumber}` : ''}
            </Text>
            <Text style={styles.pendingMessage}>Cette édition est bien possédée.</Text>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
              onPress={onResume}
              testID="pending-owned-ok"
              accessibilityRole="button">
              <Text style={styles.primaryButtonText}>Continuer</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (pending.kind === 'unknown') {
    return (
      <View style={styles.backdrop}>
        <ScrollView contentContainerStyle={styles.sheetScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.pendingCard} testID="pending-unknown">
            <Text style={styles.pendingTitle}>Code-barres inconnu</Text>
            <Text style={styles.pendingMessage}>{pending.barcode}</Text>
            <Text style={styles.pendingMessage}>
              Le scan seul ne crée pas l&apos;édition. Saisissez-la manuellement.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
              onPress={() => onManual(pending.barcode)}
              testID="pending-unknown-manual"
              accessibilityRole="button">
              <Text style={styles.primaryButtonText}>Saisir manuellement</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.pendingCancel, pressed && styles.buttonPressed]}
              onPress={onResume}
              testID="pending-unknown-continue"
              accessibilityRole="button">
              <Text style={styles.pendingCancelText}>Continuer le scan</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
}

export function BarcodeContinuousBar({
  styles,
  onStop,
}: {
  styles: BarcodeStyles;
  onStop: () => void;
}) {
  return (
    <View style={styles.continuousBar}>
      <Text style={styles.continuousText}>Scan en continu — vérifie chaque code-barres</Text>
      <Pressable
        style={({ pressed }) => [styles.continuousStop, pressed && styles.buttonPressed]}
        onPress={onStop}
        testID="continuous-stop"
        accessibilityRole="button"
        accessibilityLabel="Arrêter le scan en continu">
        <Text style={styles.continuousStopText}>Arrêter</Text>
      </Pressable>
    </View>
  );
}
