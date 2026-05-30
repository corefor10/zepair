// OnboardingScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, typography, spacing, radius, shadow, motion, componentSize } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Splash Screen ──────────────────────────────────────────────────────────

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Icon entrance
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress bar
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: false,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Auto-navigate after 3 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0%', '70%', '100%'],
  });

  const progressOpacity = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1, 0.5],
  });

  return (
    <LinearGradient
      colors={['#2563EB', '#06B6D4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.splashContainer}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background atmospheric elements */}
      <View style={styles.splashGlow1} />
      <View style={styles.splashGlow2} />

      {/* Center Identity */}
      <Animated.View
        style={[
          styles.splashCenter,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Glass Icon Container */}
        <View style={styles.splashIconContainer}>
          <Animated.View
            style={[
              styles.splashIconGlow,
              { opacity: glowAnim },
            ]}
          />
          <View style={styles.splashIconInner}>
            <MaterialIcons name="build" size={48} color={palette.onPrimary} />
          </View>
        </View>

        {/* Brand Name */}
        <Text style={styles.splashBrandName}>Zepair</Text>

        {/* Subtitle */}
        <Text style={styles.splashSubtitle}>Your Home, Our Expertise</Text>
      </Animated.View>

      {/* Progress Section */}
      <View style={[styles.splashProgressSection, { bottom: insets.bottom + 48 }]}>
        <View style={styles.splashProgressTrack}>
          <Animated.View
            style={[
              styles.splashProgressFill,
              {
                width: progressWidth,
                opacity: progressOpacity,
              },
            ]}
          />
        </View>
        <Text style={styles.splashVersionText}>PREMIUM SERVICE</Text>
      </View>
    </LinearGradient>
  );
};

// ─── Onboarding Page Data ────────────────────────────────────────────────────

interface OnboardingPage {
  id: number;
  type: 'welcome' | 'howItWorks' | 'trustSafety';
}

const PAGES: OnboardingPage[] = [
  { id: 0, type: 'welcome' },
  { id: 1, type: 'howItWorks' },
  { id: 2, type: 'trustSafety' },
];

// ─── Main Onboarding Screen ─────────────────────────────────────────────────

export const OnboardingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const insets = useSafeAreaInsets();
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Entrance animations
  const fadeAnims = useRef(
    [0, 1, 2, 3, 4].map(() => new Animated.Value(0))
  ).current;
  const slideAnims = useRef(
    [0, 1, 2, 3, 4].map(() => new Animated.Value(20))
  ).current;

  useEffect(() => {
    // Reset and play entrance animations when page changes
    fadeAnims.forEach((anim) => anim.setValue(0));
    slideAnims.forEach((anim) => anim.setValue(20));

    const animations = fadeAnims.map((fadeAnim, index) =>
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          delay: 200 + index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims[index], {
          toValue: 0,
          duration: 600,
          delay: 200 + index * 100,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(80, animations).start();
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < PAGES.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      scrollRef.current?.scrollTo({ x: nextPage * SCREEN_WIDTH, animated: true });
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      scrollRef.current?.scrollTo({ x: prevPage * SCREEN_WIDTH, animated: true });
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    if (page !== currentPage && page >= 0 && page < PAGES.length) {
      setCurrentPage(page);
    }
  };

  const animatedStyle = (index: number) => ({
    opacity: fadeAnims[Math.min(index, fadeAnims.length - 1)],
    transform: [
      { translateY: slideAnims[Math.min(index, slideAnims.length - 1)] },
    ],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Skip Button */}
      {currentPage < PAGES.length - 1 && (
        <TouchableOpacity
          style={[styles.skipButton, { top: insets.top + spacing.sm }]}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Scrollable Pages */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {/* Page 1: Welcome */}
        <View style={styles.page}>
          <WelcomePage animatedStyle={animatedStyle} />
        </View>

        {/* Page 2: How It Works */}
        <View style={styles.page}>
          <HowItWorksPage animatedStyle={animatedStyle} />
        </View>

        {/* Page 3: Trust & Safety */}
        <View style={styles.page}>
          <TrustSafetyPage animatedStyle={animatedStyle} />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          {PAGES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentPage === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Action Buttons */}
        {currentPage === 0 ? (
          <TouchableOpacity
            style={styles.primaryButtonContainer}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[palette.primaryContainer, palette.secondaryContainer]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextButtonContainer}
              onPress={handleNext}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={
                  currentPage === PAGES.length - 1
                    ? [palette.primary, palette.primaryContainer]
                    : [palette.primaryContainer, palette.secondaryContainer]
                }
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.nextButton}
              >
                <Text style={styles.primaryButtonText}>
                  {currentPage === PAGES.length - 1 ? 'Continue' : 'Next'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Page 1: Welcome ─────────────────────────────────────────────────────────

const WelcomePage = ({
  animatedStyle,
}: {
  animatedStyle: (index: number) => any;
}) => {
  const heroImgAnim = useRef(new Animated.Value(0)).current;
  const heroSlideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroImgAnim, {
        toValue: 1,
        duration: 800,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(heroSlideAnim, {
        toValue: 0,
        duration: 800,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.welcomeContainer}>
      {/* Hero Image */}
      <Animated.View
        style={[
          styles.heroImageContainer,
          {
            opacity: heroImgAnim,
            transform: [{ translateY: heroSlideAnim }],
          },
        ]}
      >
        {/* Gradient overlay top */}
        <LinearGradient
          colors={[`${palette.primary}0D`, 'transparent']}
          style={styles.heroGradientTop}
        />

        <Image
          source={{
            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPlgRPn8iDXt-Vr-RaWUFGiNT9A34XN4bC037iR9UZ6mh9-96lhGqNDS70Eg5CyxtmCwQsYRjPulPgIbKl0AOsahK3yBkzzSqevq9DuhZLJdUv7mDND56xpZKKdgY-4bJvzActlx6yjPpRsgKK7xOqyRJT-oXDQk2dZOFz1KDi5eyJOCUEjBtLXSFeDKU_o9MQNV2SpTvtuvAextGQLvHsWkpJ2ZcVXxS6clSKrBCK9LnLZV_9KmMhcOqwUhCoLU6ncFkoJBplKCZ7',
          }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Bottom gradient for text readability */}
        <LinearGradient
          colors={['transparent', palette.surfaceContainerLowest]}
          style={styles.heroGradientBottom}
        />
      </Animated.View>

      {/* Content */}
      <View style={styles.welcomeContent}>
        <Animated.Text style={[styles.welcomeTitle, animatedStyle(0)]}>
          Trusted Home Services
        </Animated.Text>

        <Animated.Text style={[styles.welcomeSubtitle, animatedStyle(1)]}>
          Connect with 10,000+ verified professionals in your city for all your
          home repair and maintenance needs.
        </Animated.Text>
      </View>
    </View>
  );
};

// ─── Page 2: How It Works ────────────────────────────────────────────────────

const HowItWorksPage = ({
  animatedStyle,
}: {
  animatedStyle: (index: number) => any;
}) => {
  return (
    <View style={styles.howItWorksContainer}>
      {/* Logo */}
      <Animated.Text style={[styles.brandLogo, animatedStyle(0)]}>
        Zepair
      </Animated.Text>

      {/* Steps Illustration */}
      <View style={styles.stepsContainer}>
        {/* Step 1: Search */}
        <Animated.View style={[styles.stepCard, styles.stepCardInactive, animatedStyle(1)]}>
          <View style={[styles.stepIconCircle, { backgroundColor: `${palette.primary}1A` }]}>
            <MaterialIcons name="search" size={28} color={palette.primary} />
          </View>
          <Text style={styles.stepLabel}>Search</Text>
        </Animated.View>

        {/* Connector Line */}
        <View style={styles.connectorLine} />

        {/* Step 2: Schedule (Active) */}
        <Animated.View style={[styles.stepCard, styles.stepCardActive, animatedStyle(2)]}>
          <View style={[styles.stepIconCircle, { backgroundColor: `${palette.secondary}1A` }]}>
            <MaterialIcons name="calendar-month" size={28} color={palette.secondary} />
          </View>
          <Text style={[styles.stepLabel, { color: palette.onSurface }]}>Schedule</Text>
        </Animated.View>

        {/* Connector Line */}
        <View style={styles.connectorLine} />

        {/* Step 3: Confirm */}
        <Animated.View style={[styles.stepCard, styles.stepCardInactive, animatedStyle(3)]}>
          <View style={[styles.stepIconCircle, { backgroundColor: '#ecfdf5' }]}>
            <MaterialIcons name="check-circle" size={28} color="#10b981" />
          </View>
          <Text style={styles.stepLabel}>Confirm</Text>
        </Animated.View>
      </View>

      {/* Content */}
      <View style={styles.howItWorksContent}>
        <Animated.Text style={[styles.howItWorksTitle, animatedStyle(3)]}>
          Book in 60 Seconds
        </Animated.Text>

        <Animated.Text style={[styles.howItWorksSubtitle, animatedStyle(4)]}>
          Find the best repair expert near you, pick a time that works, and get
          your home back in order without the stress.
        </Animated.Text>
      </View>

      {/* Atmospheric Glows */}
      <View style={styles.atmosphericGlowTopLeft} />
      <View style={styles.atmosphericGlowBottomRight} />
    </View>
  );
};

// ─── Page 3: Trust & Safety ──────────────────────────────────────────────────

const TrustSafetyPage = ({
  animatedStyle,
}: {
  animatedStyle: (index: number) => any;
}) => {
  // Floating animation for trust badges
  const floatAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    floatAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -10,
            duration: 3000,
            delay: index * 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const trustBadges = [
    {
      icon: 'verified-user' as const,
      label: 'Background Checked',
      color: palette.primary,
      position: { top: 0, left: 16 },
    },
    {
      icon: 'account-balance-wallet' as const,
      label: 'Insured',
      color: palette.secondary,
      position: { top: 48, right: 0 },
    },
    {
      icon: 'badge' as const,
      label: 'Licensed',
      color: palette.tertiary,
      position: { bottom: 48, left: 0 },
    },
    {
      icon: 'school' as const,
      label: 'Trained',
      color: '#059669',
      position: { bottom: 0, right: 32 },
    },
  ];

  return (
    <View style={styles.trustContainer}>
      {/* Illustration Section */}
      <Animated.View style={[styles.trustIllustration, animatedStyle(0)]}>
        {/* Background glow */}
        <View style={styles.trustBackgroundGlow} />

        {/* Central Avatar */}
        <View style={styles.trustAvatarWrapper}>
          {/* Pulse ring */}
          <Animated.View
            style={[
              styles.trustPulseRing,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />

          {/* Avatar */}
          <View style={styles.trustAvatar}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDR-sTt2sFA5fAZLbFXDtnD847qBilIco7QPdgKGiLwQorm5mgOIeAWa5IlWeiB-tEy_uHTmBNWmVehTlJugtP4PEJIJFgQZwbzNFH1RhcSatUYD1t2ymo6HK2pCXcHOo5e2aP33f0lNR1hF4ykcjK_6JBh8-OLuygWYwQrFr2G95Ze9y49KMqDgvrY1O3aV5F0RhMHuV8FP5JPX-e21JZW1nkJCylgxySmatT8e5c_b_yUoytHZ4Iavg5WqHWDnxApzWON4rV3Pk8-',
              }}
              style={styles.trustAvatarImage}
              resizeMode="cover"
            />
          </View>

          {/* Verification Badge */}
          <View style={styles.trustVerifiedBadge}>
            <MaterialIcons name="verified" size={28} color={palette.onPrimary} />
          </View>
        </View>

        {/* Floating Trust Badges */}
        {trustBadges.map((badge, index) => (
          <Animated.View
            key={badge.label}
            style={[
              styles.trustBadge,
              badge.position as any,
              { transform: [{ translateY: floatAnims[index] }] },
            ]}
          >
            <MaterialIcons name={badge.icon} size={20} color={badge.color} />
            <Text style={styles.trustBadgeText}>{badge.label}</Text>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Content */}
      <View style={styles.trustContent}>
        <Animated.Text style={[styles.trustTitle, animatedStyle(1)]}>
          100% Safe & Verified Professionals
        </Animated.Text>

        <Animated.Text style={[styles.trustSubtitle, animatedStyle(2)]}>
          Every Zepair pro undergoes rigorous vetting, background checks, and
          skill assessments to ensure your peace of mind.
        </Animated.Text>
      </View>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Splash ────────────────────────────────────────────────────────────────
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashGlow1: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 0.1,
    right: -SCREEN_WIDTH * 0.1,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.1)',
    // Note: blur not natively supported; use @react-native-community/blur for prod
  },
  splashGlow2: {
    position: 'absolute',
    bottom: -SCREEN_HEIGHT * 0.05,
    left: -SCREEN_WIDTH * 0.05,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(6,182,212,0.2)',
  },
  splashCenter: {
    alignItems: 'center',
  },
  splashIconContainer: {
    width: 96,
    height: 96,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashIconGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    transform: [{ scale: 1.2 }],
  },
  splashIconInner: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  splashBrandName: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    color: palette.onPrimary,
    letterSpacing: -0.26,
    marginBottom: spacing.xs,
  },
  splashSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
  },
  splashProgressSection: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  splashProgressTrack: {
    width: 200,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  splashProgressFill: {
    height: '100%',
    backgroundColor: palette.onPrimary,
    borderRadius: 2,
  },
  splashVersionText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    color: palette.onPrimary,
    opacity: 0.4,
    letterSpacing: 2,
    marginTop: spacing.xs,
  },

  // ── Onboarding Container ──────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: palette.surfaceContainerLowest,
  },
  skipButton: {
    position: 'absolute',
    right: spacing.marginMobile,
    zIndex: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  skipButtonText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: palette.primaryContainer,
  },
  dotInactive: {
    width: 8,
    backgroundColor: palette.surfaceVariant,
  },
  primaryButtonContainer: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: palette.primaryContainer,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onPrimary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.gutter,
  },
  backButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
  },
  nextButtonContainer: {
    flex: 2,
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: palette.primaryContainer,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  nextButton: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Welcome Page ──────────────────────────────────────────────────────────
  welcomeContainer: {
    flex: 1,
  },
  heroImageContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.5,
    position: 'relative',
  },
  heroGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 128,
    zIndex: 1,
  },
  welcomeContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
  },
  welcomeTitle: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 34,
  },
  welcomeSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
  },

  // ── How It Works Page ─────────────────────────────────────────────────────
  howItWorksContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.marginMobile,
    position: 'relative',
  },
  brandLogo: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    color: palette.primary,
    letterSpacing: -0.26,
    marginBottom: spacing.xl,
  },
  stepsContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    width: '100%',
    maxWidth: 280,
  },
  stepCard: {
    width: 96,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: palette.surfaceContainerLowest,
  },
  stepCardInactive: {
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  stepCardActive: {
    borderWidth: 1,
    borderColor: `${palette.primary}33`,
    transform: [{ scale: 1.1 }],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  stepIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  stepLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.outline,
  },
  connectorLine: {
    width: 2,
    height: 24,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: palette.primary,
    marginVertical: spacing.xs,
  },
  howItWorksContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  howItWorksTitle: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    color: palette.onSurface,
    letterSpacing: -0.26,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  howItWorksSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
  },
  atmosphericGlowTopLeft: {
    position: 'absolute',
    top: -96,
    left: -96,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: `${palette.primary}0D`,
  },
  atmosphericGlowBottomRight: {
    position: 'absolute',
    bottom: -96,
    right: -96,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: `${palette.secondary}0D`,
  },

  // ── Trust & Safety Page ───────────────────────────────────────────────────
  trustContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.marginMobile,
  },
  trustIllustration: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: spacing.xl,
    maxWidth: 320,
  },
  trustBackgroundGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: `${palette.primaryContainer}1A`,
  },
  trustAvatarWrapper: {
    width: 192,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustPulseRing: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: `${palette.primary}1A`,
  },
  trustAvatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: palette.surfaceContainerLowest,
    overflow: 'hidden',
    backgroundColor: palette.surfaceContainer,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  trustAvatarImage: {
    width: '100%',
    height: '100%',
  },
  trustVerifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: palette.surfaceContainerLowest,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  trustBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  trustBadgeText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
  },
  trustContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  trustTitle: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    color: palette.onBackground,
    letterSpacing: -0.26,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
    lineHeight: 32,
  },
  trustSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
  },
});

// ─── Root Onboarding Flow ────────────────────────────────────────────────────

const OnboardingFlow = ({ onComplete }: { onComplete: () => void }) => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return <OnboardingScreen onComplete={onComplete} />;
};

export default OnboardingFlow;