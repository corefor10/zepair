// App.tsx  ← Root entry point wiring everything together
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

// Correct way to import Inter fonts
import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';

// ── Auth screens ──────────────────────────────────────────────────────────────
import SignInScreen from './app/screens/signinscreen';
import ForgotPasswordScreen from './app/screens/forgotpassword';
import OTPVerificationScreen from './app/screens/otpscreen';
import SignUpScreen from './app/screens/signupscreen';

// ── Main app ──────────────────────────────────────────────────────────────────
import AppNavigator from './navigation/AppNavigator';

// ─── Auth Flow Types ──────────────────────────────────────────────────────────

type AuthScreen =
  | 'signIn'
  | 'signUp'
  | 'forgotPassword'
  | 'otpVerification';

type AppState = 'auth' | 'main';

// ─── Debug Logger ─────────────────────────────────────────────────────────────
const DEBUG = true;
const log = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[App] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

// ─── Root App ─────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('auth');
  const [authScreen, setAuthScreen] = useState<AuthScreen>('signIn');

  log('App component rendering', { appState, authScreen });

  // Load Inter fonts - using the correct imported font objects
  const [fontsLoaded, fontError] = useFonts({
    Inter: Inter_400Regular,
    Inter_100: Inter_100Thin,
    Inter_200: Inter_200ExtraLight,
    Inter_300: Inter_300Light,
    Inter_400: Inter_400Regular,
    Inter_500: Inter_500Medium,
    Inter_600: Inter_600SemiBold,
    Inter_700: Inter_700Bold,
    Inter_800: Inter_800ExtraBold,
    Inter_900: Inter_900Black,
  });

  log('Fonts status', { fontsLoaded, fontError: fontError ? fontError.message : null });

  useEffect(() => {
    log('useEffect - prepare splash screen');
    async function prepare() {
      try {
        log('Preventing auto-hide of splash screen');
        await SplashScreen.preventAutoHideAsync();
        log('Splash screen auto-hide prevented');
      } catch (e) {
        console.warn('Splash screen error:', e);
        log('Splash screen error', e);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    log('useEffect - checking fonts loaded', { fontsLoaded });
    if (fontsLoaded) {
      log('Fonts loaded successfully, updating state');
      SplashScreen.hideAsync()
        .then(() => log('Splash screen hidden'))
        .catch((e) => log('Error hiding splash screen', e));
    }
  }, [fontsLoaded]);

  // ── Auth handlers ─────────────────────────────────────────────────────────

  const handleSignIn = () => {
    log('handleSignIn called - moving to main app');
    setAppState('main');
  };

  const handleSignUp = () => {
    log('handleSignUp called - moving to OTP verification');
    setAuthScreen('otpVerification');
  };

  const handleOtpVerified = () => {
    log('handleOtpVerified called - moving to main app');
    setAppState('main');
  };

  const handleForgotPasswordSent = () => {
    log('handleForgotPasswordSent called - moving back to sign in');
    setAuthScreen('signIn');
  };

  // ── Don't render anything until fonts are loaded ─────────────────────────────
  if (!fontsLoaded) {
    log('Fonts not loaded yet, showing loading screen');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading fonts...</Text>
      </View>
    );
  }

  if (fontError) {
    log('Font error detected', { fontError });
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Font loading error</Text>
        <Text style={styles.errorDetails}>{String(fontError)}</Text>
      </View>
    );
  }

  log('Fonts loaded, rendering content');

  // ── Render auth flow ──────────────────────────────────────────────────────
  if (appState === 'auth') {
    log('Rendering auth flow', { authScreen });
    
    try {
      return (
        <SafeAreaProvider>
          <View style={styles.root}>
            {authScreen === 'signIn' && (
              <SignInScreen
                onSignIn={handleSignIn}
                onForgotPassword={() => {
                  log('Forgot password pressed');
                  setAuthScreen('forgotPassword');
                }}
                onSignUp={() => {
                  log('Sign up pressed');
                  setAuthScreen('signUp');
                }}
              />
            )}

            {authScreen === 'signUp' && (
              <SignUpScreen
                onSignUp={handleSignUp}
                onSignIn={() => {
                  log('Sign in pressed from sign up');
                  setAuthScreen('signIn');
                }}
              />
            )}

            {authScreen === 'forgotPassword' && (
              <ForgotPasswordScreen
                onBack={() => {
                  log('Back pressed from forgot password');
                  setAuthScreen('signIn');
                }}
                onEmailSent={handleForgotPasswordSent}
              />
            )}

            {authScreen === 'otpVerification' && (
              <OTPVerificationScreen
                phoneNumber="+91 98765 43210"
                onVerify={handleOtpVerified}
                onBack={() => {
                  log('Back pressed from OTP');
                  setAuthScreen('signUp');
                }}
              />
            )}
          </View>
        </SafeAreaProvider>
      );
    } catch (err) {
      log('Error rendering auth flow', err);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error rendering auth screen</Text>
          <Text style={styles.errorDetails}>{String(err)}</Text>
        </View>
      );
    }
  }

  // ── Render main app with bottom tabs ──────────────────────────────────────
  log('Rendering main app with AppNavigator');
  
  try {
    return (
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    );
  } catch (err) {
    log('Error rendering main app', err);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error rendering main app</Text>
        <Text style={styles.errorDetails}>{String(err)}</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666666',
    fontFamily: 'System',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#D32F2F',
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'System',
  },
  errorDetails: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export default App;