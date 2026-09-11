import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { slug } from '@/lib/slug';

export function makeDrawerItemStyles(colors: ThemeColors) {
  return StyleSheet.create({
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

type DrawerItemProps = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  route: string;
  colors: ThemeColors;
  onPress: (route: string) => void;
};

export function DrawerItem({ icon, label, route, colors, onPress }: DrawerItemProps) {
  const styles = makeDrawerItemStyles(colors);
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

export function Collapsible({ label, icon, expanded, onToggle, children }: CollapsibleProps) {
  const colors = useThemeColors();
  const styles = makeDrawerItemStyles(colors);
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

export function SubItem({
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
  const styles = makeDrawerItemStyles(colors);
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
