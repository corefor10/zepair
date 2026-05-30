// screens/ProfessionalProfileScreen.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme';

const { width: SW } = Dimensions.get('window');
const HERO_HEIGHT = 353;
const TAB_BAR_HEIGHT = 48;

// ─── Types ────────────────────────────────────────────────────────────────────

type TabName = 'Overview' | 'Reviews' | 'Portfolio' | 'Availability';

// ─── Static Data ─────────────────────────────────────────────────────────────

const TABS: TabName[] = ['Overview', 'Reviews', 'Portfolio', 'Availability'];

const STATS = [
  {
    id: 'rating',
    label: 'Rating',
    value: '4.9',
    icon: 'star' as const,
    color: palette.primary,
    hasIcon: true,
  },
  {
    id: 'jobs',
    label: 'Jobs Done',
    value: '1,240',
    icon: null,
    color: null,
    hasIcon: false,
  },
  {
    id: 'exp',
    label: 'Years Exp.',
    value: '8',
    icon: null,
    color: null,
    hasIcon: false,
  },
  {
    id: 'response',
    label: 'Response',
    value: '15 min',
    icon: 'bolt' as const,
    color: palette.tertiary,
    hasIcon: true,
  },
];

const SKILLS = [
  'Leak Repair',
  'Heater Installation',
  'Pipe Relining',
  'Emergency Clogs',
  'Eco-Fixtures',
];

const CERTIFICATIONS = [
  {
    id: 'c1',
    title: 'Licensed Master Plumber',
    subtitle: 'Reg #12948-MP-2023',
    icon: 'badge' as const,
    iconBg: `${palette.secondaryContainer}1A`,
    iconColor: palette.secondary,
  },
  {
    id: 'c2',
    title: 'Zepair Certified Professional',
    subtitle: 'Verified Background Check',
    icon: 'verified-user' as const,
    iconBg: `${palette.tertiaryContainer}1A`,
    iconColor: palette.tertiary,
  },
];

const PRICING_ROWS = [
  { service: 'General Consultation', price: '₹249' },
  { service: 'Leakage Fix (Major)', price: '₹899' },
  { service: 'Pipe Relining / Installation', price: '₹1,499' },
];

// ─── Floating Navigation ─────────────────────────────────────────────────────

interface FloatingNavProps {
  scrollY: Animated.Value;
  onBack: () => void;
  onShare: () => void;
  onFavorite: () => void;
  isFavorited: boolean;
}

const FloatingNav: React.FC<FloatingNavProps> = ({
  scrollY,
  onBack,
  onShare,
  onFavorite,
  isFavorited,
}) => {
  const insets = useSafeAreaInsets();

  const solidBgOpacity = scrollY.interpolate({
    inputRange: [HERO_HEIGHT - 100, HERO_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.floatingNav,
        { paddingTop: insets.top + spacing.md },
      ]}
    >
      {/* Solid background fades in on scroll */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.floatingNavBg,
          { opacity: solidBgOpacity },
        ]}
      />

      <TouchableOpacity
        style={styles.floatingIconBtn}
        onPress={onBack}
        activeOpacity={0.85}
      >
        <MaterialIcons name="arrow-back" size={22} color={palette.onPrimary} />
      </TouchableOpacity>

      <View style={styles.floatingRightGroup}>
        <TouchableOpacity
          style={styles.floatingIconBtn}
          onPress={onShare}
          activeOpacity={0.85}
        >
          <MaterialIcons name="share" size={22} color={palette.onPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.floatingIconBtn}
          onPress={onFavorite}
          activeOpacity={0.85}
        >
          <MaterialIcons
            name={isFavorited ? 'favorite' : 'favorite-border'}
            size={22}
            color={isFavorited ? '#ef4444' : palette.onPrimary}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

interface TabBarProps {
  activeTab: TabName;
  onSwitch: (tab: TabName) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onSwitch }) => {
  const indicatorAnim = useRef(
    new Animated.Value(TABS.indexOf(activeTab))
  ).current;

  const handleSwitch = (tab: TabName) => {
    const idx = TABS.indexOf(tab);
    Animated.timing(indicatorAnim, {
      toValue: idx,
      duration: 250,
      useNativeDriver: false,
    }).start();
    onSwitch(tab);
  };

  const tabWidth = SW / TABS.length;

  const indicatorLeft = indicatorAnim.interpolate({
    inputRange: TABS.map((_, i) => i),
    outputRange: TABS.map((_, i) => i * tabWidth),
  });

  return (
    <View style={styles.tabBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBarContent}
        scrollEnabled={false}
      >
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, { width: tabWidth }]}
              onPress={() => handleSwitch(tab)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {/* Sliding indicator */}
      <Animated.View
        style={[
          styles.tabIndicator,
          { width: tabWidth, left: indicatorLeft },
        ]}
      />
    </View>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  stat: (typeof STATS)[number];
  opacity: Animated.Value;
  translateY: Animated.Value;
}

const StatCard: React.FC<StatCardProps> = ({ stat, opacity, translateY }) => (
  <Animated.View
    style={[
      styles.statCard,
      { opacity, transform: [{ translateY }] },
    ]}
  >
    {stat.hasIcon ? (
      <View style={styles.statValueRow}>
        <MaterialIcons
          name={stat.icon as any}
          size={18}
          color={stat.color!}
        />
        <Text style={[styles.statValue, { color: stat.color! }]}>
          {stat.value}
        </Text>
      </View>
    ) : (
      <Text style={[styles.statValue, { color: palette.onSurface }]}>
        {stat.value}
      </Text>
    )}
    <Text style={styles.statLabel}>{stat.label}</Text>
  </Animated.View>
);

// ─── Certification Row ────────────────────────────────────────────────────────

const CertificationRow: React.FC<{
  cert: (typeof CERTIFICATIONS)[number];
}> = ({ cert }) => (
  <View style={styles.certRow}>
    <View style={[styles.certIconBox, { backgroundColor: cert.iconBg }]}>
      <MaterialIcons
        name={cert.icon as any}
        size={22}
        color={cert.iconColor}
      />
    </View>
    <View style={styles.certText}>
      <Text style={styles.certTitle}>{cert.title}</Text>
      <Text style={styles.certSubtitle}>{cert.subtitle}</Text>
    </View>
  </View>
);

// ─── Pricing Table ────────────────────────────────────────────────────────────

const PricingTable: React.FC = () => (
  <View style={styles.pricingTable}>
    {/* Header */}
    <View style={styles.pricingHeader}>
      <Text style={styles.pricingHeaderCell}>Service</Text>
      <Text style={[styles.pricingHeaderCell, styles.textRight]}>
        Starting from
      </Text>
    </View>
    {PRICING_ROWS.map((row, i) => (
      <View
        key={row.service}
        style={[
          styles.pricingRow,
          i < PRICING_ROWS.length - 1 && styles.pricingRowBorder,
        ]}
      >
        <Text style={styles.pricingLabel}>{row.service}</Text>
        <Text style={[styles.pricingPrice, styles.textRight]}>
          {row.price}
        </Text>
      </View>
    ))}
  </View>
);

// ─── Map Pulse ────────────────────────────────────────────────────────────────

const MapPulse: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.mapPulseWrapper}>
      <Animated.View
        style={[
          styles.mapPulseRing,
          { transform: [{ scale: pulseAnim }] },
        ]}
      />
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export interface ProfessionalProfileScreenProps {
  onBack: () => void;
  onBook: () => void;
  onShare?: () => void;
}

const ProfessionalProfileScreen: React.FC<ProfessionalProfileScreenProps> = ({
  onBack,
  onBook,
  onShare,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabName>('Overview');
  const [isFavorited, setIsFavorited] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Stagger animations for stat cards
  const statOpacities = useRef(STATS.map(() => new Animated.Value(0))).current;
  const statTranslates = useRef(
    STATS.map(() => new Animated.Value(20))
  ).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    // Content entrance
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered stat cards
    Animated.parallel(
      statOpacities.map((op, i) =>
        Animated.parallel([
          Animated.timing(op, {
            toValue: 1,
            duration: 400,
            delay: 400 + i * 80,
            useNativeDriver: true,
          }),
          Animated.timing(statTranslates[i], {
            toValue: 0,
            duration: 400,
            delay: 400 + i * 80,
            useNativeDriver: true,
          }),
        ])
      )
    ).start();
  }, []);

  // Book button press animation
  const bookBtnScale = useRef(new Animated.Value(1)).current;
  const handleBookPressIn = () =>
    Animated.spring(bookBtnScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  const handleBookPressOut = () =>
    Animated.spring(bookBtnScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

  const BOTTOM_BAR_HEIGHT = insets.bottom + 80;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Floating Nav (absolute, above scroll) */}
      <FloatingNav
        scrollY={scrollY}
        onBack={onBack}
        onShare={onShare ?? (() => {})}
        onFavorite={() => setIsFavorited((p) => !p)}
        isFavorited={isFavorited}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={{
          paddingBottom: BOTTOM_BAR_HEIGHT + spacing.xl,
        }}
        stickyHeaderIndices={[1]}
      >
        {/* ── 0: Hero ── */}
        <View style={styles.heroSection}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-TtKf5QhP8zsWheje3Swcz68eO1WrZMkCX4VyyaP7IVPinzxbrdJGkq1bCzE_u67owHFUefrPhwZm7Wj5yBN3sxaiEd-pfymH-atjcKpLxNhfXuH8M1nh7svjrcYrYVzYS1edCKCYX10wGtoD_UXrU79xAm7A1lCoCK1MVSQT5L3UxcKHhcYaI5yVl0iU9sWD7vbDn5jHsxsNZapJsDwcBTOeuaQlVjvWSRNTDJ214J6aK81cQymm5ffZfoGhyCYNgDNRCznlPzQ2',
            }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          {/* Dark gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.82)']}
            style={StyleSheet.absoluteFill}
          />
          {/* Profile info */}
          <View style={styles.heroContent}>
            {/* Avatar + verified badge */}
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSH6JYcGu3cXt3dDLTIVoArglUSuNqSBwwzX4L1wxgbTBjo2JzhaHbUdcx_uK1-_87iIXqYFlk2ibCD4D8XcbSORK88j0lJ-qtmulRg8lVe7Mp6KnB2DgSHRf-lR10x0QLBqWc44qGuJUzg9mJfv32qZTL-PLbLAqo5Xf4oZ5MaLdOnShYe40OFTXnKyaYqTI41AQPr7XwuuS8eMTI7PUZWmSIhjI97X_XD6LKPnzzWhJiy_bfTMWoA9pgYMQjG2NOSWeFwshzhcqQ',
                }}
                style={styles.heroAvatar}
                resizeMode="cover"
              />
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={12} color="#fff" />
              </View>
            </View>
            <Text style={styles.heroName}>Marcus Chen</Text>
            <Text style={styles.heroTitle}>EXPERT PLUMBER</Text>
          </View>
        </View>

        {/* ── 1: Sticky Tab Bar (stickyHeaderIndices={[1]}) ── */}
        <TabBar activeTab={activeTab} onSwitch={setActiveTab} />

        {/* ── 2: Main Scrollable Content ── */}
        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslate }],
            },
          ]}
        >
          {/* Stats Bento Grid */}
          <View style={styles.statsGrid}>
            {STATS.map((stat, i) => (
              <StatCard
                key={stat.id}
                stat={stat}
                opacity={statOpacities[i]}
                translateY={statTranslates[i]}
              />
            ))}
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bodyText}>
              Dedicated expert plumber with nearly a decade of experience in
              residential and commercial repairs. I specialize in complex
              diagnostics, leakage solutions, and eco-friendly fixture
              installations. My goal is to provide peace of mind through
              precise, long-lasting workmanship.
            </Text>
          </View>

          {/* Skills */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Expertise</Text>
            <View style={styles.skillsRow}>
              {SKILLS.map((skill) => (
                <View key={skill} style={styles.skillChip}>
                  <Text style={styles.skillChipText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Certifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications & Licenses</Text>
            <View style={styles.certList}>
              {CERTIFICATIONS.map((cert) => (
                <CertificationRow key={cert.id} cert={cert} />
              ))}
            </View>
          </View>

          {/* Service Areas */}
          <View style={styles.section}>
            <View style={styles.mapTitleRow}>
              <Text style={styles.sectionTitle}>Service Areas</Text>
              <Text style={styles.mapAreaChip}>Mumbai & Navi Mumbai</Text>
            </View>
            <View style={styles.mapContainer}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQX6pQZYxAf_ClfTO4MLhYfV-szEYcueV8jJgrKUc6PbYWR0mVO2XZ1tI6ogdH4MCf5Ub7ajCI1F0HPIg-giLEvC6ksWvDaM9wDc7NOdjTStr8m2owWpsSR7_sUJcatyuCvVIp9dpsgm5a2H86lvMyfcHf7PU9hw6DVxNBLgJtZfhGV7sHqcqSyob5tK_yU7doV6NpN9Fe6Gzou7EL27SceYOBTa4JYfWALU1GAyyajmhyaF9lAuloJjilCUV7V4lGHdXQoarr5nmV',
                }}
                style={[styles.mapImage, { opacity: 0.8 }]}
                resizeMode="cover"
              />
              {/* Primary tint overlay + pulse */}
              <View style={styles.mapOverlay}>
                <MapPulse />
              </View>
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            <PricingTable />
            <Text style={styles.pricingNote}>
              * Final quote provided after initial physical inspection.
            </Text>
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Sticky Booking Bar */}
      <View
        style={[
          styles.bookingBar,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <View>
          <Text style={styles.rateLabel}>Rate</Text>
          <Text style={styles.rateValue}>
            ₹249
            <Text style={styles.rateSuffix}> /hour</Text>
          </Text>
        </View>

        <Animated.View style={{ transform: [{ scale: bookBtnScale }] }}>
          <TouchableOpacity
            onPress={onBook}
            onPressIn={handleBookPressIn}
            onPressOut={handleBookPressOut}
            activeOpacity={1}
          >
            <LinearGradient
              colors={[palette.primary, palette.primaryContainer]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.bookNowBtn}
            >
              <Text style={styles.bookNowText}>Book Now</Text>
              <MaterialIcons
                name="calendar-today"
                size={20}
                color={palette.onPrimary}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },

  // ── Floating Nav ──────────────────────────────────────────────────────────
  floatingNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.md,
  },
  floatingNavBg: {
    backgroundColor: palette.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: `${palette.outlineVariant}33`,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  floatingIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingRightGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroSection: {
    height: HERO_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    marginBottom: spacing.md,
    position: 'relative',
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: palette.surfaceContainerLowest,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: palette.primaryContainer,
    borderWidth: 2,
    borderColor: palette.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroName: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.onPrimary,
    lineHeight: 32,
  },
  heroTitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // ── Tab Bar ───────────────────────────────────────────────────────────────
  tabBar: {
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.outlineVariant,
    zIndex: 40,
    position: 'relative',
  },
  tabBarContent: {
    flexDirection: 'row',
  },
  tab: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  tabTextActive: {
    color: palette.primary,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: palette.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  // ── Main Content ──────────────────────────────────────────────────────────
  mainContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: (SW - spacing.marginMobile * 2 - spacing.md) / 2,
    backgroundColor: palette.surfaceContainerLow,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.base,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
  },
  statLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
  },
  bodyText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
  },

  // ── Skills ────────────────────────────────────────────────────────────────
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  skillChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: palette.primaryFixed,
    borderRadius: 9999,
  },
  skillChipText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onPrimaryFixedVariant,
  },

  // ── Certifications ────────────────────────────────────────────────────────
  certList: {
    gap: spacing.md,
  },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    borderRadius: 12,
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
  certIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  certText: {},
  certTitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.onSurface,
  },
  certSubtitle: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
    marginTop: spacing.base,
  },

  // ── Map ───────────────────────────────────────────────────────────────────
  mapTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapAreaChip: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.primary,
  },
  mapContainer: {
    height: 192,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    position: 'relative',
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
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${palette.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPulseWrapper: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPulseRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${palette.primary}33`,
    borderWidth: 2,
    borderColor: palette.primary,
  },

  // ── Pricing Table ─────────────────────────────────────────────────────────
  pricingTable: {
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: palette.surfaceContainerLowest,
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
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: palette.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: palette.outlineVariant,
  },
  pricingHeaderCell: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  pricingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: palette.outlineVariant,
  },
  pricingLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurface,
  },
  pricingPrice: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: palette.onSurface,
  },
  pricingNote: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
    fontStyle: 'italic',
  },
  textRight: {
    textAlign: 'right',
  },

  // ── Booking Bar ───────────────────────────────────────────────────────────
  bookingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    backgroundColor: palette.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: palette.outlineVariant,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },
  rateLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
  },
  rateValue: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.26,
    color: palette.onSurface,
  },
  rateSuffix: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
  },
  bookNowBtn: {
    height: 52,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: 12,
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
  bookNowText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onPrimary,
  },
});

export default ProfessionalProfileScreen;