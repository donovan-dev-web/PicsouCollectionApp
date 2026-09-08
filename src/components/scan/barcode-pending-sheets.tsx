import { Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/use-theme';
import type { Pending } from './use-barcode-scanning';
import type { BarcodeStyles } from './barcode-styles';

type Props = {
  styles: BarcodeStyles;
  pending: Pending;
  onResume: () => void;
  onConfirmAdd: () => void;
  onManual: (barcode: string) => void;
};

export function BarcodePendingSheets({ styles, pending, onResume, onConfirmAdd, onManual }: Props) {
  const colors = useThemeColors();

  if (pending.kind === 'confirm') {
    return (
      <View style={styles.backdrop}>
        <ScrollView contentContainerStyle={styles.sheetScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.pendingCard} testID="pending-confirm">
            <Pressable
              style={({ pressed }) => [styles.sheetClose, pressed && styles.buttonPressed]}
              onPress={onResume}
              testID="pending-close"
              accessibilityRole="button"
              accessibilityLabel="Fermer">
              <Feather name="x" size={20} color={colors.textSecondary} />
            </Pressable>
            <Text style={styles.pendingTitle}>Vous possédez déjà ce magazine</Text>
            <Text style={styles.pendingMagazine}>
              {pending.magazine.publication}
              {pending.magazine.issueNumber != null ? ` n° ${pending.magazine.issueNumber}` : ''}
            </Text>
            <Text style={styles.pendingMessage}>
              Exemplaires actuels : {pending.ownedCount}. Ajouter un exemplaire ?
            </Text>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
              onPress={onConfirmAdd}
              testID="pending-confirm-add"
              accessibilityRole="button">
              <Text style={styles.primaryButtonText}>Ajouter un exemplaire</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.pendingCancel, pressed && styles.buttonPressed]}
              onPress={onResume}
              testID="pending-confirm-cancel"
              accessibilityRole="button">
              <Text style={styles.pendingCancelText}>Annuler</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (pending.kind === 'success') {
    return (
      <View style={styles.backdrop}>
        <ScrollView contentContainerStyle={styles.sheetScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.pendingCard} testID="pending-success">
            <Text style={styles.pendingTitle}>Ajouté à la collection</Text>
            <Text style={styles.pendingMagazine}>
              {pending.publication}
              {pending.issueNumber != null ? ` n° ${pending.issueNumber}` : ''}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
              onPress={onResume}
              testID="pending-success-ok"
              accessibilityRole="button">
              <Text style={styles.primaryButtonText}>Scanner le suivant</Text>
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
      <Text style={styles.continuousText}>Scan en continu — ajoute chaque exemplaire</Text>
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
