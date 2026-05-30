// screens/HomeDashboardScrolledScreen.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  StatusBar,
  ScrollView,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme_constant';

const { width: SW } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────

const RECENT_BOOKINGS = [
  {
    id: '1',
    title: 'AC Deep Cleaning',
    date: '12 Oct • $45.00',
    status: 'Completed',
    icon: 'ac-unit',
    iconBg: `${palette.primaryContainer}1A`,
    iconColor: palette.primary,
    statusBg: `${palette.primaryContainer}1A`,
    statusColor: palette.primary,
  },
  {
    id: '2',
    title: 'Faucet Repair',
    date: '28 Sep • $29.00',
    status: 'Last Month',
    icon: 'plumbing',
    iconBg: `${palette.tertiaryContainer}1A`,
    iconColor: palette.tertiary,
    statusBg: palette.surfaceContainerHigh,
    statusColor: palette.outline,
  },
];

const TESTIMONIALS = [
  {
    id: '1',
    quote:
      '"Zepair saved my weekend. The electrician arrived in 30 minutes and fixed everything perfectly."',
    name: 'Sarah Jenkins',
    location: 'Brooklyn, NY',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDsplY2OqRQL2O-GCTIum33pMdKOmXYcjwznFFxRAn0oCgr0kkNE0s6rhOo0er6DGdSW-jRZ7-wcYtaCJ83gb7AZmZQzco1PQ6CVuNpTXruPnAOJN01QFtkrDeDecNfkX1i4vxpahCqguiFJQXgmUmRhqmByx58LBdlo_O-4F9Je0Ej_P7rqv9g_TEoTDnuQJ2nOUjrXyQXbZBNKbdG7pLTXGdERp-sVaO8bpdg5yV0Rkd35679N4m7mjyJ68BWR55R-o28H33R1-bl',
  },
  {
    id: '2',
    quote:
      '"Transparent pricing and professional staff. I\'ve switched all my home maintenance to them."',
    name: 'Michael Chen',
    location: 'Downtown Loft',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ_CnnC5wVosOq_kODxFUwaWOts5xJ5o9x5kkP_KJ76r9Esze-9NMYshplW5-zlfVJ6_NdVsK5CusT_ycof4fQ3WZgkIHfW6EV5Nxeukyj0hXSbiQfKCBanB0sdVGqM-Xxrf8q1Z1FFut6cFS7biTovQvzh9bwEiTG6rTW2oCBefcQbG5QXL0itiypjVm_r9sqyhnH8dFuG06Ne34UuAftD3974EduyTopa-rrHzrQ0VBsUZ64n_S0yYYYnJ99ApEvA0mjXy6PWrY1',
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    icon: 'search',
    title: 'Pick a Service',
    body: 'Choose from 50+ repair and maintenance categories for your home.',
  },
  {
    icon: 'event-available',
    title: 'Select a Time',
    body: 'Schedule a professional visit that fits your busy lifestyle perfectly.',
  },
  {
    icon: 'verified-user',
    title: 'Relax & Enjoy',
    body: 'Our certified experts handle the rest with a 30-day service warranty.',
  },
];

const RECOMMENDED_SERVICES = [
  {
    icon: 'pest-control',
    title: 'Pest Control',
    sub: 'Ideal for 2BHK',
  },
  {
    icon: 'cleaning-services',
    title: 'Kitchen Cleaning',
    sub: 'Standard Plan',
  },
];

// ─── Bottom Navigation ────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'services', label: 'Services', icon: 'build' },
  { key: 'bookings', label: 'Bookings', icon: 'event-note' },
  { key: 'chat', label: 'Chat', icon: 'chat' },
  { key: 'profile', label: 'Profile', icon: 'person' },
] as const;

const BottomNav: React.FC<{
  activeTab: string;
  onTabPress: (t: string) => void;
}> = ({ activeTab, onTabPress }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 4 }]}>
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={() => onTabPress(item.key)}
            activeOpacity={0.75}
          >
            <MaterialIcons
              name={item.icon as any}
              size={24}
              color={isActive ? palette.primary : palette.onSurfaceVariant}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Sticky Header (scrolled state) ──────────────────────────────────────────

interface StickyHeaderProps {
  shadowAnim: Animated.Value;
  onNotifications: () => void;
}

const StickyHeader: React.FC<StickyHeaderProps> = ({
  shadowAnim,
  onNotifications,
}) => {
  const insets = useSafeAreaInsets();

  const shadowOpacity = shadowAnim.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.stickyHeader,
        { paddingTop: insets.top + spacing.xs },
        {
          shadowOpacity: Platform.OS === 'ios' ? shadowOpacity : undefined,
          elevation: Platform.OS === 'android' ? 4 : undefined,
        },
      ]}
    >
      <View style={styles.stickyHeaderRow}>
        <Text style={styles.stickyLogo}>Zepair</Text>
        <View style={styles.stickyActions}>
          <TouchableOpacity
            onPress={onNotifications}
            style={styles.stickyIconBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="notifications"
              size={24}
              color={palette.onSurfaceVariant}
            />
          </TouchableOpacity>
          <View style={styles.stickyAvatar}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFUN4myC4z267-TTw94J2K0szsoB7bul4eN6XKDule9ORQ8QYzgKGj1GPbT544QyB7u9CrptE2wOwnaijS3voj2ZjbWKFj_bJH2vjwd79ecd2kY2St1rVWWNeROvuLyYYiWrmesaEOXf703h6gk0079yHG21kE8rzrHMwxrWy-hMM87tuScYYCTN4DAQ0lx0b0PGkl45qN9uAyhd8PwqRD3tyNb1o6MkWrThYR3Iazj-UZCapkOj32D2C6IcHhgPe6alxvk2g5RLBg',
              }}
              style={styles.stickyAvatarImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      {/* Integrated Search */}
      <View style={styles.stickySearch}>
        <MaterialIcons
          name="search"
          size={20}
          color={palette.outline}
          style={{ marginRight: spacing.sm }}
        />
        <TextInput
          style={styles.stickySearchInput}
          placeholder="Search home repairs..."
          placeholderTextColor={palette.onSurfaceVariant}
        />
      </View>
    </Animated.View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

interface HomeDashboardScrolledProps {
  onNotifications: () => void;
  onNavigate: (tab: string) => void;
  onViewAll: () => void;
}

const HomeDashboardScrolledScreen: React.FC<HomeDashboardScrolledProps> = ({
  onNotifications,
  onNavigate,
  onViewAll,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('home');
  const scrollY = useRef(new Animated.Value(0)).current;

  const HEADER_HEIGHT = 110 + insets.top;
  const BOTTOM_NAV_HEIGHT = 64 + insets.bottom;

  // Section entrance anims
  const sectionAnims = useRef(
    [0, 1, 2, 3, 4].map(() => new Animated.Value(0))
  ).current;
  const sectionSlideAnims = useRef(
    [0, 1, 2, 3, 4].map(() => new Animated.Value(16))
  ).current;

  useEffect(() => {
    Animated.parallel(
      sectionAnims.map((a, i) =>
        Animated.parallel([
          Animated.timing(a, {
            toValue: 1,
            duration: 500,
            delay: 150 + i * 100,
            useNativeDriver: true,
          }),
          Animated.timing(sectionSlideAnims[i], {
            toValue: 0,
            duration: 500,
            delay: 150 + i * 100,
            useNativeDriver: true,
          }),
        ])
      )
    ).start();
  }, []);

  const aStyle = (i: number) => ({
    opacity: sectionAnims[Math.min(i, sectionAnims.length - 1)],
    transform: [
      { translateY: sectionSlideAnims[Math.min(i, sectionSlideAnims.length - 1)] },
    ],
  });

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Sticky Header */}
      <StickyHeader shadowAnim={scrollY} onNotifications={onNotifications} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: HEADER_HEIGHT,
            paddingBottom: BOTTOM_NAV_HEIGHT + spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Recently Booked */}
        <Animated.View style={[styles.section, aStyle(0)]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Booked</Text>
            <TouchableOpacity onPress={onViewAll}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentScroll}
          >
            {RECENT_BOOKINGS.map((booking) => (
              <View key={booking.id} style={styles.recentCard}>
                <View style={styles.recentCardTop}>
                  <View
                    style={[
                      styles.recentIconBox,
                      { backgroundColor: booking.iconBg },
                    ]}
                  >
                    <MaterialIcons
                      name={booking.icon as any}
                      size={20}
                      color={booking.iconColor}
                    />
                  </View>
                  <View
                    style={[
                      styles.recentStatusBadge,
                      { backgroundColor: booking.statusBg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.recentStatusText,
                        { color: booking.statusColor },
                      ]}
                    >
                      {booking.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recentTitle}>{booking.title}</Text>
                <Text style={styles.recentDate}>{booking.date}</Text>
                <TouchableOpacity style={styles.bookAgainBtn} activeOpacity={0.85}>
                  <Text style={styles.bookAgainText}>Book Again</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Based on Your Home */}
        <Animated.View style={[styles.section, aStyle(1)]}>
          <View style={styles.homeRecommendCard}>
            {/* Decorative glow */}
            <View style={styles.homeRecommendGlow} />
            <View style={styles.homeRecommendTop}>
              <MaterialIcons
                name="home"
                size={16}
                color={palette.primary}
              />
              <Text style={styles.homeRecommendLabel}>
                YOUR HOME: 2BHK SETUP
              </Text>
            </View>
            <Text style={styles.homeRecommendTitle}>
              Recommended for your space
            </Text>
            <View style={styles.homeRecommendGrid}>
              {RECOMMENDED_SERVICES.map((svc) => (
                <TouchableOpacity
                  key={svc.title}
                  style={styles.homeRecommendItem}
                  activeOpacity={0.85}
                >
                  <MaterialIcons
                    name={svc.icon as any}
                    size={24}
                    color={palette.primary}
                  />
                  <Text style={styles.homeRecommendItemTitle}>{svc.title}</Text>
                  <Text style={styles.homeRecommendItemSub}>{svc.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Testimonials */}
        <Animated.View style={[styles.section, aStyle(2)]}>
          <Text style={styles.sectionTitle}>What our users say</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialsScroll}
            style={styles.testimonialsScrollView}
          >
            {TESTIMONIALS.map((t) => (
              <View key={t.id} style={styles.testimonialCard}>
                {/* Stars */}
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <MaterialIcons
                      key={s}
                      name="star"
                      size={16}
                      color="#f59e0b"
                    />
                  ))}
                </View>
                <Text style={styles.testimonialQuote}>{t.quote}</Text>
                <View style={styles.testimonialAuthor}>
                  <Image
                    source={{ uri: t.avatar }}
                    style={styles.testimonialAvatar}
                    resizeMode="cover"
                  />
                  <View>
                    <Text style={styles.testimonialName}>{t.name}</Text>
                    <Text style={styles.testimonialLocation}>{t.location}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* How It Works */}
        <Animated.View style={[styles.section, aStyle(3)]}>
          <Text style={[styles.sectionTitle, styles.centeredTitle]}>
            How it works
          </Text>
          <View style={styles.stepsContainer}>
            {/* Connector line */}
            <LinearGradient
              colors={[`${palette.primary}4D`, `${palette.primary}0D`]}
              style={styles.connectorLine}
            />

            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <View key={step.title} style={styles.stepRow}>
                <View style={styles.stepIconCircle}>
                  <MaterialIcons
                    name={step.icon as any}
                    size={24}
                    color={palette.onPrimary}
                  />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepBody}>{step.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Premium Care Bento Card */}
        <Animated.View style={[styles.section, aStyle(4)]}>
          <View style={styles.premiumCard}>
            <View style={styles.premiumCardContent}>
              <Text style={styles.premiumTitle}>Premium Care</Text>
              <Text style={styles.premiumBody}>
                Your home deserves the best precision and engineering. Zepair
                delivers exactly that.
              </Text>
            </View>
            {/* Decorative icon */}
            <View style={styles.premiumDecoIcon}>
              <MaterialIcons
                name="build-circle"
                size={160}
                color="rgba(255,255,255,0.1)"
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          onNavigate(tab);
        }}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },

  // ── Sticky Header ─────────────────────────────────────────────────────────
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: palette.surfaceContainerLowest,
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: `${palette.outlineVariant}33`,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  stickyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
  },
  stickyLogo: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    color: palette.primary,
    letterSpacing: -0.26,
  },
  stickyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stickyIconBtn: {
    padding: spacing.xs,
  },
  stickyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
    backgroundColor: palette.surfaceContainerHigh,
  },
  stickyAvatarImage: {
    width: '100%',
    height: '100%',
  },
  stickySearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}33`,
    marginTop: spacing.xs,
  },
  stickySearchInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
    paddingVertical: 0,
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.xl,
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
    marginBottom: spacing.md,
  },
  centeredTitle: {
    textAlign: 'center',
  },
  viewAllText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
  },

  // ── Recent Bookings ───────────────────────────────────────────────────────
  recentScroll: {
    gap: spacing.md,
  },
  recentCard: {
    width: 200,
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
  recentCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  recentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  recentStatusText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
  },
  recentTitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
    marginBottom: spacing.xs,
  },
  recentDate: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.outline,
    marginBottom: spacing.md,
  },
  bookAgainBtn: {
    backgroundColor: palette.primary,
    paddingVertical: spacing.xs,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookAgainText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onPrimary,
  },

  // ── Home Recommend ────────────────────────────────────────────────────────
  homeRecommendCard: {
    backgroundColor: `${palette.primaryContainer}0D`,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: `${palette.primary}1A`,
    overflow: 'hidden',
    position: 'relative',
  },
  homeRecommendGlow: {
    position: 'absolute',
    bottom: -32,
    right: -32,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: `${palette.primary}0D`,
  },
  homeRecommendTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  homeRecommendLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
    color: palette.primary,
    textTransform: 'uppercase',
  },
  homeRecommendTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
    marginBottom: spacing.md,
    lineHeight: 26,
  },
  homeRecommendGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  homeRecommendItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    padding: spacing.sm,
    gap: spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  homeRecommendItemTitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
  },
  homeRecommendItemSub: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.outline,
  },

  // ── Testimonials ──────────────────────────────────────────────────────────
  testimonialsScrollView: {
    marginHorizontal: -spacing.marginMobile,
  },
  testimonialsScroll: {
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.md,
  },
  testimonialCard: {
    width: 280,
    backgroundColor: palette.surfaceContainerLowest,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}33`,
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
  starsRow: {
    flexDirection: 'row',
    gap: spacing.base,
    marginBottom: spacing.sm,
  },
  testimonialQuote: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
  },
  testimonialName: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
  },
  testimonialLocation: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.outline,
  },

  // ── How It Works ──────────────────────────────────────────────────────────
  stepsContainer: {
    position: 'relative',
    gap: spacing.xl,
  },
  connectorLine: {
    position: 'absolute',
    left: 23,
    top: 24,
    bottom: 24,
    width: 2,
    zIndex: 0,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
    zIndex: 1,
  },
  stepIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...Platform.select({
      ios: {
        shadowColor: palette.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  stepContent: { flex: 1, paddingTop: spacing.xs },
  stepTitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.onSurface,
    marginBottom: spacing.base,
  },
  stepBody: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
  },

  // ── Premium Card ──────────────────────────────────────────────────────────
  premiumCard: {
    backgroundColor: palette.inverseSurface,
    borderRadius: 16,
    padding: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  premiumCardContent: {
    position: 'relative',
    zIndex: 1,
  },
  premiumTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.inverseOnSurface,
    marginBottom: spacing.sm,
  },
  premiumBody: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.outlineVariant,
    marginBottom: spacing.lg,
  },
  premiumDecoIcon: {
    position: 'absolute',
    right: -16,
    top: spacing.base,
    transform: [{ rotate: '12deg' }],
  },

  // ── Bottom Nav ────────────────────────────────────────────────────────────
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: spacing.sm,
    backgroundColor: palette.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: `${palette.outlineVariant}4D`,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.base,
    paddingVertical: spacing.base,
  },
  navItemActive: {
    backgroundColor: `${palette.primaryContainer}1A`,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
  },
  navLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
  },
  navLabelActive: {
    color: palette.primary,
    fontWeight: '700',
  },
});

export default HomeDashboardScrolledScreen;