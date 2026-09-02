import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { MagazineForm } from '@/components/magazine-form';
import { Colors, Spacing } from '@/constants/theme';
import { useCollectionStore } from '@/store/use-collection-store';
import type { CreateMagazineInput } from '@/types';

export default function EditMagazineScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useCollectionStore((s) => s.detail);
  const updateMagazine = useCollectionStore((s) => s.updateMagazine);

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: Spacing.four,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },
  muted: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
