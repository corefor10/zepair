import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme_constant';
import { GradientButton } from '../components/auth';

const OTP_LENGTH = 6;

/** Individual OTP digit box */
const OtpBox = ({
  value,
  index,
  inputRef,
  onChange,
  onKeyPress,
  autoFocus,
}: {
  value: string;
  index: number;
  inputRef: (ref: TextInput) => void;
  onChange: (v: string, i: number) => void;
  onKeyPress: (e: any, i: number) => void;
  autoFocus?: boolean;
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
        styles.otpBox,
        { borderColor },
        value && styles.otpBoxFilled,
      ]}
    >
      <TextInput
        ref={inputRef}
        style={styles.otpBoxInput}
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

export const OTPVerificationScreen = ({
  phoneNumber = '+91 98765 43210',
  onVerify,
  onBack,
}: {
  phoneNumber?: string;
  onVerify: () => void;
  onBack: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pingAnim = useRef(new Animated.Value(1)).current;
  const contentAnim = useRef(
    [0, 1, 2].map(() => new Animated.Value(0))
  ).current;
  const contentSlideAnim = useRef(
    [0, 1, 2].map(() => new Animated.Value(24))
  ).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pingAnim, {
          toValue: 1.6,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pingAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.parallel(
      contentAnim.map((a, i) =>
        Animated.parallel([
          Animated.timing(a, {
            toValue: 1,
            duration: 500,
            delay: 200 + i * 100,
            useNativeDriver: true,
          }),
          Animated.timing(contentSlideAnim[i], {
            toValue: 0,
            duration: 500,
            delay: 200 + i * 100,
            useNativeDriver: true,
          }),
        ])
      )
    ).start();

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const aStyle = (i: number) => ({
    opacity: contentAnim[i],
    transform: [{ translateY: contentSlideAnim[i] }],
  });

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onVerify();
    }, 1500);
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setCountdown(45);
    setCanResend(false);
    inputRefs.current[0]?.focus();

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <View
      style={[styles.screen, { backgroundColor: palette.surfaceBright }]}
    >
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.otpBlobTopLeft} />
      <View style={styles.otpBlobBottomRight} />

      {/* Header */}
      <View
        style={[
          styles.otpHeader,
          { paddingTop: insets.top + spacing.lg },
        ]}
      >
        <TouchableOpacity
          style={styles.backIconBtn}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={palette.onSurface}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.otpScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Illustration */}
          <Animated.View style={[styles.otpIllustration, aStyle(0)]}>
            <View style={styles.otpIllustrationWrapper}>
              <Animated.View
                style={[
                  styles.otpPingRing,
                  { transform: [{ scale: pingAnim }] },
                ]}
              />
              <Animated.View
                style={[
                  styles.otpGlow,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <View style={styles.otpIconBox}>
                <MaterialIcons
                  name="phone-android"
                  size={64}
                  color={palette.primary}
                />
              </View>
            </View>
            <Text style={styles.otpTitle}>Verify Your Phone</Text>
            <Text style={styles.otpSubtitle}>
              We sent a 6-digit code to{'\n'}
              <Text style={styles.otpPhoneNumber}>{phoneNumber}</Text>
            </Text>
          </Animated.View>

          {/* OTP Boxes */}
          <Animated.View style={[styles.otpBoxRow, aStyle(1)]}>
            {Array(OTP_LENGTH)
              .fill(0)
              .map((_, i) => (
                <OtpBox
                  key={i}
                  value={otp[i]}
                  index={i}
                  inputRef={(ref: TextInput) =>
                    (inputRefs.current[i] = ref)
                  }
                  onChange={handleOtpChange}
                  onKeyPress={handleKeyPress}
                  autoFocus={i === 0}
                />
              ))}
          </Animated.View>

          {/* Timer & Resend */}
          <Animated.View style={[styles.resendContainer, aStyle(2)]}>
            {!canResend && (
              <Text style={styles.countdownText}>
                Resend OTP in{' '}
                <Text style={styles.countdownTimer}>
                  {formatCountdown(countdown)}
                </Text>
              </Text>
            )}
            <TouchableOpacity
              onPress={handleResend}
              disabled={!canResend}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.resendOtpLink,
                  !canResend && styles.resendDisabled,
                ]}
              >
                Resend Code
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Verify Button */}
      <View
        style={[
          styles.otpStickyFooter,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <GradientButton
          label="Verify"
          onPress={handleVerify}
          loading={loading}
          icon="verified-user"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  otpBlobTopLeft: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: `${palette.primary}0D`,
    zIndex: 0,
  },
  otpBlobBottomRight: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: `${palette.secondary}0D`,
    zIndex: 0,
  },
  otpHeader: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.md,
  },
  backIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  otpScrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.xl,
  },
  otpIllustration: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.xl,
  },
  otpIllustrationWrapper: {
    width: 192,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpPingRing: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: `${palette.primary}33`,
  },
  otpGlow: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: `${palette.primary}0D`,
  },
  otpIconBox: {
    width: 128,
    height: 128,
    borderRadius: 24,
    backgroundColor: palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: { elevation: 6 },
    }),
  },
  otpTitle: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.onSurface,
    textAlign: 'center',
  },
  otpSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: palette.outline,
    textAlign: 'center',
    lineHeight: 20,
  },
  otpPhoneNumber: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: palette.onSurface,
    letterSpacing: 0.5,
  },
  otpBoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  otpBox: {
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
  otpBoxFilled: {
    backgroundColor: `${palette.primaryContainer}0D`,
    borderColor: palette.primaryContainer,
  },
  otpBoxInput: {
    width: '100%',
    height: '100%',
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  countdownText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.outline,
  },
  countdownTimer: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
  },
  resendOtpLink: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
    marginTop: spacing.xs,
  },
  resendDisabled: { opacity: 0.4 },
  otpStickyFooter: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    backgroundColor: `${palette.surfaceBright}CC`,
    borderTopWidth: 1,
    borderTopColor: `${palette.outlineVariant}40`,
  },
});

export default OTPVerificationScreen;