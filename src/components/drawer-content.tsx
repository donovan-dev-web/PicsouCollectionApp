import React, { useCallback, useMemo } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { slug } from '@/lib/slug';
import { useSettingsStore } from '@/store/use-settings-store';

const DRAWER_WIDTH = 300;
const CLOSE_MS = 250;

/** Un glissement ouvre le panneau au-delà de 40 % de sa largeur. */
export function isOpenGesture(dx: number): boolean {
  return dx > DRAWER_WIDTH * 0.4;
}

/** Un glissement n'est pris en compte que s'il débute sur le bord gauche. */
export function isLeftEdgeGesture(dx: number, x0: number): boolean {
  return dx > 10 && x0 < 30;
}

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
      accessibilityLabel={label}
      testID={`drawer-item-${slug(label)}`}>
      <Feather name={icon} size={20} color={colors.text} />
      <Text style={styles.drawerItemLabel}>{label}</Text>
    </Pressable>
  );
}

type CollapsibleProps = {
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function Collapsible({ label, icon, expanded, onToggle, children }: CollapsibleProps) {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.drawerItem, pressed && styles.pressed]}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded }}
        testID={`drawer-collapsible-${slug(label)}`}>
        <Feather name={icon} size={20} color={colors.text} />
        <Text style={styles.drawerItemLabel}>{label}</Text>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textSecondary}
          style={styles.drawerChevron}
        />
      </Pressable>
      {expanded && <View style={styles.drawerSubSection}>{children}</View>}
    </>
  );
}

function SubItem({
  icon,
  label,
  route,
  colors,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  route: string;
  colors: ThemeColors;
  onPress: (route: string) => void;
}) {
  const styles = makeStyles(colors);
  return (
    <Pressable
      style={({ pressed }) => [styles.drawerSubItem, pressed && styles.pressed]}
      onPress={() => onPress(route)}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={`drawer-sub-${slug(label)}`}>
      <Feather name={icon} size={16} color={colors.textSecondary} />
      <Text style={styles.drawerSubItemLabel}>{label}</Text>
    </Pressable>
  );
}

/**
 * Menu latéral custom (M10R-04/M10R-05) — panneau animé sans
 * `@react-navigation/drawer` (incompatible expo-router SDK 57).
 * Liens directs : Accueil | Scan (sous-catégories) | Collection
 * (bouton global + « Par édition » repliable) | Paramètres.
 *
 * Le Modal reste monté en permanence (visible piloté par `useDrawer()`) pour
 * préserver l'état plié/déplié « Par édition » entre les ouvertures
 * (persistance de session, M10R-05).
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
  const insets = useSafeAreaInsets();
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const translateX = useMemo(() => new Animated.Value(-DRAWER_WIDTH), []);
  const [scanExpanded, setScanExpanded] = React.useState(false);
  const [editionsExpanded, setEditionsExpanded] = React.useState(!editions || editions.length <= 5);
  const [editionsManuallyToggled, setEditionsManuallyToggled] = React.useState(false);

  const open = useCallback(() => {
    if (!editionsManuallyToggled) {
      setEditionsExpanded(!editions || editions.length <= 5);
    }
    if (reducedMotion) {
      translateX.setValue(0);
      return;
    }
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  }, [editions, editionsManuallyToggled, translateX, reducedMotion]);

  const runAfterClose = useCallback(
    (action: () => void) => {
      if (reducedMotion) {
        translateX.setValue(-DRAWER_WIDTH);
        onClose();
        action();
        return;
      }
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: CLOSE_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) {
          return;
        }
        onClose();
        action();
      });
    },
    [translateX, onClose, reducedMotion],
  );

  const close = useCallback(() => runAfterClose(() => {}), [runAfterClose]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => isLeftEdgeGesture(g.dx, g.x0),
        onPanResponderMove: (_, g) => {
          if (g.dx > 0 && g.dx < DRAWER_WIDTH) {
            translateX.setValue(g.dx - DRAWER_WIDTH);
          }
        },
        onPanResponderRelease: (_, g) => {
          if (isOpenGesture(g.dx)) {
            open();
          } else {
            close();
          }
        },
      }),
    [open, close, translateX],
  );

  const navigate = useCallback(
    (route: string) => {
      runAfterClose(() => router.push(route));
    },
    [runAfterClose, router],
  );

  const navigateWithParam = useCallback(
    (edition: string) => {
      runAfterClose(() => router.push({ pathname: '/collection', params: { edition } }));
    },
    [runAfterClose, router],
  );

  return (
    <Modal transparent visible={visible} onShow={open} onRequestClose={close} animationType="none">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Fermer le menu" />
        <Animated.View
          style={[styles.drawerPanel, { transform: [{ translateX }] }]}
          testID="drawer-panel"
          {...panResponder.panHandlers}>
          <View style={styles.drawer}>
            <View
              style={[styles.drawerHeader, { paddingTop: insets.top + 16 }]}
              testID="drawer-header">
              <Feather name="book-open" size={24} color={colors.accent} />
              <Text style={styles.drawerTitle}>Picsou Collection</Text>
            </View>

            <ScrollView
              contentContainerStyle={{ paddingBottom: insets.bottom }}
              showsVerticalScrollIndicator={false}
              bounces={false}
              testID="drawer-scroll">
              <View style={styles.drawerSection}>
                <DrawerItem
                  icon="home"
                  label="Accueil"
                  route="/"
                  colors={colors}
                  onPress={navigate}
                />
              </View>

              <View style={styles.drawerSection}>
                <Pressable
                  style={({ pressed }) => [styles.drawerItem, pressed && styles.pressed]}
                  onPress={() => setScanExpanded((e) => !e)}
                  accessibilityRole="button"
                  accessibilityLabel="Scan"
                  accessibilityState={{ expanded: scanExpanded }}
                  testID="drawer-collapsible-scan">
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
                    <SubItem
                      icon="camera"
                      label="OCR (couverture)"
                      route="/scan/camera"
                      colors={colors}
                      onPress={navigate}
                    />
                    <SubItem
                      icon="crop"
                      label="Code-barres"
                      route="/scan/barcode"
                      colors={colors}
                      onPress={navigate}
                    />
                    <SubItem
                      icon="edit-3"
                      label="Saisie manuelle"
                      route="/scan/search"
                      colors={colors}
                      onPress={navigate}
                    />
                  </View>
                )}
              </View>

              <View style={styles.drawerSection}>
                <DrawerItem
                  icon="book-open"
                  label="Toute la collection"
                  route="/collection"
                  colors={colors}
                  onPress={navigate}
                />
                {editions && editions.length > 0 ? (
                  <Collapsible
                    label="Par édition"
                    icon="layers"
                    expanded={editionsExpanded}
                    onToggle={() => {
                      setEditionsExpanded((e) => !e);
                      setEditionsManuallyToggled(true);
                    }}>
                    {editions.map((edition) => (
                      <SubItem
                        key={edition}
                        icon="book"
                        label={edition}
                        route={`${edition}`}
                        colors={colors}
                        onPress={navigateWithParam}
                      />
                    ))}
                  </Collapsible>
                ) : null}
              </View>

              <View style={styles.drawerSection}>
                <DrawerItem
                  icon="settings"
                  label="Paramètres"
                  route="/settings"
                  colors={colors}
                  onPress={navigate}
                />
              </View>
            </ScrollView>
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
      minHeight: 44,
    },
    drawerSubItemLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    pressed: {
      opacity: 0.7,
    },
  });
}
