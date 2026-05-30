import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme';
import { GradientButton, FormInput, AmbientBlobs } from '../components/auth';

export const ForgotPasswordScreen = ({
  onBack,
  onEmailSent,
}: {
  onBack: () => void;
  onEmailSent?: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [resendState, setResendState] = useState<
    'idle' | 'sending' | 'sent'
  >('idle');

  const formOpacity = useRef(new Animated.Value(1)).current;
  const formSlide = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successSlide = useRef(new Animated.Value(24)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleSend = () => {
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(formSlide, {
        toValue: -16,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep('success');
      Animated.parallel([
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(successSlide, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleResend = () => {
    setResendState('sending');
    setTimeout(() => {
      setResendState('sent');
      setTimeout(() => setResendState('idle'), 3000);
    }, 1000);
  };

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <AmbientBlobs />

      <ScrollView
        contentContainerStyle={[
          styles.centeredScrollContent,
          {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Form Step */}
        {step === 'form' && (
          <Animated.View
            style={[
              styles.fpContainer,
              {
                opacity: formOpacity,
                transform: [{ translateY: formSlide }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.fpIllustration,
                {
                  opacity: iconOpacity,
                  transform: [{ scale: iconScale }],
                },
              ]}
            >
              <Animated.View
                style={[styles.fpGlowRing, { opacity: glowAnim }]}
              />
              <View style={styles.fpIconBox}>
                <MaterialIcons
                  name="lock-reset"
                  size={64}
                  color={palette.primary}
                />
              </View>
            </Animated.View>

            <View style={styles.fpTextBlock}>
              <Text style={styles.fpTitle}>Forgot Password?</Text>
              <Text style={styles.fpSubtitle}>
                Enter your email or phone number and we'll send you
                instructions to reset your password.
              </Text>
            </View>

            <FormInput
              label="Email or Phone Number"
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon="alternate-email"
            />

            <GradientButton
              label="Send Reset Link"
              onPress={handleSend}
              icon="arrow-forward"
              style={{ marginTop: spacing.sm }}
            />

            <TouchableOpacity
              style={styles.fpBackLink}
              onPress={onBack}
              activeOpacity={0.7}
            >
              <Text style={styles.fpBackLinkText}>Back to Sign In</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <Animated.View
            style={[
              styles.fpContainer,
              {
                opacity: successOpacity,
                transform: [{ translateY: successSlide }],
              },
            ]}
          >
            <View style={styles.fpIllustration}>
              <View
                style={[
                  styles.fpGlowRing,
                  { backgroundColor: '#10b98133' },
                ]}
              />
              <View style={styles.fpIconBox}>
                <View style={styles.successCheckCircle}>
                  <MaterialIcons
                    name="check"
                    size={40}
                    color={palette.onPrimary}
                  />
                </View>
              </View>
            </View>

            <View style={styles.fpTextBlock}>
              <Text style={styles.fpTitle}>Email Sent!</Text>
              <Text style={styles.fpSubtitle}>
                We've sent a password reset link to your email address.
                Check your inbox to continue.
              </Text>
            </View>

            <GradientButton
              label="Open Email App"
              onPress={() => {}}
              colors={[palette.primary, palette.primaryContainer]}
              icon="mail"
            />

            <View style={styles.resendSection}>
              <Text style={styles.resendHelperText}>
                Didn't receive the email?
              </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={resendState !== 'idle'}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.resendLink,
                    resendState === 'sent' && { color: '#059669' },
                    resendState === 'sending' && { opacity: 0.6 },
                  ]}
                >
                  {resendState === 'idle'
                    ? 'Resend Email'
                    : resendState === 'sending'
                    ? 'Sending...'
                    : 'Email Resent!'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centeredScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.marginMobile,
  },
  fpContainer: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.xl,
  },
  fpIllustration: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fpGlowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${palette.primaryContainer}1A`,
  },
  fpIconBox: {
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  successCheckCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  fpTextBlock: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  fpTitle: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.onSurface,
    textAlign: 'center',
  },
  fpSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: palette.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  fpBackLink: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderRadius: 12,
  },
  fpBackLinkText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
  },
  resendSection: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.md,
    width: '100%',
  },
  resendHelperText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: palette.outline,
  },
  resendLink: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
    textDecorationLine: 'underline',
  },
});

export default ForgotPasswordScreen;