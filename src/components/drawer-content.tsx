import React from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

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

type DrawerSubItemProps = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  route: string;
  colors: ThemeColors;
  onPress: (route: string) => void;
};

function DrawerSubItem({ icon, label, route, colors, onPress }: DrawerSubItemProps) {
  const styles = makeStyles(colors);
  return (
    <Pressable
      style={({ pressed }) => [styles.drawerSubItem, pressed && styles.pressed]}
      onPress={() => onPress(route)}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Feather name={icon} size={16} color={colors.textSecondary} />
      <Text style={styles.drawerSubItemLabel}>{label}</Text>
    </Pressable>
  );
}

/**
 * Contenu personnalisé du drawer latéral (M10R-04/M10R-05).
 * Liens directs + section éditions dynamique repliable.
 */
export function DrawerContent({ editions }: { editions?: string[] }) {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const router = useRouter();
  const [scanExpanded, setScanExpanded] = React.useState(false);

  const navigate = (route: string) => {
    router.push(route);
  };

  return (
    <View style={styles.drawer}>
      <View style={styles.drawerHeader}>
        <Feather name="book-open" size={24} color={colors.accent} />
        <Text style={styles.drawerTitle}>Picsou Collection</Text>
      </View>

      <View style={styles.drawerSection}>
        <DrawerItem icon="home" label="Accueil" route="/" colors={colors} onPress={navigate} />

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
            <DrawerSubItem
              icon="camera"
              label="OCR (couverture)"
              route="/scan/camera"
              colors={colors}
              onPress={navigate}
            />
            <DrawerSubItem
              icon="crop"
              label="Code-barres"
              route="/scan/barcode"
              colors={colors}
              onPress={navigate}
            />
            <DrawerSubItem
              icon="edit-3"
              label="Saisie manuelle"
              route="/scan/manual"
              colors={colors}
              onPress={navigate}
            />
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
                router.push({ pathname: '/collection', params: { edition } });
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
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
