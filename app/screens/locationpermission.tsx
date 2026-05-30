// screens/LocationPermissionScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  StatusBar,
  Modal,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing, typography } from '../../theme';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── iOS-style Permission Dialog ─────────────────────────────────────────────

interface PermissionDialogProps {
  visible: boolean;
  onAlwaysAllow: () => void;
  onAllowOnce: () => void;
  onDeny: () => void;
}

const PermissionDialog: React.FC<PermissionDialogProps> = ({
  visible,
  onAlwaysAllow,
  onAllowOnce,
  onDeny,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const dialogOptions = [
    { label: 'Allow While Using App', onPress: onAlwaysAllow, hasBorder: true },
    { label: 'Allow Once', onPress: onAllowOnce, hasBorder: true },
    { label: "Don't Allow", onPress: onDeny, hasBorder: false },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.dialogBackdrop, { opacity: backdropAnim }]}>
        <Animated.View
          style={[
            styles.dialogCard,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Dialog Header */}
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>
              Allow "Zepair" to use your location?
            </Text>
            <Text style={styles.dialogBody}>
              Zepair uses your location to connect you with nearby repair
              professionals and track service progress.
            </Text>

            {/* Map Preview */}
            <View style={styles.dialogMapPreview}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCP32jdVxsr39WI8PW5A79yknKGTymM5k9WD-5WcXCl_uK0LMS-fasqMqKTM5wVlrPLMl-munwHK0fNr46Uo5p1v8SD3CBnV6RepZzgaFi0UTO9j6K4tV61sCh8blxtGxUxCSOk2gpY_zsnJyI8DzflB_DwKld2XWzTWaZgEwBrqlaZh_xZJkKAlv5WXGlNnRXxl0J7M-9baqQRdlv4ujpTOHG3ekJ4vC9kcbKIqUYFpV6hH02nou44FBPuEbMa4PzVxDS1vnamtJgz',
                }}
                style={styles.dialogMapImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Divider */}
          <View style={styles.dialogDivider} />

          {/* Action Buttons */}
          {dialogOptions.map((option, index) => (
            <React.Fragment key={option.label}>
              <TouchableOpacity
                style={styles.dialogOption}
                onPress={option.onPress}
                activeOpacity={0.6}
              >
                <Text style={styles.dialogOptionText}>{option.label}</Text>
              </TouchableOpacity>
              {option.hasBorder && <View style={styles.dialogOptionDivider} />}
            </React.Fragment>
          ))}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

interface LocationPermissionScreenProps {
  onAllow: () => void;
  onManualEntry: () => void;
  onSkip: () => void;
}

const LocationPermissionScreen: React.FC<LocationPermissionScreenProps> = ({
  onAllow,
  onManualEntry,
  onSkip,
}) => {
  const insets = useSafeAreaInsets();
  const [dialogVisible, setDialogVisible] = useState(false);

  // Animations
  const cardRotateAnim = useRef(new Animated.Value(6)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.95)).current;
  const pingAnim = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;
  const pinScale = useRef(new Animated.Value(0.8)).current;
  const pinOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Card entrance
    Animated.parallel([
      Animated.spring(cardRotateAnim, {
        toValue: 3,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(cardScaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Content entrance
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlide, {
        toValue: 0,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Pin entrance
    Animated.parallel([
      Animated.spring(pinScale, {
        toValue: 1,
        friction: 5,
        delay: 500,
        useNativeDriver: true,
      }),
      Animated.timing(pinOpacity, {
        toValue: 1,
        duration: 400,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Ping loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pingAnim, {
          toValue: 2,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pingAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto-show dialog after entrance
    const t = setTimeout(() => setDialogVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  const cardRotate = cardRotateAnim.interpolate({
    inputRange: [0, 10],
    outputRange: ['0deg', '10deg'],
  });

  const handleAllowLocation = () => {
    setDialogVisible(false);
    setTimeout(onAllow, 300);
  };

  const handleDeny = () => {
    setDialogVisible(false);
  };

  const pingOpacity = pingAnim.interpolate({
    inputRange: [1, 2],
    outputRange: [0.6, 0],
  });

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Skip Button */}
      <View style={styles.skipRow}>
        <TouchableOpacity onPress={onSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Illustration */}
      <View style={styles.illustrationSection}>
        <View style={styles.illustrationWrapper}>
          {/* Rotated decorative background card */}
          <Animated.View
            style={[
              styles.decorCard,
              {
                transform: [
                  { rotate: cardRotate },
                  { scale: cardScaleAnim },
                ],
              },
            ]}
          />

          {/* Main illustration card */}
          <View style={styles.mainCard}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKGWa-i-K3oaB0_oqRNi0S8qJTYWdYJn6ygFq5PDTFPTKdLbvbctX9mb_pWBdTKZCzOY1pG4d5F3UzeYdCl3ADncl3f2yaC5zDcBJxYuddnvXWNBTnBxm5mRRGkrh6Na3RKFk0ln7PyGq3QkHWbEuUy5nu2UoOUjbEbxx5eVXOtQEDzA9RpoEzJbWh7TNGJcbObbYjzxykTZfcAsYOVofxXsj60iL3yy7cUaEsQ5UsvJZ57ToqUcPvRzAsg4NfSPKmpxcKwmGRipFw',
              }}
              style={styles.mapImage}
              resizeMode="cover"
            />

            {/* Pulsing location pin */}
            <Animated.View
              style={[
                styles.pinContainer,
                {
                  opacity: pinOpacity,
                  transform: [{ scale: pinScale }],
                },
              ]}
            >
              {/* Ping ring */}
              <Animated.View
                style={[
                  styles.pingRing,
                  {
                    opacity: pingOpacity,
                    transform: [{ scale: pingAnim }],
                  },
                ]}
              />

              {/* Pin button */}
              <View style={styles.pinButton}>
                <MaterialIcons
                  name="location-on"
                  size={32}
                  color={palette.onPrimary}
                />
              </View>
            </Animated.View>
          </View>
        </View>

        {/* Text content */}
        <Animated.View
          style={[
            styles.textContent,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <Text style={styles.headline}>Enable Location Access</Text>
          <Text style={styles.bodyText}>
            Zepair uses your location to show services and professionals
            available near you, provide accurate pricing, and enable real-time
            professional tracking.
          </Text>
        </Animated.View>
      </View>

      {/* Actions */}
      <Animated.View
        style={[
          styles.actionsSection,
          {
            opacity: contentOpacity,
          },
        ]}
      >
        {/* Primary CTA */}
        <TouchableOpacity
          style={styles.primaryBtnWrapper}
          onPress={() => setDialogVisible(true)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#0053db', palette.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Allow Location Access</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Secondary CTA */}
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onManualEntry}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>Enter Location Manually</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* iOS-style Permission Dialog */}
      <PermissionDialog
        visible={dialogVisible}
        onAlwaysAllow={handleAllowLocation}
        onAllowOnce={handleAllowLocation}
        onDeny={handleDeny}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_SIZE = Math.min(SW - spacing.marginMobile * 2, 320);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.surfaceBright,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
  },
  skipText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },

  // ── Illustration ──────────────────────────────────────────────────────────
  illustrationSection: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.xl,
  },
  illustrationWrapper: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorCard: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: `${palette.primaryContainer}0D`,
  },
  mainCard: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  pinContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pingRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${palette.primary}33`,
  },
  pinButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: palette.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  textContent: {
    alignItems: 'center',
    gap: spacing.md,
    maxWidth: 320,
  },
  headline: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.onSurface,
    textAlign: 'center',
  },
  bodyText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
    textAlign: 'center',
  },

  // ── Actions ───────────────────────────────────────────────────────────────
  actionsSection: {
    width: '100%',
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  primaryBtnWrapper: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: palette.primaryContainer,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  primaryBtn: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  primaryBtnText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onPrimary,
  },
  secondaryBtn: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
  },

  // ── Permission Dialog ─────────────────────────────────────────────────────
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(25,27,35,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.marginMobile,
  },
  dialogCard: {
    width: 280,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.3,
        shadowRadius: 32,
      },
      android: { elevation: 24 },
    }),
  },
  dialogHeader: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  dialogTitle: {
    fontFamily: 'Inter',
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    lineHeight: 22,
  },
  dialogBody: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '400',
    color: '#000',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  dialogMapPreview: {
    width: '100%',
    height: 128,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dialogMapImage: {
    width: '100%',
    height: '100%',
  },
  dialogDivider: {
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dialogOption: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogOptionText: {
    fontFamily: 'Inter',
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  dialogOptionDivider: {
    height: 1,
    backgroundColor: '#d1d5db',
  },
});

export default LocationPermissionScreen;