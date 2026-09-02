import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';

import { MagazineForm } from '@/components/magazine-form';
import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { useCollectionStore } from '@/store/use-collection-store';
import type { CreateMagazineInput } from '@/types';

export default function ManualEntryScreen() {
  const router = useRouter();
  const addMagazine = useCollectionStore((s) => s.addMagazine);
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  const handleSubmit = async (input: CreateMagazineInput) => {
    await addMagazine(input);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Ajouter une édition</Text>
      <MagazineForm submitLabel="Enregistrer" onSubmit={handleSubmit} />
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.four,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: Spacing.three,
    },
  });
}
