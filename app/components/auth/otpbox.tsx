// components/auth/OtpBox.tsx
import React, { useRef, useState } from 'react';
import {
  Animated,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { palette, spacing } from '../../../theme';

interface OtpBoxProps {
  value: string;
  index: number;
  inputRef: (ref: TextInput) => void;
  onChange: (v: string, i: number) => void;
  onKeyPress: (e: any, i: number) => void;
  autoFocus?: boolean;
}

const OtpBox: React.FC<OtpBoxProps> = ({
  value,
  index,
  inputRef,
  onChange,
  onKeyPress,
  autoFocus,
}) => {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.outlineVariant, palette.primaryContainer],
  });

  return (
    <Animated.View
      style={[
        styles.box,
        { borderColor },
        value ? styles.filled : undefined,
      ]}
    >
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={(v) =>
          onChange(v.replace(/[^0-9]/g, '').slice(-1), index)
        }
        onKeyPress={(e) => onKeyPress(e, index)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        keyboardType="numeric"
        maxLength={1}
        autoFocus={autoFocus}
        selectTextOnFocus
        textAlign="center"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  box: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: palette.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
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
  filled: {
    backgroundColor: `${palette.primaryContainer}0D`,
    borderColor: palette.primaryContainer,
  },
  input: {
    width: '100%',
    height: '100%',
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
    textAlign: 'center',
  },
});

export default OtpBox;