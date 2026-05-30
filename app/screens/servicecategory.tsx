// screens/ServiceCategoryDetailScreen.tsx
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

// ─── Data ─────────────────────────────────────────────────────────────────────

const FILTERS = ['All', 'Repairs', 'Installation', 'Cleaning', 'Emergency'];

const SERVICES_DATA = [
  {
    id: '1',
    title: 'Full Basin Repair',
    description:
      'Fixing leaks, blockages, and faucet replacement for bathroom sinks.',
    duration: '45-60 min',
    price: '₹299 - ₹499',
    badge: 'Popular',
    badgeIcon: 'star',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCnnxvF-yBX1AGtQJQoJOl-Z5sY76AJrKiWur9ja6R7ig9y9TUThDkGml5RaFWE8yblDZKGSkFWc4Rj17puSaeCFLFx38kM4y7xKCLj8leemymOoQx5TjbBZGjchxzLHXUYFvrLIaVxBMXFifTbEWh6DUoma8diLWRlOKDvTX72REqNHux2S5iM5iS5lo2T-_VP9d1Du34LYekKsYEQmPNy7ChWWP3JBHbBGHhYB00myS4V0cYT0v48XXaCcQEGDsEb2oaFVPH8j4kY',
    isDurationHighlighted: true,
  },
  {
    id: '2',
    title: 'Jet Spray Installation',
    description: 'Standard installation of hand-held health faucet/jet spray.',
    duration: '30 min',
    price: '₹149 - ₹199',
    badge: null,
    badgeIcon: null,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBGRxKVZmvSPfbGCPkCiPqq3oGjeae2xw6yuRIUtb67XH_sHtQQhg0uC4qjsgfyIFWaHFcQdPNNZlqpNXudLqrN-I1jUuJJT0ct3E22V7Y0bT3sh6i2y8DynR2a78unmmx-u3UbxRamrV7Rak6vpbFm-rAzui74lCBsv7r_U0dtGFExbUMUO0CJ96mU_-d-Loh9z67n2kTsB8EOV3MQsyqVRmDNmjWsfdaAj77mOrE9TzdrEd2EJ5SLQY4C6h54j3D2buRSowmuZbKw',
    isDurationHighlighted: false,
  },
  {
    id: '3',
    title: 'Drainage Cleaning',
    description:
      'Complete removal of blockages in kitchen or bathroom drains.',
    duration: '20-40 min',
    price: '₹349 - ₹599',
    badge: 'Fastest',
    badgeIcon: 'bolt',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuABzFoyzbwtzB895elQrf3j8gOo8ANy67-VCc_TrD8oGhHsRNU-eWPH1_OBHi8SNpWn-qc0y3KfJCA2mSTQYAaf7sAKnkAaRx6Z0cW65gmWutO5Zigl9Pq1nw8MpElYBeYfHx2IKYYvp99kB6aHoerTxlifXctncgr-MCqOREAy5mOYBcvlEpZ11chi6ikUhibWIENSh-gBb_7U3uYVYx8MDyc9lYcPd8MMse4hAC9NxlRmXxvP3pxYrIUu-Ovlu7XHvk_XCa-LW6vS',
    isDurationHighlighted: true,
  },
  {
    id: '4',
    title: 'Water Meter Install',
    description:
      'Precision mounting and connection of digital or analog water meters.',
    duration: '90 min',
    price: '₹899',
    badge: null,
    badgeIcon: null,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBH6ZPo2J3Q_LqWg8rNC8rwUV-DUBuRD2iFZNuwRhE0Z_1iaJc26OI1nSWnlhlmsdSFcp3CQJUtx-LStEGqzsD9nUuubyxuS6WUABM_gHBvgq4LDfvPbasN__JZpZD1ZVvo7xVpl4yaeLX6u64T51ZIhCn75lC7X5VNxfx0GBOJ-B9vDIB6UI8l5tcvC9zKSh7ERN9RH-3C69VEe1M8IKO3cIKEfx9n7BRmCf9QB2TsxseesDi2uTt6kS6zcH-7jm62yQ1D9GKh8mrM',
    isDurationHighlighted: false,
  },
];

// ─── Cart State ───────────────────────────────────────────────────────────────

interface CartItem {
  id: string;
  title: string;
  price: string;
}

// ─── Service Card ─────────────────────────────────────────────────────────────

interface ServiceCardProps {
  item: (typeof SERVICES_DATA)[number];
  isAdded: boolean;
  onToggle: (id: string) => void;
  animValue: Animated.Value;
  slideValue: Animated.Value;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  item,
  isAdded,
  onToggle,
  animValue,
  slideValue,
}) => {
  const pressAnim = useRef(new Animated.Value(1)).current;
  const addBtnScale = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.spring(addBtnScale, {
        toValue: 0.85,
        useNativeDriver: true,
      }),
      Animated.spring(addBtnScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle(item.id);
  };

  return (
    <Animated.View
      style={[
        styles.serviceCard,
        {
          opacity: animValue,
          transform: [{ translateY: slideValue }, { scale: pressAnim }],
        },
      ]}
    >
      {/* Popular / Fastest Badge */}
      {item.badge && (
        <View style={styles.cardBadge}>
          <MaterialIcons
            name={item.badgeIcon as any}
            size={12}
            color="#4A3B00"
          />
          <Text style={styles.cardBadgeText}>{item.badge.toUpperCase()}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.serviceCardInner, item.badge && { marginTop: 12 }]}
        onPressIn={() =>
          Animated.spring(pressAnim, {
            toValue: 0.98,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(pressAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }).start()
        }
        activeOpacity={1}
      >
        {/* Content */}
        <View style={styles.serviceCardContent}>
          <Text style={styles.serviceCardTitle}>{item.title}</Text>
          <Text style={styles.serviceCardDesc}>{item.description}</Text>
          <View style={styles.serviceCardMeta}>
            <View style={styles.serviceCardDuration}>
              <MaterialIcons
                name="schedule"
                size={16}
                color={
                  item.isDurationHighlighted
                    ? palette.primary
                    : palette.outline
                }
              />
              <Text
                style={[
                  styles.serviceCardDurationText,
                  item.isDurationHighlighted && {
                    color: palette.primary,
                  },
                ]}
              >
                {item.duration}
              </Text>
            </View>
            <Text
              style={[
                styles.serviceCardPrice,
                item.isDurationHighlighted && { color: palette.primary },
              ]}
            >
              {item.price}
            </Text>
          </View>
        </View>

        {/* Image + Add Button */}
        <View style={styles.serviceCardImageWrapper}>
          <Image
            source={{ uri: item.image }}
            style={styles.serviceCardImage}
            resizeMode="cover"
          />
          <Animated.View
            style={[
              styles.addBtnWrapper,
              { transform: [{ scale: addBtnScale }] },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.addBtn,
                isAdded ? styles.addBtnFilled : styles.addBtnOutline,
              ]}
              onPress={handleToggle}
              activeOpacity={0.85}
            >
              <MaterialIcons
                name={isAdded ? 'check' : 'add'}
                size={18}
                color={isAdded ? palette.onPrimary : palette.primary}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Floating Cart Bar ────────────────────────────────────────────────────────

interface CartBarProps {
  count: number;
  totalPrice: string;
  onContinue: () => void;
  slideAnim: Animated.Value;
}

const CartBar: React.FC<CartBarProps> = ({
  count,
  totalPrice,
  onContinue,
  slideAnim,
}) => {
  const insets = useSafeAreaInsets();
  const ctaScale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View
      style={[
        styles.cartBar,
        {
          paddingBottom: insets.bottom + spacing.lg,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.cartBarInner}>
        <View style={styles.cartBarLeft}>
          <Text style={styles.cartBarCount}>
            {count} service{count !== 1 ? 's' : ''} selected
          </Text>
          <Text style={styles.cartBarPrice}>{totalPrice}</Text>
        </View>
        <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
          <TouchableOpacity
            style={styles.cartBarCta}
            onPress={onContinue}
            onPressIn={() =>
              Animated.spring(ctaScale, {
                toValue: 0.95,
                useNativeDriver: true,
              }).start()
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
            <Text style={styles.cartBarCtaText}>Continue</Text>
            <MaterialIcons name="chevron-right" size={20} color={palette.primary} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

interface ServiceCategoryDetailScreenProps {
  category?: string;
  onBack: () => void;
  onContinue: (cartItems: CartItem[]) => void;
}

const ServiceCategoryDetailScreen: React.FC<ServiceCategoryDetailScreenProps> = ({
  category = 'Plumbing Services',
  onBack,
  onContinue,
}) => {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All');
  const [cartItems, setCartItems] = useState<Set<string>>(new Set(['1']));
  const scrollY = useRef(new Animated.Value(0)).current;
  const cartBarSlide = useRef(new Animated.Value(0)).current;

  // Per-card animations
  const cardAnims = useRef(
    SERVICES_DATA.map(() => new Animated.Value(0))
  ).current;
  const cardSlideAnims = useRef(
    SERVICES_DATA.map(() => new Animated.Value(16))
  ).current;

  useEffect(() => {
    Animated.parallel(
      cardAnims.map((a, i) =>
        Animated.parallel([
          Animated.timing(a, {
            toValue: 1,
            duration: 450,
            delay: 300 + i * 80,
            useNativeDriver: true,
          }),
          Animated.timing(cardSlideAnims[i], {
            toValue: 0,
            duration: 450,
            delay: 300 + i * 80,
            useNativeDriver: true,
          }),
        ])
      )
    ).start();
  }, []);

  // Cart bar bounce when item added
  const animateCartPulse = () => {
    Animated.sequence([
      Animated.timing(cartBarSlide, {
        toValue: -8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(cartBarSlide, {
        toValue: 0,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleToggle = useCallback(
    (id: string) => {
      setCartItems((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
          animateCartPulse();
        }
        return next;
      });
    },
    []
  );

  // Header title opacity fades on scroll
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const selectedItems = SERVICES_DATA.filter((s) => cartItems.has(s.id));
  const totalCount = selectedItems.length;
  const totalPrice =
    totalCount > 0 ? `₹${299 * totalCount}` : '₹0';

  const CART_BAR_HEIGHT = 80 + insets.bottom + spacing.lg;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Gradient Header */}
      <LinearGradient
        colors={['#004ac6', '#2563eb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientHeader, { paddingTop: insets.top + spacing.sm }]}
      >
        {/* Decorative glow */}
        <View style={styles.headerGlow} />

        {/* Nav row */}
        <View style={styles.headerNavRow}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <MaterialIcons name="arrow-back" size={24} color={palette.onPrimary} />
          </TouchableOpacity>
          <View style={styles.headerRightBtns}>
            <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.8}>
              <MaterialIcons name="search" size={24} color={palette.onPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.8}>
              <MaterialIcons name="share" size={24} color={palette.onPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title block */}
        <Animated.View
          style={[styles.headerTitleBlock, { opacity: headerTitleOpacity }]}
        >
          <Text style={styles.headerTitle}>{category}</Text>
          <View style={styles.headerSubRow}>
            <MaterialIcons name="verified" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.headerSubtitle}>200+ professionals available</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Sticky Filter Chips */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Service Cards */}
      <Animated.ScrollView
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: CART_BAR_HEIGHT + spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {SERVICES_DATA.map((item, i) => (
          <ServiceCard
            key={item.id}
            item={item}
            isAdded={cartItems.has(item.id)}
            onToggle={handleToggle}
            animValue={cardAnims[i]}
            slideValue={cardSlideAnims[i]}
          />
        ))}
      </Animated.ScrollView>

      {/* Floating Cart Bar */}
      <CartBar
        count={totalCount}
        totalPrice={totalPrice}
        onContinue={() => onContinue(selectedItems as any)}
        slideAnim={cartBarSlide}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.surfaceBright,
  },

  // ── Gradient Header ───────────────────────────────────────────────────────
  gradientHeader: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  headerGlow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightBtns: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  headerTitleBlock: {
    gap: spacing.base,
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.onPrimary,
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  headerSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.85)',
  },

  // ── Filters ───────────────────────────────────────────────────────────────
  filtersContainer: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${palette.outlineVariant}4D`,
    backgroundColor: 'rgba(250,248,255,0.9)',
  },
  filtersScroll: {
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: 9999,
    backgroundColor: palette.surfaceContainerLow,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}80`,
  },
  filterChipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
    ...Platform.select({
      ios: {
        shadowColor: palette.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  filterChipText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: palette.onPrimary,
  },

  // ── Service Cards ─────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  serviceCard: {
    backgroundColor: palette.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}33`,
    overflow: 'visible',
    position: 'relative',
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
  cardBadge: {
    position: 'absolute',
    top: -14,
    left: 16,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    backgroundColor: '#FFD700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.base,
    borderRadius: 9999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  cardBadgeText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    color: '#4A3B00',
    letterSpacing: 0.5,
  },
  serviceCardInner: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  serviceCardContent: { flex: 1 },
  serviceCardTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
    marginBottom: spacing.base,
  },
  serviceCardDesc: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  serviceCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  serviceCardDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  serviceCardDurationText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.outline,
  },
  serviceCardPrice: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
  },
  serviceCardImageWrapper: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
    backgroundColor: palette.surfaceContainer,
  },
  serviceCardImage: {
    width: '100%',
    height: '100%',
  },
  addBtnWrapper: {
    position: 'absolute',
    bottom: spacing.base,
    right: spacing.base,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  addBtnFilled: {
    backgroundColor: palette.primary,
  },
  addBtnOutline: {
    backgroundColor: palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: palette.primary,
  },

  // ── Cart Bar ──────────────────────────────────────────────────────────────
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    backgroundColor: palette.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: `${palette.outlineVariant}4D`,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 12 },
    }),
  },
  cartBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.primaryContainer,
    padding: spacing.md,
    borderRadius: 12,
  },
  cartBarLeft: { gap: spacing.base },
  cartBarCount: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },
  cartBarPrice: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: palette.onPrimary,
  },
  cartBarCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.surfaceContainerLowest,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  cartBarCtaText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
  },
});

export default ServiceCategoryDetailScreen;