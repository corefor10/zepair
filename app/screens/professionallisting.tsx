// screens/ProfessionalListingScreen.tsx
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
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme';

const { width: SW } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────

const PROFESSIONALS = [
  {
    id: '1',
    name: 'Marcus Chen',
    title: 'Expert Plumber • 8 years exp.',
    distance: '2.4 km away',
    rating: '4.9',
    reviews: '128',
    price: '₹249',
    unit: '/hr',
    isAvailableNow: true,
    availability: 'Available Now',
    tags: [
      { label: 'Verified', bg: palette.primaryFixed, color: palette.onPrimaryFixedVariant },
      { label: 'Insured', bg: palette.surfaceContainer, color: palette.onSurfaceVariant },
      { label: 'Top Rated', bg: palette.secondaryFixed, color: palette.onSecondaryFixedVariant },
    ],
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCGlufdvfPC8xifKGqSJCEzjCqD_wDxxZsbeqGkI4erS5kdkWKqDtoCMVaWJrtxVGIHRljqbyWg-NF2J82yCmSJ6S3uLDyL2aRnh6UTBi94gg45rfGZ6ZC0raxIJpJB96xGp8CZ36d1LwewzuDmF31kaijVpOlwpZy5tR8g-dsjGj6_lx551pzIc-GgSrG9xYoF0JqK6LI-gHbfkxKdv63Uk4MI1alsyvlz0QcsA4hAoMI8N6Hx0sUVKtFdsYP1gSLwx4mOsyQ-7AIc',
  },
  {
    id: '2',
    name: 'Sarah Williams',
    title: 'Master Pipefitter • 6 years exp.',
    distance: '3.1 km away',
    rating: '4.8',
    reviews: '94',
    price: '₹299',
    unit: '/hr',
    isAvailableNow: false,
    availability: 'Next available: 2 PM',
    tags: [
      { label: 'Verified', bg: palette.primaryFixed, color: palette.onPrimaryFixedVariant },
      { label: 'Insured', bg: palette.surfaceContainer, color: palette.onSurfaceVariant },
    ],
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA6Sq5wmBo34-vRKUB8T9-GQ2ysAFZ5inpFQlpyDsnELa_TYnAprQUnEXFzboVLbD5WoJFHUccv666dCAamhU04ETnYqOdait3gW5NV-JyJ53mkzIXsO72Al0G6WztdwhWZC8fMAI9kdNmUtGPiAlXrPUGHAuzYE_r-YmZrHiG_aGa9jS9xitABm6BygLqtr1N6RJBBVr6rqSupAti5CzFxxsQoWbSoYF4EOdOarUakhAgcfWn6ljZYMpTS6q1Ol_8Lv5LSrx1ixsWZ',
  },
  {
    id: '3',
    name: 'Arjun Singh',
    title: 'Drainage Specialist • 10 years exp.',
    distance: '1.8 km away',
    rating: '4.7',
    reviews: '215',
    price: '₹199',
    unit: '/hr',
    isAvailableNow: true,
    availability: 'Available Now',
    tags: [
      { label: 'Verified', bg: palette.primaryFixed, color: palette.onPrimaryFixedVariant },
      { label: 'Top Rated', bg: palette.secondaryFixed, color: palette.onSecondaryFixedVariant },
    ],
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADhhOWEwGulu382DyYXWDuq8ilUR10i-AQhi5yd5J5g95_FHfyPizeH_-1smyfxaXHBZl9xwtJnduWdtVJ9hG6zPg7IxLk_tynfk0HDw8pYf99eIQbTV2CJCaocGY-0lJXOfch5qHaqs47wVYgmsau8qJbWVO7ZkknvK32XlMbLtvLPImjxH3DZ7nJb8-D1PyQAAx3DONPXr93t9r7HW1WmHRYl0aKNOuIdXTkjT5TG1kzj1NtA9AwQkkh2mxevxy7x3ZH12Da7WrY',
  },
];

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'services', label: 'Services', icon: 'build-circle' },
  { key: 'bookings', label: 'Bookings', icon: 'calendar-month' },
  { key: 'chat', label: 'Chat', icon: 'chat-bubble' },
  { key: 'profile', label: 'Profile', icon: 'person' },
] as const;

// ─── Online Pulse Dot ─────────────────────────────────────────────────────────

const PulseDot: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
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
  }, []);

  return (
    <View style={pdStyles.wrapper}>
      <Animated.View
        style={[pdStyles.ring, { transform: [{ scale: pulseAnim }] }]}
      />
      <View style={pdStyles.core} />
    </View>
  );
};

const pdStyles = StyleSheet.create({
  wrapper: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    opacity: 0.35,
  },
  core: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
});

// ─── Professional Card ────────────────────────────────────────────────────────

interface ProCardProps {
  item: (typeof PROFESSIONALS)[0];
  onViewProfile: () => void;
  onBookNow: () => void;
  opacity: Animated.Value;
  translateY: Animated.Value;
}

const ProfessionalCard: React.FC<ProCardProps> = ({
  item,
  onViewProfile,
  onBookNow,
  opacity,
  translateY,
}) => {
  const pressScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(pressScale, { toValue: 0.98, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View
      style={[
        cardStyles.card,
        {
          opacity,
          transform: [{ translateY }, { scale: pressScale }],
        },
      ]}
    >
      {/* Top row: avatar + identity + rating */}
      <View style={cardStyles.topRow}>
        {/* Avatar */}
        <View style={cardStyles.avatarWrapper}>
          <Image
            source={{ uri: item.avatar }}
            style={cardStyles.avatar}
            resizeMode="cover"
          />
          {item.isAvailableNow && (
            <View style={cardStyles.onlineDot}>
              <View style={cardStyles.onlineDotInner} />
            </View>
          )}
        </View>

        {/* Identity */}
        <View style={cardStyles.identity}>
          <View style={cardStyles.nameRow}>
            <Text style={cardStyles.name}>{item.name}</Text>
            <View style={cardStyles.ratingRow}>
              <MaterialIcons name="star" size={16} color="#f59e0b" />
              <Text style={cardStyles.rating}>{item.rating}</Text>
              <Text style={cardStyles.reviewCount}>({item.reviews})</Text>
            </View>
          </View>
          <Text style={cardStyles.title}>{item.title}</Text>
          <View style={cardStyles.distRow}>
            <MaterialIcons name="location-on" size={12} color={palette.primary} />
            <Text style={cardStyles.distance}>{item.distance}</Text>
          </View>
        </View>
      </View>

      {/* Tags + price */}
      <View style={cardStyles.tagsAndPrice}>
        <View style={cardStyles.tagsWrap}>
          {item.tags.map((t) => (
            <View
              key={t.label}
              style={[cardStyles.tag, { backgroundColor: t.bg }]}
            >
              <Text style={[cardStyles.tagText, { color: t.color }]}>
                {t.label}
              </Text>
            </View>
          ))}
        </View>
        <View style={cardStyles.priceBlock}>
          <Text style={cardStyles.price}>
            {item.price}
            <Text style={cardStyles.priceUnit}>{item.unit}</Text>
          </Text>
          {item.isAvailableNow ? (
            <View style={cardStyles.availRow}>
              <PulseDot />
              <Text style={cardStyles.availText}>Available Now</Text>
            </View>
          ) : (
            <Text style={cardStyles.nextAvail}>{item.availability}</Text>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={cardStyles.actionRow}>
        <TouchableOpacity
          style={cardStyles.profileBtn}
          onPress={onViewProfile}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <Text style={cardStyles.profileBtnText}>View Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={cardStyles.bookBtnWrapper}
          onPress={onBookNow}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#004ac6', '#2563eb', '#06b6d4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={cardStyles.bookBtn}
          >
            <Text style={cardStyles.bookBtnText}>Book Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    padding: spacing.md,
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
  topRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: palette.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  identity: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
  },
  name: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: palette.onSurface,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: palette.onSurface,
  },
  reviewCount: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
    marginBottom: spacing.base,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distance: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
  },
  tagsAndPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    flex: 1,
  },
  tag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.base,
    borderRadius: 9999,
  },
  tagText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  price: {
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: '700',
    color: palette.primary,
  },
  priceUnit: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    marginTop: 2,
  },
  availText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: '#10b981',
  },
  nextAvail: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  profileBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtnText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
  },
  bookBtnWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: palette.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  bookBtn: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  bookBtnText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onPrimary,
  },
});

// ─── Bottom Navigation ────────────────────────────────────────────────────────

const BottomNav: React.FC<{
  activeTab: string;
  onTabPress: (t: string) => void;
}> = ({ activeTab, onTabPress }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 4 }]}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === activeTab;
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
            <Text
              style={[styles.navLabel, isActive && styles.navLabelActive]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export interface ProfessionalListingScreenProps {
  category?: string;
  onBack: () => void;
  onViewProfile: (id: string) => void;
  onBookNow: (id: string) => void;
  onNavigate: (tab: string) => void;
  onOpenFilters: () => void;
}

const ProfessionalListingScreen: React.FC<ProfessionalListingScreenProps> = ({
  category = 'Plumbing Services',
  onBack,
  onViewProfile,
  onBookNow,
  onNavigate,
  onOpenFilters,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('services');
  const scrollY = useRef(new Animated.Value(0)).current;

  // Per-card stagger
  const cardOpacities = useRef(
    PROFESSIONALS.map(() => new Animated.Value(0))
  ).current;
  const cardTranslates = useRef(
    PROFESSIONALS.map(() => new Animated.Value(16))
  ).current;

  useEffect(() => {
    Animated.parallel(
      cardOpacities.map((op, i) =>
        Animated.parallel([
          Animated.timing(op, {
            toValue: 1,
            duration: 450,
            delay: 150 + i * 100,
            useNativeDriver: true,
          }),
          Animated.timing(cardTranslates[i], {
            toValue: 0,
            duration: 450,
            delay: 150 + i * 100,
            useNativeDriver: true,
          }),
        ])
      )
    ).start();
  }, []);

  // Header shadow
  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 0.1],
    extrapolate: 'clamp',
  });

  const BOTTOM_NAV_H = 64 + insets.bottom;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Sticky Header */}
      <Animated.View
        style={[
          styles.header,
          Platform.OS === 'ios' && { shadowOpacity: headerShadowOpacity },
        ]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={palette.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{category}</Text>
        </View>
        <TouchableOpacity
          onPress={onOpenFilters}
          style={styles.filterBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="tune"
            size={24}
            color={palette.onSurfaceVariant}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Sub-header */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderCount}>48 professionals found</Text>
        <TouchableOpacity style={styles.sortBtn} activeOpacity={0.8}>
          <Text style={styles.sortBtnText}>Sort by: Relevance</Text>
          <MaterialIcons name="expand-more" size={16} color={palette.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Listings */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: BOTTOM_NAV_H + spacing.xl },
        ]}
      >
        {PROFESSIONALS.map((pro, i) => (
          <ProfessionalCard
            key={pro.id}
            item={pro}
            onViewProfile={() => onViewProfile(pro.id)}
            onBookNow={() => onBookNow(pro.id)}
            opacity={cardOpacities[i]}
            translateY={cardTranslates[i]}
          />
        ))}

        {/* Load More */}
        <View style={styles.loadMoreWrapper}>
          <TouchableOpacity style={styles.loadMoreBtn} activeOpacity={0.8}>
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      {/* Bottom Nav */}
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
  screen: { flex: 1, backgroundColor: palette.background },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: palette.surface,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backBtn: { padding: spacing.base, marginLeft: -spacing.base },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.primary,
  },
  filterBtn: {
    padding: spacing.xs,
    borderRadius: 20,
  },

  // ── Sub-header ────────────────────────────────────────────────────────────
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.md,
    backgroundColor: palette.surfaceContainerLowest,
  },
  subHeaderCount: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: palette.surfaceContainerLow,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
  },
  sortBtnText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
  },

  // ── List ──────────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    gap: spacing.gutter,
  },
  loadMoreWrapper: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  loadMoreBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  loadMoreText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
  },

  // ── Bottom Nav ────────────────────────────────────────────────────────────
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: spacing.sm,
    backgroundColor: palette.surfaceContainerLowest,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderTopWidth: 1,
    borderTopColor: `${palette.outlineVariant}4D`,
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

export default ProfessionalListingScreen;