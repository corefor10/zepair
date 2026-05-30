// components/auth/OrDivider.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, spacing } from '../../../theme';

const OrDivider: React.FC = () => (
  <View style={styles.row}>
    <View style={styles.line} />
    <Text style={styles.text}>OR</Text>
    <View style={styles.line} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
    gap: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: palette.outlineVariant,
  },
  text: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.outline,
  },
});

export default OrDivider;