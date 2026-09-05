import { Platform, ToastAndroid } from 'react-native';

/**
 * Feedback succès discret (M10-11). L'app cible Android : `ToastAndroid`.
 * Sur autres plateformes : no-op (pas de dépendance supplémentaire).
 */
export function toast(message: string): void {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }
}
