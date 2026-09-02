import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';

import { MagazineForm } from '@/components/magazine-form';
import { Colors, Spacing } from '@/constants/theme';
import { useCollectionStore } from '@/store/use-collection-store';
import type { CreateMagazineInput } from '@/types';

export default function ManualEntryScreen() {
  const router = useRouter();
  const addMagazine = useCollectionStore((s) => s.addMagazine);

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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: Spacing.four,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.three,
  },
});
