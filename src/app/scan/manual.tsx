import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { MagazineForm } from '@/components/magazine-form';
import { Screen } from '@/components/screen';
import { HitTarget, Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { toast } from '@/lib/toast';
import { useCollectionStore } from '@/store/use-collection-store';
import type { CreateMagazineInput } from '@/types';

export default function ManualEntryScreen() {
  const router = useRouter();
  const { barcode, publication, issueNumber, year } = useLocalSearchParams<{
    barcode?: string;
    publication?: string;
    issueNumber?: string;
    year?: string;
  }>();
  const addMagazine = useCollectionStore((s) => s.addMagazine);
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  const handleSubmit = async (input: CreateMagazineInput) => {
    await addMagazine(input);
    toast('Édition ajoutée à la collection');
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={handleCancel}
            testID="manual-cancel"
            accessibilityRole="button"
            accessibilityLabel="Annuler la saisie"
            hitSlop={HitTarget.hitSlop}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Ajouter une édition</Text>
        </View>
        <MagazineForm
          submitLabel="Enregistrer"
          initialBarcode={barcode}
          initialPublication={publication}
          initialIssueNumber={issueNumber ? Number(issueNumber) : null}
          initialYear={year}
          onSubmit={handleSubmit}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      padding: Spacing.four,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      marginBottom: Spacing.three,
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
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700',
      color: colors.text,
    },
  });
}
