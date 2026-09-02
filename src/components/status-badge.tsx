import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';

type Props = {
  owned: boolean;
  quantity?: number;
};

export function StatusBadge({ owned, quantity = 0 }: Props) {
  return owned ? (
    <View style={[styles.badge, styles.owned]} testID="status-owned">
      <Text style={styles.ownedText}>🔴 Possédé{quantity > 0 ? ` (${quantity})` : ''}</Text>
    </View>
  ) : (
    <View style={[styles.badge, styles.absent]} testID="status-absent">
      <Text style={styles.absentText}>🟢 Absent</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    alignSelf: 'flex-start',
  },
  owned: {
    backgroundColor: '#FDE8E8',
  },
  ownedText: {
    color: '#B3261E',
    fontSize: 12,
    fontWeight: '700',
  },
  absent: {
    backgroundColor: '#E6F4EA',
  },
  absentText: {
    color: '#137333',
    fontSize: 12,
    fontWeight: '700',
  },
});
