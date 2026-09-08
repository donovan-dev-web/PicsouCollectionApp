import { StyleSheet } from 'react-native';
import { Spacing, type ThemeColors } from '@/constants/theme';

export function makeMagazineFormStyles(colors: ThemeColors) {
  return StyleSheet.create({
    formScroll: {
      flex: 1,
    },
    formKeyboard: {
      flex: 1,
    },
    form: {
      gap: Spacing.two,
      paddingBottom: Spacing.four,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginTop: Spacing.two,
    },
    input: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 8,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      minHeight: 44,
      fontSize: 16,
      color: colors.text,
    },
    notesInput: {
      minHeight: 72,
      textAlignVertical: 'top',
    },
    formError: {
      marginTop: Spacing.two,
      fontSize: 14,
      fontWeight: '600',
      color: colors.danger,
      textAlign: 'center',
    },
    detailsToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      marginTop: Spacing.three,
      alignSelf: 'flex-start',
      minHeight: 44,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: 8,
      backgroundColor: colors.backgroundElement,
    },
    detailsToggleText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.accentTextOnLight,
    },
    details: {
      gap: Spacing.two,
    },
    dateRow: {
      flexDirection: 'row',
      gap: Spacing.three,
    },
    dateCol: {
      flex: 1,
    },
    barcodeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    barcodeInput: {
      flex: 1,
    },
    scanButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      justifyContent: 'center',
      backgroundColor: colors.backgroundElement,
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: 8,
      minHeight: 44,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
    },
    scanButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    buttonPressed: {
      opacity: 0.8,
    },
    submit: {
      marginTop: Spacing.three,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      minHeight: 48,
      paddingVertical: Spacing.three,
      borderRadius: 12,
    },
    submitDisabled: {
      opacity: 0.5,
    },
    submitText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.accentText,
    },
    submitHint: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    keyboardSpacer: {
      height: 200,
    },
  });
}
