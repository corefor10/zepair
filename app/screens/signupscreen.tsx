import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme_constant';
import { GradientButton, FormInput, OrDivider, SocialButton } from '../components/auth';

function getPasswordStrength(password: string): {
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  width: number;
  color: string;
  label: string;
} {
  if (!password)
    return { level: 'weak', width: 0, color: palette.error, label: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1)
    return {
      level: 'weak',
      width: 20,
      color: palette.error,
      label: 'Weak password',
    };
  if (score === 2)
    return {
      level: 'medium',
      width: 40,
      color: palette.warning,
      label: 'Fair password',
    };
  if (score === 3)
    return {
      level: 'strong',
      width: 65,
      color: palette.primaryContainer,
      label: 'Strong password',
    };
  return {
    level: 'very-strong',
    width: 100,
    color: palette.success,
    label: 'Very strong!',
  };
}

export const SignUpScreen = ({
  onSignUp,
  onSignIn,
}: {
  onSignUp: () => void;
  onSignIn: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);
  const strengthWidthAnim = useRef(new Animated.Value(0)).current;

  const headerAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(strengthWidthAnim, {
      toValue: strength.width,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [password]);

  const validatePhone = (val: string) => {
    setPhone(val);
    setPhoneError(
      val.length > 0 && val.replace(/\D/g, '').length !== 10
    );
  };

  const handleSubmit = () => {
    if (!name || !email || !phone || !password || !agreed) return;
    if (phoneError) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSignUp();
    }, 1500);
  };

  const strengthBarWidth = strengthWidthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.signUpBlobTopRight} />
      <View style={styles.signUpBlobBottomLeft} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + spacing.xl,
              paddingBottom: insets.bottom + spacing.xl,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.signUpHeader,
              {
                opacity: headerAnim,
                transform: [{ translateY: headerSlide }],
              },
            ]}
          >
            <LinearGradient
              colors={[
                palette.primaryContainer,
                palette.primaryContainer,
              ]}
              style={styles.signUpLogoBox}
            >
              <MaterialIcons
                name="build"
                size={24}
                color={palette.onPrimary}
              />
            </LinearGradient>
            <Text style={styles.signUpTitle}>Create Your Account</Text>
          </Animated.View>

          {/* Social */}
          <View style={styles.signUpSocialRow}>
            <SocialButton onPress={() => {}}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDE6w1GvjpKmFeEMDBRJiBXsXCd_bpqaEyYG4sahkqzWHgXOuP0qEmA6G5v-a1ReZJjNZ-Fewh0jpCTJKhf5_agPIfv7wk-N1xchAxO5FttM_1uPDw-Ua25UedS8wO_T5zcs7gEbyXNHvL-fU5_WGw4Frskd6AOCLJrq1F0sxKICFdkvUXnjoB5HuE9waF8scA1TuCHTu1xAYv41KZMuvsXvXO8mWtgtn_Nwu7J4HzmTPoX_yZ1y8n_T7TXAVUm2lJTJB2v6_TtN_Xf',
                }}
                style={styles.socialLogo}
                resizeMode="contain"
              />
            </SocialButton>
            <SocialButton onPress={() => {}}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwr3d8S6Ks72O-NXJe-ijMKrZnZmf1BAvN0SMvOJs7WxtJp2EbtPx-UCBA67pSo1jBhZw87n2u5YjA-NJ99qAcnfpv9mRy3x_5jFWqJ3bd4Gj8hKvXErAA4MXKbJjyRn7kl3LsVkXgL6Z_KA8o9OKsgYsAZXD5xBnS9JvJu4xe-O26Y3ixuQAHPQBsSt86BVBtVyaBsErVNCfUstXxnk8sJzdrHZMTrjxPr6yG4N3KgiTpleHpH_fiQuAm9mqwRk2aOmQlV6bfFA8A',
                }}
                style={styles.socialLogo}
                resizeMode="contain"
              />
            </SocialButton>
            <SocialButton onPress={() => {}}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcmtJOw_GdM8dQkMBlG5bcskcWT3pti7mX06qBIP0X8ro45GkXyoBO0W6mbuaJMTSpHWW9d_jhIZgAZ6FH3jTazFsaHIY0E66SKLIvW-o7PXh5r1LLm13GjLvk8sy3b6nDcAPhSe2nWiksTXgfP6HgEAi3j3HbyccQ9LmMxDYit7806YjOqmAof-tpAmAngF3ownN8STAsfDkaAeyyat-0AMVzM7r98FyVLwCtRGoSKUC97JVq32M6V8a2R0tfa7vnkVlpGXc4LylG',
                }}
                style={styles.socialLogo}
                resizeMode="contain"
              />
            </SocialButton>
          </View>

          <OrDivider />

          {/* Form */}
          <View style={styles.signUpForm}>
            <FormInput
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              icon="person"
              autoCapitalize="words"
            />
            <FormInput
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon="mail"
            />
            <FormInput
              placeholder="Phone Number"
              value={phone}
              onChangeText={validatePhone}
              keyboardType="phone-pad"
              icon="call"
              error={phoneError}
              errorText="Please enter a valid 10-digit mobile number"
              prefix="+91"
            />

            {/* Password + Strength */}
            <View style={styles.passwordBlock}>
              <FormInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                icon="lock"
                trailingNode={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.trailingIcon}
                  >
                    <MaterialIcons
                      name={
                        showPassword ? 'visibility' : 'visibility-off'
                      }
                      size={20}
                      color={palette.outline}
                    />
                  </TouchableOpacity>
                }
              />
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthTrack}>
                    <Animated.View
                      style={[
                        styles.strengthFill,
                        {
                          width: strengthBarWidth,
                          backgroundColor: strength.color,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.strengthLabel,
                      { color: strength.color },
                    ]}
                  >
                    {strength.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  agreed && styles.checkboxChecked,
                ]}
              >
                {agreed && (
                  <MaterialIcons
                    name="check"
                    size={14}
                    color={palette.onPrimary}
                  />
                )}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <GradientButton
              label="Create Account"
              onPress={handleSubmit}
              loading={loading}
              style={{ marginTop: spacing.md }}
            />
          </View>

          {/* Footer */}
          <View style={styles.signInFooter}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={onSignIn}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.marginMobile,
  },
  signUpBlobTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: `${palette.primaryContainer}0D`,
    zIndex: 0,
  },
  signUpBlobBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: `${palette.secondaryContainer}0D`,
    zIndex: 0,
  },
  signUpHeader: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  signUpLogoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '3deg' }],
    ...Platform.select({
      ios: {
        shadowColor: palette.primaryContainer,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  signUpTitle: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.onSurface,
    marginTop: spacing.sm,
  },
  signUpSocialRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialLogo: { width: 22, height: 22 },
  signUpForm: { gap: spacing.md },
  passwordBlock: { gap: spacing.xs },
  strengthContainer: {
    gap: spacing.base,
    marginTop: spacing.xs,
  },
  strengthTrack: {
    width: '100%',
    height: 4,
    backgroundColor: palette.surfaceContainerHighest,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: palette.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: palette.primaryContainer,
    borderColor: palette.primaryContainer,
  },
  termsText: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 14,
    color: palette.onSurfaceVariant,
    lineHeight: 20,
  },
  termsLink: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: palette.primary,
  },
  trailingIcon: { padding: spacing.xs },
  signInFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  footerText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: palette.outline,
  },
  footerLink: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: palette.primary,
  },
});

export default SignUpScreen;