import { useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { CameraPermissionScreen } from '@/components/camera-permission-screen';
import { Screen } from '@/components/screen';
import { HitTarget, Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { useSettingsStore } from '@/store/use-settings-store';

const FEATURES = [
  {
    icon: 'crop' as const,
    label: 'Scanner le code-barres',
    detail: 'Identifiez vos magazines en un instant.',
  },
  {
    icon: 'camera' as const,
    label: 'Reconnaissance par la caméra',
    detail: 'La couverture est lue automatiquement.',
  },
  {
    icon: 'book-open' as const,
    label: 'Collection complète',
    detail: 'Suivez vos éditions et vos doubles.',
  },
  {
    icon: 'download' as const,
    label: 'Sauvegarde & réglages',
    detail: 'Exportez et personnalisez l’apparence.',
  },
];

export default function OnboardingScreen() {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const markOnboardingDone = useSettingsStore((s) => s.markOnboardingDone);

  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<'intro' | 'permission'>('intro');

  const handleAllow = async () => {
    const next = await requestPermission();
    if (next.granted) {
      markOnboardingDone();
    }
  };

  const handleStart = () => {
    if (permission?.granted) {
      markOnboardingDone();
      return;
    }
    setStep('permission');
  };

  if (step === 'permission') {
    return (
      <CameraPermissionScreen
        loading={!permission}
        canAskAgain={permission?.canAskAgain ?? false}
        onRequestPermission={handleAllow}
        onCancel={markOnboardingDone}
        description="La caméra permet d'identifier vos magazines par code-barres ou par photo de couverture."
      />
    );
  }

  return (
    <Screen>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.brand}>
          <Feather name="book-open" size={48} color={colors.accent} />
          <Text style={styles.appName}>Picsou Collection</Text>
          <Text style={styles.tagline}>Votre collection de magazines, identifiée et suivie.</Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((feature) => (
            <View key={feature.label} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Feather name={feature.icon} size={18} color={colors.accent} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureLabel}>{feature.label}</Text>
                <Text style={styles.featureDetail}>{feature.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.privacy}>
          Les données restent sur votre appareil. Aucun compte requis.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}
          onPress={handleStart}
          testID="onboarding-start"
          accessibilityRole="button"
          accessibilityLabel="Commencer">
          <Text style={styles.startButtonText}>Commencer</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    scroll: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      padding: Spacing.four,
      paddingBottom: Spacing.four + 16,
    },
    brand: {
      alignItems: 'center',
      gap: Spacing.two,
      marginTop: Spacing.four,
      marginBottom: Spacing.four,
    },
    appName: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
    },
    tagline: {
      fontSize: 16,
      lineHeight: 22,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    features: {
      gap: Spacing.three,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
    },
    featureIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.backgroundElement,
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureText: {
      flex: 1,
      gap: 2,
    },
    featureLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    featureDetail: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    privacy: {
      marginTop: Spacing.four,
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    startButton: {
      marginTop: Spacing.four,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      minHeight: HitTarget.minHeight,
      paddingVertical: Spacing.three,
      borderRadius: 12,
    },
    startButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.accentText,
    },
    pressed: {
      opacity: 0.8,
    },
  });
}
