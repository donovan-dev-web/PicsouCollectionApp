import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { MagazineForm } from '@/components/magazine-form';
import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { useCollectionStore } from '@/store/use-collection-store';
import type { CreateMagazineInput } from '@/types';

export default function EditMagazineScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useCollectionStore((s) => s.detail);
  const updateMagazine = useCollectionStore((s) => s.updateMagazine);
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  const handleSubmit = async (input: CreateMagazineInput) => {
    await updateMagazine(id, input);
    router.back();
  };

  if (!detail) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted} testID="edit-not-found">
          Édition introuvable.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier l&apos;édition</Text>
      <MagazineForm initial={detail} submitLabel="Enregistrer" onSubmit={handleSubmit} />
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.four,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: Spacing.two,
    },
    muted: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
