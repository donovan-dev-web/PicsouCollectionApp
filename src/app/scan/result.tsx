import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

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

  const exists = Boolean(params.id);
  const barcode = params.barcode ?? '';

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
        {exists && (
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={() => router.replace(`/collection/${params.id}`)}
            testID="result-view"
            accessibilityRole="button"
            accessibilityLabel="Voir la fiche du magazine">
            <Text style={styles.primaryButtonText}>Voir la fiche</Text>
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
