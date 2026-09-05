import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

const DRAWER_WIDTH = 280;

type DrawerItemProps = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  route: string;
  colors: ThemeColors;
  onPress: (route: string) => void;
};

function DrawerItem({ icon, label, route, colors, onPress }: DrawerItemProps) {
  const styles = makeStyles(colors);
  return (
    <Pressable
      style={({ pressed }) => [styles.drawerItem, pressed && styles.pressed]}
      onPress={() => onPress(route)}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Feather name={icon} size={20} color={colors.text} />
      <Text style={styles.drawerItemLabel}>{label}</Text>
    </Pressable>
  );
}

/**
 * Menu latéral custom (M10R-04/M10R-05) — panneau animé sans
 * @react-navigation/drawer (incompatible expo-router SDK 57).
 */
export function DrawerMenu({
  visible,
  onClose,
  editions,
}: {
  visible: boolean;
  onClose: () => void;
  editions?: string[];
}) {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const router = useRouter();
  const translateX = useMemo(() => new Animated.Value(-DRAWER_WIDTH), []);
  const [scanExpanded, setScanExpanded] = React.useState(false);

  const open = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  }, [translateX]);

  const close = useCallback(() => {
    Animated.timing(translateX, {
      toValue: -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [translateX, onClose]);

  useEffect(() => {
    if (visible) {
      open();
    }
  }, [visible, open]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dx > 10 && g.x0 < 30,
        onPanResponderMove: (_, g) => {
          if (g.dx > 0 && g.dx < DRAWER_WIDTH) {
            translateX.setValue(g.dx - DRAWER_WIDTH);
          }
        },
        onPanResponderRelease: (_, g) => {
          if (g.dx > DRAWER_WIDTH * 0.4) {
            open();
          } else {
            close();
          }
        },
      }),
    [open, close, translateX],
  );

  const navigate = (route: string) => {
    close();
    setTimeout(() => router.push(route), 300);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal transparent visible={visible} onRequestClose={close} animationType="none">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={close} />
        <Animated.View
          style={[styles.drawerPanel, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}>
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Feather name="book-open" size={24} color={colors.accent} />
              <Text style={styles.drawerTitle}>Picsou Collection</Text>
            </View>

            <View style={styles.drawerSection}>
              <DrawerItem
                icon="home"
                label="Accueil"
                route="/"
                colors={colors}
                onPress={navigate}
              />

              <Pressable
                style={({ pressed }) => [styles.drawerItem, pressed && styles.pressed]}
                onPress={() => setScanExpanded((e) => !e)}
                accessibilityRole="button"
                accessibilityLabel="Scan"
                accessibilityState={{ expanded: scanExpanded }}>
                <Feather name="camera" size={20} color={colors.text} />
                <Text style={styles.drawerItemLabel}>Scan</Text>
                <Feather
                  name={scanExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.textSecondary}
                  style={styles.drawerChevron}
                />
              </Pressable>

              {scanExpanded && (
                <View style={styles.drawerSubSection}>
                  {(
                    [
                      ['camera', 'OCR (couverture)', '/scan/camera'],
                      ['crop', 'Code-barres', '/scan/barcode'],
                      ['edit-3', 'Saisie manuelle', '/scan/manual'],
                    ] as const
                  ).map(([icon, label, route]) => (
                    <Pressable
                      key={route}
                      style={({ pressed }) => [styles.drawerSubItem, pressed && styles.pressed]}
                      onPress={() => navigate(route)}
                      accessibilityRole="button"
                      accessibilityLabel={label}>
                      <Feather name={icon} size={16} color={colors.textSecondary} />
                      <Text style={styles.drawerSubItemLabel}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <DrawerItem
                icon="book-open"
                label="Collection"
                route="/collection"
                colors={colors}
                onPress={navigate}
              />
              <DrawerItem
                icon="settings"
                label="Paramètres"
                route="/settings"
                colors={colors}
                onPress={navigate}
              />
            </View>

            {editions && editions.length > 0 && (
              <View style={styles.drawerSection}>
                <Text style={styles.drawerSectionTitle}>Éditions</Text>
                {editions.map((edition) => (
                  <Pressable
                    key={edition}
                    style={({ pressed }) => [styles.drawerEditionItem, pressed && styles.pressed]}
                    onPress={() => {
                      close();
                      setTimeout(
                        () => router.push({ pathname: '/collection', params: { edition } }),
                        300,
                      );
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Voir l'édition ${edition}`}>
                    <Text style={styles.drawerEditionLabel} numberOfLines={1}>
                      {edition}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      flexDirection: 'row',
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    drawerPanel: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: DRAWER_WIDTH,
      elevation: 16,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    drawer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    drawerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      padding: Spacing.four,
      borderBottomWidth: 1,
      borderBottomColor: colors.backgroundElement,
    },
    drawerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    drawerSection: {
      paddingVertical: Spacing.two,
      borderBottomWidth: 1,
      borderBottomColor: colors.backgroundElement,
    },
    drawerSectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
      paddingBottom: Spacing.two,
    },
    drawerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.three,
      minHeight: 48,
    },
    drawerItemLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      flex: 1,
    },
    drawerChevron: {
      marginLeft: 'auto',
    },
    drawerSubSection: {
      paddingLeft: Spacing.five,
    },
    drawerSubItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.two,
      minHeight: 40,
    },
    drawerSubItemLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    drawerEditionItem: {
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.two,
      minHeight: 36,
      justifyContent: 'center',
    },
    drawerEditionLabel: {
      fontSize: 14,
      color: colors.text,
    },
    pressed: {
      opacity: 0.7,
    },
  });
}
