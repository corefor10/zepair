// screens/AllServicesScreen.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme';

const { width: SW } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Plumbing', 'Cleaning', 'Electrical', 'AC Repair', 'Painting'];

const SERVICES = [
  {
    key: 'plumbing',
    name: 'Plumbing',
    count: '12 Services',
    price: 'From ₹149',
    gradientColors: ['#004ac6', '#6b38d4'],
    icon: 'plumbing',
    badge: 'Popular',
    badgeBg: palette.tertiaryContainer,
    badgeColor: palette.onTertiaryContainer,
  },
  {
    key: 'ac',
    name: 'AC Services',
    count: '8 Services',
    price: 'From ₹499',
    gradientColors: ['#06b6d4', '#2563eb'],
    icon: 'ac-unit',
    badge: null,
    badgeBg: null,
    badgeColor: null,
  },
  {
    key: 'cleaning',
    name: 'Cleaning',
    count: '24 Services',
    price: 'From ₹299',
    gradientColors: ['#10b981', '#0d9488'],
    icon: 'cleaning-services',
    badge: 'Fast',
    badgeBg: palette.surfaceContainerHigh,
    badgeColor: palette.onSurfaceVariant,
  },
  {
    key: 'electrical',
    name: 'Electrical',
    count: '15 Services',
    price: 'From ₹199',
    gradientColors: ['#f59e0b', '#f97316'],
    icon: 'electric-bolt',
    badge: null,
    badgeBg: null,
    badgeColor: null,
  },
  {
    key: 'painting',
    name: 'Painting',
    count: '5 Services',
    price: 'From ₹999',
    gradientColors: ['#ec4899', '#e11d48'],
    icon: 'format-paint',
    badge: null,
    badgeBg: null,
    badgeColor: null,
  },
  {
    key: 'appliances',
    name: 'Appliances',
    count: '18 Services',
    price: 'From ₹249',
    gradientColors: ['#6366f1', '#1d4ed8'],
    icon: 'kitchen',
    badge: null,
    badgeBg: null,
    badgeColor: null,
  },
  {
    key: 'pest',
    name: 'Pest Control',
    count: '6 Services',
    price: 'From ₹599',
    gradientColors: ['#795548', '#5d4037'],
    icon: 'pest-control',
    badge: null,
    badgeBg: null,
    badgeColor: null,
  },
  {
    key: 'carpentry',
    name: 'Carpentry',
    count: '10 Services',
    price: 'From ₹199',
    gradientColors: ['#ca8a04', '#92400e'],
    icon: 'carpenter',
    badge: null,
    badgeBg: null,
    badgeColor: null,
  },
  {
    key: 'gardening',
    name: 'Gardening',
    count: '4 Services',
    price: 'From ₹299',
    gradientColors: ['#4ade80', '#059669'],
    icon: 'yard',
    badge: null,
    badgeBg: null,
    badgeColor: null,
  },
] as const;


// ─── Service Row ─────────────────────────────────────────────────────────────

const ServiceRow: React.FC<{
  service: (typeof SERVICES)[number];
  onPress: () => void;
  index: number;
  animValue: Animated.Value;
  slideValue: Animated.Value;
}> = ({ service, onPress, animValue, slideValue }) => {
  const pressAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View
      style={{
        opacity: animValue,
        transform: [{ translateY: slideValue }, { scale: pressAnim }],
      }}
    >
      <TouchableOpacity
        style={styles.serviceRow}
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(pressAnim, {
            toValue: 0.97,
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
        {/* Icon Box */}
        <LinearGradient
          colors={service.gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.serviceRowIcon}
        >
          <MaterialIcons
            name={service.icon as any}
            size={32}
            color={palette.onPrimary}
          />
        </LinearGradient>

        {/* Content */}
        <View style={styles.serviceRowContent}>
          <View style={styles.serviceRowTitleRow}>
            <Text style={styles.serviceRowName}>{service.name}</Text>
            {service.badge && (
              <View
                style={[
                  styles.serviceBadge,
                  { backgroundColor: service.badgeBg! },
                ]}
              >
                <Text
                  style={[
                    styles.serviceBadgeText,
                    { color: service.badgeColor! },
                  ]}
                >
                  {service.badge.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.serviceRowMeta}>
            <Text style={styles.serviceRowCount}>{service.count}</Text>
            <View style={styles.metaDot} />
            <Text style={styles.serviceRowPrice}>{service.price}</Text>
          </View>
        </View>

        <MaterialIcons
          name="chevron-right"
          size={24}
          color={palette.outline}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

interface AllServicesScreenProps {
  onBack: () => void;
  onServicePress: (key: string) => void;
}

const AllServicesScreen: React.FC<AllServicesScreenProps> = ({
  onBack,
  onServicePress,
}) => {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('All');
  const scrollY = useRef(new Animated.Value(0)).current;

  // Per-row entrance animations
  const rowAnims = useRef(
    SERVICES.map(() => new Animated.Value(0))
  ).current;
  const rowSlideAnims = useRef(
    SERVICES.map(() => new Animated.Value(16))
  ).current;

  useEffect(() => {
    const anims = rowAnims.map((a, i) =>
      Animated.parallel([
        Animated.timing(a, {
          toValue: 1,
          duration: 400,
          delay: 100 + i * 60,
          useNativeDriver: true,
        }),
        Animated.timing(rowSlideAnims[i], {
          toValue: 0,
          duration: 400,
          delay: 100 + i * 60,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.parallel(anims).start();
  }, []);

  const HEADER_HEIGHT = 64 + insets.top;
  const CHIP_ROW_HEIGHT = 56;
  const BOTTOM_NAV_HEIGHT = 64 + insets.bottom;

  // Header shadow from scroll
  const headerShadow = scrollY.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 0.12],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Fixed Header */}
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top },
          Platform.OS === 'ios' && { shadowOpacity: headerShadow },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="arrow-back"
                size={24}
                color={palette.primary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>All Services</Text>
          </View>
          <TouchableOpacity style={styles.headerSearchBtn} activeOpacity={0.7}>
            <MaterialIcons
              name="search"
              size={24}
              color={palette.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Category Chips (sticky below header) */}
      <View
        style={[
          styles.chipsContainer,
          { top: HEADER_HEIGHT },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
          style={styles.chipsScrollView}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.85}
              >
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Service List */}
      <Animated.ScrollView
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: HEADER_HEIGHT + CHIP_ROW_HEIGHT + spacing.md,
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
        {SERVICES.map((svc, i) => (
          <ServiceRow
            key={svc.key}
            service={svc}
            onPress={() => onServicePress(svc.key)}
            index={i}
            animValue={rowAnims[i]}
            slideValue={rowSlideAnims[i]}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.surfaceBright,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: 'rgba(250,248,255,0.9)',
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
  headerContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backBtn: {
    padding: spacing.base,
    marginLeft: -spacing.base,
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.primary,
  },
  headerSearchBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },

  // ── Chips ─────────────────────────────────────────────────────────────────
  chipsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 40,
    backgroundColor: 'rgba(250,248,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: `${palette.outlineVariant}4D`,
    paddingVertical: spacing.md,
  },
  chipsScrollView: {},
  chipsScroll: {
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: 9999,
    backgroundColor: palette.surfaceContainerHighest,
  },
  chipActive: {
    backgroundColor: palette.primaryContainer,
    ...Platform.select({
      ios: {
        shadowColor: palette.primaryContainer,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  chipText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  chipTextActive: {
    color: palette.onPrimary,
  },

  // ── Service Row ───────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.md,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.surfaceContainerLowest,
    padding: spacing.md,
    borderRadius: 12,
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
  serviceRowIcon: {
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  serviceRowContent: { flex: 1 },
  serviceRowTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base / 2,
  },
  serviceRowName: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
  },
  serviceBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  serviceBadgeText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  serviceRowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  serviceRowCount: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.outlineVariant,
  },
  serviceRowPrice: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: palette.primary,
  },

});

export default AllServicesScreen;