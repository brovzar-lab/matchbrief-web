import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MemoCategory, CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ICONS } from '../lib/config';

interface Props {
  category: MemoCategory;
  onPress?: () => void;
  size?: 'sm' | 'md';
}

export default function CategoryChip({ category, onPress, size = 'md' }: Props) {
  const color = CATEGORY_COLORS[category];
  const Wrapper = onPress ? TouchableOpacity : React.Fragment;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  return (
    <Wrapper {...wrapperProps}>
      <Text
        style={[
          styles.chip,
          size === 'sm' ? styles.chipSm : styles.chipMd,
          { color, borderColor: color + '44', backgroundColor: color + '18' },
        ]}
      >
        {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category]}
      </Text>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  chip: {
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  chipSm: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipMd: {
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
