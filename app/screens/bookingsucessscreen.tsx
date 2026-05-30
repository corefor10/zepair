// screens/BookingSuccessScreen.tsx
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  StatusBar,
  ScrollView,
  Platform,
  Dimensions,
  Svg,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polyline, Circle, Path } from 'react-native-svg';
import { palette, spacing } from '../../theme_constant';

const { width: SW } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  {
    id: 'confirmed',
    label: 'Confirmed',
    subLabel: 'Your request has been received',
    status: 'done' as const,
  },
  {
    id: 'assigned',
    label: 'Assigned',
    subLabel: 'Professional is being matched',
    status: 'active' as const,
  },
  {
    id: 'enroute',
    label: 'En Route',
    subLabel: 'Awaiting professional departure',
    status: 'pending' as const,
  },
  {
    id: 'inprogress',
    label: 'In Progress',
    subLabel: '',
    status: 'inactive' as const,
  },
  {
    id: 'completed',
    label: 'Completed',
    subLabel: '',
    status: 'inactive' as const,
  },
] as const;

type TimelineStatus = (typeof TIMELINE_STEPS)[number]['status'];

const QUICK_ACTIONS = [
  { id: 'track', label: 'Track Pro', icon: 'near-me', isDestructive: false },
  { id: 'call', label: 'Call Alex', icon: 'call', isDestructive: false },
  { id: 'reschedule', label: 'Reschedule', icon: 'event-repeat', isDestructive: false },
  { id: 'cancel', label: 'Cancel', icon: 'close', isDestructive: true },
] as const;

// ─── Animated Check Icon ──────────────────────────────────────────────────────

const AnimatedCheckIcon: React.FC = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const [checkProgress, setCheckProgress] = useState(0);

  useEffect(() => {
    // Circle scale-in with bounce
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 60,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Animate the check stroke
    Animated.timing(checkAnim, {
      toValue: 1,
      duration: 400,
      delay: 600,
      useNativeDriver: false,
    }).start();

    checkAnim.addListener(({ value }) => setCheckProgress(value));
    return () => checkAnim.removeAllListeners();
  }, []);

  // Stroke dash: 100 total, animate offset from 100→0
  const strokeDashoffset = 100 - checkProgress * 100;

  return (
    <Animated.View
      style={[
        checkStyles.circle,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
        <Polyline
          points="20 6 9 17 4 12"
          stroke="#10b981"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="100"
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
    </Animated.View>
  );
};

const checkStyles = StyleSheet.create({
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
});

// ─── Timeline Step ────────────────────────────────────────────────────────────

const TimelineStep: React.FC<{
  step: (typeof TIMELINE_STEPS)[number];
  isLast: boolean;
  animValue: Animated.Value;
}> = ({ step, isLast, animValue }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (step.status === 'active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);

  const renderDot = () => {
    switch (step.status) {
      case 'done':
        return (
          <View style={tlStyles.dotDone}>
            <MaterialIcons name="check" size={14} color="#fff" />
          </View>
        );
      case 'active':
        return (
          <View style={tlStyles.dotActive}>
            <Animated.View
              style={[
                tlStyles.dotActivePulse,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <View style={tlStyles.dotActiveCore} />
          </View>
        );
      case 'pending':
        return (
          <View style={tlStyles.dotPending}>
            <View style={tlStyles.dotPendingInner} />
          </View>
        );
      default:
        return <View style={tlStyles.dotInactive} />;
    }
  };

  const isInactive = step.status === 'inactive';

  return (
    <Animated.View
      style={[
        tlStyles.stepRow,
        isInactive && tlStyles.stepInactive,
        { opacity: animValue },
      ]}
    >
      <View style={tlStyles.dotColumn}>
        {renderDot()}
        {!isLast && <View style={tlStyles.connector} />}
      </View>
      <View style={tlStyles.content}>
        <Text
          style={[
            tlStyles.label,
            step.status === 'done' && tlStyles.labelDone,
            step.status === 'active' && tlStyles.labelActive,
            (step.status === 'pending' || step.status === 'inactive') &&
              tlStyles.labelMuted,
          ]}
        >
          {step.label}
        </Text>
        {!!step.subLabel && (
          <Text style={tlStyles.subLabel}>{step.subLabel}</Text>
        )}
      </View>
    </Animated.View>
  );
};

const tlStyles = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepInactive: { opacity: 0.4 },
  dotColumn: {
    alignItems: 'center',
    width: 24,
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: palette.outlineVariant,
    marginTop: spacing.base,
    minHeight: 24,
  },
  dotDone: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dotActivePulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${palette.primary}33`,
  },
  dotActiveCore: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: palette.primary,
    borderWidth: 2,
    borderColor: palette.primaryContainer,
  },
  dotPending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotPendingInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.outline,
  },
  dotInactive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.surfaceContainerHigh,
  },
  content: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
  },
  labelDone: { color: '#10b981' },
  labelActive: { color: palette.primary },
  labelMuted: { color: palette.outline },
  subLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
    marginTop: spacing.base,
  },
});

// ─── Quick Action Button ──────────────────────────────────────────────────────

const QuickActionBtn: React.FC<{
  action: (typeof QUICK_ACTIONS)[number];
  onPress: () => void;
}> = ({ action, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View
      style={[
        qaStyles.wrapper,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[qaStyles.btn, action.isDestructive && qaStyles.btnDestructive]}
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true }).start()
        }
        onPressOut={() =>
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }).start()
        }
        activeOpacity={1}
      >
        <MaterialIcons
          name={action.icon as any}
          size={20}
          color={action.isDestructive ? palette.error : palette.primary}
        />
        <Text
          style={[
            qaStyles.label,
            action.isDestructive && qaStyles.labelDestructive,
          ]}
        >
          {action.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const qaStyles = StyleSheet.create({
  wrapper: { flex: 1 },
  btn: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
  },
  btnDestructive: {
    borderColor: `${palette.error}33`,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
  },
  labelDestructive: {
    color: palette.error,
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export interface BookingSuccessScreenProps {
  onBack: () => void;
  onViewDetails: () => void;
  onGoHome: () => void;
  onTrackPro?: () => void;
  onCallPro?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
}

const BookingSuccessScreen: React.FC<BookingSuccessScreenProps> = ({
  onBack,
  onViewDetails,
  onGoHome,
  onTrackPro,
  onCallPro,
  onReschedule,
  onCancel,
}) => {
  const insets = useSafeAreaInsets();

  // Staggered content animations
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(16)).current;
  const timelineOpacity = useRef(new Animated.Value(0)).current;
  const proCardOpacity = useRef(new Animated.Value(0)).current;
  const proCardSlide = useRef(new Animated.Value(16)).current;
  const detailsOpacity = useRef(new Animated.Value(0)).current;

  const stepAnims = useRef(
    TIMELINE_STEPS.map(() => new Animated.Value(0))
  ).current;

  const ctaScale = useRef(new Animated.Value(1)).current;
  const secondaryCtaScale = useRef(new Animated.Value(1)).current;

  // Ambient blobs
  const blob1Anim = useRef(new Animated.Value(0.5)).current;
  const blob2Anim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const seq = Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(heroOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(heroSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(timelineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ...stepAnims.map((a) =>
        Animated.timing(a, { toValue: 1, duration: 350, useNativeDriver: true })
      ),
      Animated.parallel([
        Animated.timing(proCardOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(proCardSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(detailsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]);
    seq.start();

    // Ambient blob pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob1Anim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(blob1Anim, { toValue: 0.5, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob2Anim, { toValue: 0.2, duration: 2500, useNativeDriver: true }),
        Animated.timing(blob2Anim, { toValue: 0.6, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const FOOTER_H = insets.bottom + 52 + 52 + spacing.sm + spacing.md * 2;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Ambient blobs */}
      <Animated.View style={[styles.blobTopRight, { opacity: blob1Anim }]} />
      <Animated.View style={[styles.blobBottomLeft, { opacity: blob2Anim }]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={palette.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Status</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: FOOTER_H },
        ]}
      >
        {/* Success Hero */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: heroOpacity,
              transform: [{ translateY: heroSlide }],
            },
          ]}
        >
          <AnimatedCheckIcon />
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Booking Confirmed! 🎉</Text>
            <Text style={styles.heroBookingId}>ID: #ZP-82941-2024</Text>
          </View>
        </Animated.View>

        {/* Timeline Tracker */}
        <Animated.View
          style={[styles.card, { opacity: timelineOpacity }]}
        >
          <Text style={styles.cardTitle}>Tracking Status</Text>
          <View style={styles.timelineList}>
            {TIMELINE_STEPS.map((step, i) => (
              <TimelineStep
                key={step.id}
                step={step}
                isLast={i === TIMELINE_STEPS.length - 1}
                animValue={stepAnims[i]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Professional Summary Card */}
        <Animated.View
          style={[
            styles.proCard,
            {
              opacity: proCardOpacity,
              transform: [{ translateY: proCardSlide }],
            },
          ]}
        >
          {/* Pro info row */}
          <View style={styles.proInfoRow}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9YHEN1NHGPsYf0Y-XTTTuNTnFhOl5Dy5xwplbKVdSfhq-YMeeI3bUgEU8_TUjEH9NQeaAwQkm1kl-3ope6ywpgnQm0ct98zkIpM9cFvC-cnoZ3ElckDEbjl5tm_hgvoM4e8J0TSzErTMX8nLFB6N7j-M1rmU_EWL-OQEZGGtvpnCJi7piJOFETSuPgbMfaJ3dQjjLhC_vrNeQTTA0tnF9o_3OPNHBXxKlkMfgf6fdOp7p_ZY7NcW81lVLhStk_tVUHfkcRqExlw-m',
              }}
              style={styles.proAvatar}
              resizeMode="cover"
            />
            <View style={styles.proDetails}>
              <Text style={styles.proName}>Alex Rivera</Text>
              <Text style={styles.proTitle}>Master Electrician • 4.9 ★</Text>
              <View style={styles.proTagsRow}>
                <View style={styles.proTagTopRated}>
                  <Text style={styles.proTagTopRatedText}>TOP RATED</Text>
                </View>
                <View style={styles.proTagVerified}>
                  <Text style={styles.proTagVerifiedText}>VERIFIED</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Date / Time strip */}
          <View style={styles.proDateStrip}>
            <View style={styles.proDateItem}>
              <MaterialIcons name="calendar-today" size={16} color={palette.primary} />
              <Text style={styles.proDateText}>Oct 24, 2024</Text>
            </View>
            <View style={styles.proDateItem}>
              <MaterialIcons name="schedule" size={16} color={palette.primary} />
              <Text style={styles.proDateText}>09:00 - 11:00 AM</Text>
            </View>
          </View>

          {/* Quick Actions Grid */}
          <View style={styles.actionsGrid}>
            <View style={styles.actionsRow}>
              <QuickActionBtn
                action={QUICK_ACTIONS[0]}
                onPress={onTrackPro ?? (() => {})}
              />
              <QuickActionBtn
                action={QUICK_ACTIONS[1]}
                onPress={onCallPro ?? (() => {})}
              />
            </View>
            <View style={styles.actionsRow}>
              <QuickActionBtn
                action={QUICK_ACTIONS[2]}
                onPress={onReschedule ?? (() => {})}
              />
              <QuickActionBtn
                action={QUICK_ACTIONS[3]}
                onPress={onCancel ?? (() => {})}
              />
            </View>
          </View>
        </Animated.View>

        {/* Booking Details Bento */}
        <Animated.View style={[styles.detailsSection, { opacity: detailsOpacity }]}>
          {/* Total */}
          <TouchableOpacity style={styles.detailCard} activeOpacity={0.85}>
            <View style={styles.detailCardLeft}>
              <View
                style={[
                  styles.detailIconBox,
                  { backgroundColor: palette.secondaryFixed },
                ]}
              >
                <MaterialIcons
                  name="receipt-long"
                  size={22}
                  color={palette.onSecondaryFixedVariant}
                />
              </View>
              <View>
                <Text style={styles.detailLabel}>Total Estimated</Text>
                <Text style={styles.detailValue}>$124.50</Text>
              </View>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={palette.onSurfaceVariant}
            />
          </TouchableOpacity>

          {/* Address */}
          <View style={styles.detailCard}>
            <View style={styles.detailCardLeft}>
              <View
                style={[
                  styles.detailIconBox,
                  { backgroundColor: palette.tertiaryFixed },
                ]}
              >
                <MaterialIcons
                  name="location-on"
                  size={22}
                  color={palette.onTertiaryFixedVariant}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Service Address</Text>
                <Text style={styles.detailSubLabel}>
                  742 Evergreen Terrace, Springfield
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Fixed Footer */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        {/* View Details */}
        <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
          <TouchableOpacity
            onPress={onViewDetails}
            onPressIn={() =>
              Animated.spring(ctaScale, { toValue: 0.97, useNativeDriver: true }).start()
            }
            onPressOut={() =>
              Animated.spring(ctaScale, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
              }).start()
            }
            activeOpacity={1}
          >
            <LinearGradient
              colors={[palette.primary, palette.primaryContainer]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.primaryCta}
            >
              <MaterialIcons name="visibility" size={20} color={palette.onPrimary} />
              <Text style={styles.primaryCtaText}>View Booking Details</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Go Home */}
        <Animated.View style={{ transform: [{ scale: secondaryCtaScale }] }}>
          <TouchableOpacity
            style={styles.secondaryCta}
            onPress={onGoHome}
            onPressIn={() =>
              Animated.spring(secondaryCtaScale, { toValue: 0.97, useNativeDriver: true }).start()
            }
            onPressOut={() =>
              Animated.spring(secondaryCtaScale, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
              }).start()
            }
            activeOpacity={1}
          >
            <Text style={styles.secondaryCtaText}>Go to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },

  // Ambient blobs
  blobTopRight: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `${palette.primary}0D`,
    zIndex: 0,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: '10%',
    left: '-10%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: `${palette.secondary}0D`,
    zIndex: 0,
  },

  // Header
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: `${palette.outlineVariant}33`,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.primary,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    gap: spacing.md,
  },
  heroText: { alignItems: 'center', gap: spacing.base },
  heroTitle: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.onSurface,
    textAlign: 'center',
  },
  heroBookingId: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
  },

  // Card
  card: {
    backgroundColor: palette.surfaceContainerLowest,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
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
  cardTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
    marginBottom: spacing.md,
  },
  timelineList: { gap: 0 },

  // Pro Card
  proCard: {
    backgroundColor: palette.surfaceContainerLowest,
    borderRadius: 12,
    overflow: 'hidden',
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
  proInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  proAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: palette.primaryFixed,
  },
  proDetails: { flex: 1 },
  proName: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
  },
  proTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
    marginTop: spacing.base,
  },
  proTagsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  proTagTopRated: {
    backgroundColor: palette.primaryFixed,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  proTagTopRatedText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: palette.onPrimaryFixedVariant,
  },
  proTagVerified: {
    backgroundColor: palette.surfaceContainerHigh,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  proTagVerifiedText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: palette.onSurfaceVariant,
  },
  proDateStrip: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: palette.surfaceContainerLow,
  },
  proDateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  proDateText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurface,
  },
  actionsGrid: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // Details
  detailsSection: { gap: spacing.md },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: palette.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
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
  detailCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  detailIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
  },
  detailValue: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
    color: palette.primary,
    marginTop: spacing.base,
  },
  detailSubLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
    marginTop: spacing.base,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    backgroundColor: palette.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: `${palette.outlineVariant}4D`,
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  primaryCta: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: palette.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  primaryCtaText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onPrimary,
  },
  secondaryCta: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryCtaText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
  },
});

export default BookingSuccessScreen;