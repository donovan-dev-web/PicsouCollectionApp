import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { ErrorView } from '@/components/error-view';
import { MagazineForm, type MagazineFormHandle } from '@/components/magazine-form';
import { Screen } from '@/components/screen';
import { HitTarget, Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { toast } from '@/lib/toast';
import { useCollectionStore } from '@/store/use-collection-store';
import type { CreateMagazineInput } from '@/types';

export default function EditMagazineScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useCollectionStore((s) => s.detail);
  const updateMagazine = useCollectionStore((s) => s.updateMagazine);
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const formRef = useRef<MagazineFormHandle>(null);

  const handleSubmit = async (input: CreateMagazineInput) => {
    await updateMagazine(id, input);
    toast('Édition mise à jour');
    router.back();
  };

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  if (!detail) {
    return (
      <Screen>
        <ErrorView
          testID="edit-not-found"
          message="Édition introuvable."
          retryLabel="Retour"
          onRetry={handleCancel}
          retryTestID="edit-back"
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={handleCancel}
            testID="edit-cancel"
            accessibilityRole="button"
            accessibilityLabel="Annuler la modification"
            hitSlop={HitTarget.hitSlop}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Modifier l&apos;édition</Text>
          <Pressable
            style={({ pressed }) => [styles.submitHeader, pressed && styles.pressed]}
            onPress={() => formRef.current?.submit()}
            testID="edit-submit-header"
            accessibilityRole="button"
            accessibilityLabel="Valider la modification"
            hitSlop={HitTarget.hitSlop}>
            <Feather name="check" size={24} color={colors.accent} />
          </Pressable>
        </View>
        <MagazineForm ref={formRef} initial={detail} submitLabel="Enregistrer" onSubmit={handleSubmit} />
      </View>
    </Screen>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: Spacing.four,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      marginBottom: Spacing.two,
    },
    backButton: {
      minWidth: HitTarget.minHeight,
      minHeight: HitTarget.minHeight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: {
      opacity: 0.7,
    },
    title: {
      flex: 1,
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700',
      color: colors.text,
    },
    submitHeader: {
      minWidth: HitTarget.minHeight,
      minHeight: HitTarget.minHeight,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
