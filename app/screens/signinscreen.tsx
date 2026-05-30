import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
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
import { GradientButton, FormInput, ErrorBanner, OrDivider, SocialButton, AmbientBlobs } from '../components/auth';

export const SignInScreen = ({
  onSignIn,
  onForgotPassword,
  onSignUp,
}: {
  onSignIn: () => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(
    [0, 1, 2, 3, 4].map(() => new Animated.Value(0))
  ).current;
  const contentSlideAnim = useRef(
    [0, 1, 2, 3, 4].map(() => new Animated.Value(24))
  ).current;

  useEffect(() => {
    Animated.spring(logoAnim, {
      toValue: 1,
      friction: 5,
      tension: 50,
      useNativeDriver: true,
    }).start();

    const anims = contentAnim.map((a, i) =>
      Animated.parallel([
        Animated.timing(a, {
          toValue: 1,
          duration: 500,
          delay: 300 + i * 80,
          useNativeDriver: true,
        }),
        Animated.timing(contentSlideAnim[i], {
          toValue: 0,
          duration: 500,
          delay: 300 + i * 80,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.parallel(anims).start();
  }, []);

  const aStyle = (i: number) => ({
    opacity: contentAnim[i],
    transform: [{ translateY: contentSlideAnim[i] }],
  });

  const handleSignIn = () => {
    if (!email || !password) {
      setErrorVisible(true);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSignIn();
    }, 1500);
  };

  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });
  // Commented out - rotation animation removed to fix SDK 51 compatibility
  // const logoRotate = logoRotateAnim.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: ['0deg', '6deg'],
  // });

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <ErrorBanner
        visible={errorVisible}
        message="Invalid email or password"
        onDismiss={() => setErrorVisible(false)}
      />

      <AmbientBlobs />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + spacing.xl,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header / Logo */}
          <Animated.View
            style={[
              styles.signInHeader,
              { opacity: logoAnim, transform: [{ scale: logoScale }] },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPressIn={() =>
                Animated.timing(logoRotateAnim, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }).start()
              }
              onPressOut={() =>
                Animated.timing(logoRotateAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start()
              }
            >
              <LinearGradient
                colors={[palette.primary, palette.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoIconBox}
              >
                <MaterialIcons
                  name="handyman"
                  size={32}
                  color={palette.onPrimary}
                />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.brandName}>Zepair</Text>
          </Animated.View>

          {/* Welcome text */}
          <Animated.View style={[styles.welcomeSection, aStyle(0)]}>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to continue your premium home maintenance experience.
            </Text>
          </Animated.View>

          {/* Social Auth */}
          <Animated.View style={[styles.socialRow, aStyle(1)]}>
            <SocialButton onPress={() => {}}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB79DC4C00tOLHqJZXPjILQG8faUzP39OrKXc1oS6NkJwy4ikuZ_1k_1Fkdp1wAgjSQ4NrNKNn3piFjZz890S3V0qAa7958hpb2kYRQ9oDqSlqN4ZCcRXLXpfdBn_FB9eQJBRoIPy29NAlV1B_6L9poQSOZQvhJxsn0qKRF15CJFa_5OTXe5pSbeRJs3OIXHVN2KPKuBLegGyOAsoEQK110yF7dxt2CmJ9Wlj_U94J1wfupbG2T2rdbpKTmCpUapgM_DG4NME_xdaBk',
                }}
                style={styles.socialLogo}
                resizeMode="contain"
              />
            </SocialButton>
            <SocialButton onPress={() => {}}>
              <MaterialIcons name="facebook" size={24} color="#1877F2" />
            </SocialButton>
            <SocialButton onPress={() => {}}>
              <MaterialIcons
                name={Platform.OS === 'ios' ? 'phone-iphone' : 'android'}
                size={24}
                color={palette.onSurface}
              />
            </SocialButton>
          </Animated.View>

          {/* Divider */}
          <Animated.View style={aStyle(2)}>
            <OrDivider />
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.formSection, aStyle(3)]}>
            <FormInput
              label="Email or Phone"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon="mail"
            />

            <View style={styles.passwordFieldWrapper}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.inputLabel}>Password</Text>
                <TouchableOpacity onPress={onForgotPassword}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <FormInput
                placeholder="Enter your password"
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
                      name={showPassword ? 'visibility' : 'visibility-off'}
                      size={20}
                      color={palette.outline}
                    />
                  </TouchableOpacity>
                }
              />
            </View>

            <GradientButton
              label="Sign In"
              onPress={handleSignIn}
              loading={loading}
              icon="arrow-forward"
              colors={[palette.primary, palette.primaryContainer]}
              style={{ marginTop: spacing.md }}
            />
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.signInFooter, aStyle(4)]}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onSignUp}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </Animated.View>
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
  signInHeader: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  logoIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: palette.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  brandName: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.primary,
  },
  welcomeSection: { marginBottom: spacing.xl },
  welcomeTitle: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.onSurface,
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: palette.outline,
    lineHeight: 20,
  },
  socialRow: { flexDirection: 'row', gap: spacing.md },
  socialLogo: { width: 22, height: 22 },
  formSection: { gap: spacing.lg },
  passwordFieldWrapper: { gap: spacing.xs },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  inputLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
    marginLeft: spacing.base,
  },
  forgotText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
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

export default SignInScreen;