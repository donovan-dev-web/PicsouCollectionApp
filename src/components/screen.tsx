import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/hooks/use-theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Désactive le padding top (ex. overlays caméra plein écran qui gèrent insets eux-mêmes). */
  noTop?: boolean;
  /** Désactive le padding bottom (ex. écran avec CTA ancré custom). */
  noBottom?: boolean;
  testID?: string;
};

/**
 * Wrapper d'écran SafeZone (M10-02) : applique les insets système
 * (encoche, status bar, gesture bar) + fond du thème.
 */
export function Screen({ children, style, noTop = false, noBottom = false, testID }: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  return (
    <View
      testID={testID}
      style={[
        styles.screen,
        { backgroundColor: colors.background },
        !noTop && { paddingTop: insets.top },
        !noBottom && { paddingBottom: insets.bottom },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
