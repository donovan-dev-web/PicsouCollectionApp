import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { useCollectionStore } from '@/store/use-collection-store';

export default function ScanResultScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const params = useLocalSearchParams<{
    id?: string;
    publication?: string;
    issueNumber?: string;
    barcode?: string;
  }>();

  const loadDetail = useCollectionStore((s) => s.loadDetail);
  const detail = useCollectionStore((s) => s.detail);
  const detailLoading = useCollectionStore((s) => s.detailLoading);
  const addExistingCopy = useCollectionStore((s) => s.addExistingCopy);

  const id = params.id ?? '';
  const exists = id !== '';
  const barcode = params.barcode ?? '';

  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadDetail(id);
      }
    }, [id, loadDetail]),
  );

  const resolved = detail != null && detail.id === id;
  const owned = resolved && detail.copies.length > 0;
  const ownedCount = resolved ? detail.copies.length : 0;

  const handleAddCopy = () => {
    if (!id) {
      return;
    }
    const alreadyOwned = owned;

    const perform = () => {
      addExistingCopy(id);
    };

    if (alreadyOwned) {
      Alert.alert(
        'Vous possédez déjà ce magazine',
        `Exemplaires actuels : ${ownedCount}\nVoulez-vous ajouter un deuxième exemplaire ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Ajouter quand même', style: 'destructive', onPress: perform },
        ],
      );
    } else {
      perform();
    }
  };

  const handleManual = () => {
    router.replace({
      pathname: '/scan/manual',
      params: barcode ? { barcode } : {},
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {exists ? 'Déjà dans votre collection' : 'Absent de la collection'}
      </Text>

      {exists ? (
        <View style={styles.card}>
          <Text style={styles.magazine} testID="result-magazine">
            {params.publication ?? 'Magazine'}
          </Text>
          {params.issueNumber ? <Text style={styles.issue}>N° {params.issueNumber}</Text> : null}
          {resolved ? (
            <Text
              style={owned ? styles.ownedText : styles.absentText}
              testID={`result-status-${owned ? 'owned' : 'absent'}`}>
              {owned ? `🔴 Possédé (${ownedCount})` : '🟢 Absent'}
            </Text>
          ) : (
            <Text style={styles.muted} testID="result-loading">
              {detailLoading ? 'Vérification…' : 'Statut indisponible'}
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.message}>
            Ce magazine n&apos;existe pas encore dans votre collection.
          </Text>
          {barcode ? <Text style={styles.muted}>Code-barres : {barcode}</Text> : null}
        </View>
      )}

      <View style={styles.actions}>
        {exists && resolved && (
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={handleAddCopy}
            testID={owned ? 'result-add-copy' : 'result-add'}
            accessibilityRole="button"
            accessibilityLabel={owned ? 'Ajouter un exemplaire' : 'Ajouter à la collection'}>
            <Text style={styles.primaryButtonText}>
              {owned ? 'Ajouter un exemplaire' : 'Ajouter à la collection'}
            </Text>
          </Pressable>
        )}

        {exists && (
          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => router.replace(`/collection/${id}`)}
            testID="result-view"
            accessibilityRole="button"
            accessibilityLabel="Voir la fiche du magazine">
            <Text style={styles.secondaryButtonText}>Voir la fiche</Text>
          </Pressable>
        )}

        {exists ? (
          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => router.replace('/scan/barcode')}
            testID="result-rescan"
            accessibilityRole="button"
            accessibilityLabel="Scanner à nouveau">
            <Text style={styles.secondaryButtonText}>Scanner à nouveau</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={() => router.replace('/scan/camera')}
            testID="result-camera"
            accessibilityRole="button"
            accessibilityLabel="Rechercher par caméra (OCR)">
            <Text style={styles.primaryButtonText}>Caméra / OCR</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={handleManual}
          testID="result-manual"
          accessibilityRole="button"
          accessibilityLabel="Saisir manuellement">
          <Text style={styles.secondaryButtonText}>Saisir manuellement</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.four,
      justifyContent: 'center',
      gap: Spacing.three,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    card: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 12,
      padding: Spacing.four,
      alignItems: 'center',
      gap: Spacing.two,
    },
    magazine: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    issue: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    ownedText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#B3261E',
      backgroundColor: '#FDE8E8',
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.two,
      borderRadius: 8,
      overflow: 'hidden',
    },
    absentText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#137333',
      backgroundColor: '#E6F4EA',
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.two,
      borderRadius: 8,
      overflow: 'hidden',
    },
    message: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 22,
    },
    muted: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    actions: {
      gap: Spacing.three,
      marginTop: Spacing.two,
    },
    primaryButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      paddingVertical: Spacing.three,
      borderRadius: 12,
    },
    primaryButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.accentText,
    },
    secondaryButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundElement,
      paddingVertical: Spacing.three,
      borderRadius: 12,
    },
    secondaryButtonText: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    buttonPressed: {
      opacity: 0.8,
    },
  });
}
