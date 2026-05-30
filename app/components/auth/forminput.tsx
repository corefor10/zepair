// components/auth/FormInput.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { palette, spacing } from '../../../theme';

interface FormInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: any;
  secureTextEntry?: boolean;
  autoCapitalize?: any;
  icon: string;
  trailingNode?: React.ReactNode;
  error?: boolean;
  errorText?: string;
  prefix?: string;
  autoFocus?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  autoCapitalize = 'none',
  icon,
  trailingNode,
  error,
  errorText,
  prefix,
  autoFocus,
}) => {
  const [focused, setFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? palette.error : palette.outlineVariant,
      error ? palette.error : palette.primaryContainer,
    ],
  });

  const iconColor = error
    ? palette.error
    : focused
    ? palette.primaryContainer
    : palette.outline;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View style={[styles.container, { borderColor }]}>
        <MaterialIcons
          name={icon as any}
          size={20}
          color={iconColor}
          style={styles.icon}
        />
        {prefix && (
          <View style={styles.prefixRow}>
            <Text style={styles.prefixText}>{prefix}</Text>
            <View style={styles.prefixDivider} />
          </View>
        )}
        <TextInput
          style={[styles.input, prefix ? { paddingLeft: 8 } : undefined]}
          placeholder={placeholder}
          placeholderTextColor={`${palette.outline}80`}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
        />
        {trailingNode}
      </Animated.View>
      {error && errorText && (
        <Text style={styles.errorText}>{errorText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
    marginLeft: spacing.base,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: palette.surfaceContainerLowest,
    paddingHorizontal: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurface,
    height: '100%',
  },
  prefixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginRight: spacing.xs,
  },
  prefixText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  prefixDivider: {
    width: 1,
    height: 16,
    backgroundColor: palette.outlineVariant,
  },
  errorText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    color: palette.error,
    marginLeft: spacing.xs,
  },
});

export default FormInput;