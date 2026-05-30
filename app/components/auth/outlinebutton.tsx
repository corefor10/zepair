// components/auth/OutlineButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { palette, spacing } from '../../../theme';

interface OutlineButtonProps {
  label: string;
  onPress: () => void;
  style?: any;
}

const OutlineButton: React.FC<OutlineButtonProps> = ({ label, onPress, style }) => (
  <TouchableOpacity style={[styles.btn, style]} onPress={onPress} activeOpacity={0.75}>
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
  },
});

export default OutlineButton;