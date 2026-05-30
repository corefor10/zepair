// screens/HomeDashboardScreen.tsx
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
  TextInput,
  FlatList,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme';

const { width: SW } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICES = [
  { key: 'plumbing', label: 'Plumbing', icon: 'plumbing' },
  { key: 'electrical', label: 'Electrical', icon: 'bolt' },
  { key: 'cleaning', label: 'Cleaning', icon: 'cleaning-services' },
  { key: 'ac', label: 'AC Repair', icon: 'ac-unit' },
  { key: 'pest', label: 'Pest Control', icon: 'pest-control' },
  { key: 'painting', label: 'Painting', icon: 'format-paint' },
  { key: 'carpentry', label: 'Carpentry', icon: 'carpenter' },
  { key: 'others', label: 'Others', icon: 'more-horiz' },
] as const;

const PROS = [
  {
    id: '1',
    name: 'Modern Electric Co.',
    subtitle: 'Certified Experts • 2km away',
    rating: '4.9',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAXv1sU8Os2BS_4N-T_OZmsiaTkjd9nWqKnR3_MIUCMv65tdkN0HGlomw2H_kmGTe2pm69N0TvRIG0y2lXXJxfloKw9sxG3ROKGLMlqHP469k1lYQe_I5ZFu-SrXHq_K8-wchGdkW9MVsXgdSztPzcT1Sj6IpOx-kHjU-44yWNY47520PUbY7OGg365kzP1s6F3Lpp-ioYj3SDRvoCU_smvV-p92PlvnqgB3s1ucuFdO6Q3NxYaddXhrD3TAd8CK75XNfyR804czB6c',
  },
  {
    id: '2',
    name: 'PureFlow Plumbing',
    subtitle: 'Quick Response • 1.5km away',
    rating: '4.8',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBEaQWx4EN-xqczchv85WubtelL3BGhR4hbrPOZL0GYZr05g7qakRgse8eewwbUhW-AyhOYcBzZemP51L7exD9sQZXJ1IOelvopAAYV10n3J0IoCZe3zmvi2muf9y4xlefwMMh6_FE58bM6rtCpIctvKWwCDS8cFylz_iIk4cZHD1zNBk7lNdPFLuqmtE67INNPqyQkpZofCQ3ue4wS4KPxD20m84WFVjvrIp3UdOOBqH9lKfZpocIHSV8cnc8kqjlYGXo8m1rLcxwf',
  },
];

const TRENDING = [
  {
    id: '1',
    title: 'Kitchen Deep Clean',
    subtitle: 'Sanitized & spotless kitchen in 3 hours',
    price: '₹1,299',
    originalPrice: '₹1,599',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCvuXjdwHaQtpyXlWKaX9uA0A4eF5mSiXkVKw5cmBq8g46fEsNJhnLTRDJwxkCd4NEHtalGcf3phfWMgLwJBByrAU8qs_ayqt8lwkIqAFpSYlvnFCbaEizKRk92EWhftvNF31PbG5cuhcoAxuqxXTKmLfYQSGnj7QxtNg4Ij9LL-iro5Hmtyi8vi3PfKdYbL7EbwTAJ9Fs63uQNSDZk0c4z42DT1vHB-y7NZ0ZfDcTXviIUR8uqYzw4pT1O5mq79-RDNzpa2OyvwipJ',
    showOriginal: true,
  },
  {
    id: '2',
    title: 'Furniture Assembly',
    subtitle: 'IKEA, Pepperfry & local brands',
    price: '₹499',
    originalPrice: 'per unit',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCviu5hBj0jZ_m0lourXuJaeikudGG7Q3zJxaAFxJ7gLAKRx_18EiPcFq1quHRTkCadFFm8ntbFPQcmHdK6Y9V49_B1AshVR2mS1F_YjEWHZZnZxf523UEvhAQDt5iifYWkR86M3XoYUzY8DAJQijJtvxFSl72u77hheJi-z8NoH3nHCXiGk8Hwd_AEluEKF4LUXaNw54tZsHbQ7-csh4FL4xC-ZJno9_GMld67to7QOFGy85F6c93MgKFfjUFKNlZrC13cZkQ4Ac1x',
    showOriginal: false,
  },
];

const PROMO_BANNERS = [
  {
    id: '1',
    badge: 'Offer',
    title: 'Up to 40% Off\nAC Servicing',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDWvwaTWUjl5lEIM92jtfKKOCSVrHaGDS_rcOYo1Nvf6wBVvfzasXdCuLgOeJzC5ss9nKrSXX6goOPG5S2VcAcgEQjN_YWLOvJ-m4Ufei-jFLUSNHFe35zhP_LP4VDq5uyy2-SsS9cvitIm9DkxrRq6Sb7UPWwME_sGfuavTyOvtC_qpiOx-cMSAYRvLDfY5tUvr2PtQH0W4VWCfkA0bmYcKpAKjQujbsh8FDpQB0244bMXLXUhQzhQYtE4iO54GUIv182UgVgEB-7D',
    useImage: true,
  },
  {
    id: '2',
    badge: 'New',
    title: 'Deep Home Cleaning\nStarting at ₹999',
    image: null,
    useImage: false,
  },
];


// ─── Service Icon ─────────────────────────────────────────────────────────────

const ServiceIcon: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
}> = ({ icon, label, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();

  const handlePressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View
      style={[styles.serviceIconWrapper, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        style={styles.serviceIconTouchable}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.serviceIconBox}>
          <MaterialIcons name={icon as any} size={30} color={palette.primary} />
        </View>
        <Text style={styles.serviceIconLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Pro Card ─────────────────────────────────────────────────────────────────

const ProCard: React.FC<{
  item: (typeof PROS)[0];
  onBook: () => void;
}> = ({ item, onBook }) => (
  <View style={styles.proCard}>
    <View style={styles.proImageWrapper}>
      <Image
        source={{ uri: item.image }}
        style={styles.proImage}
        resizeMode="cover"
      />
      <View style={styles.ratingBadge}>
        <MaterialIcons name="star" size={12} color="#f59e0b" />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
    </View>
    <View style={styles.proCardBody}>
      <Text style={styles.proCardName}>{item.name}</Text>
      <Text style={styles.proCardSub}>{item.subtitle}</Text>
      <TouchableOpacity style={styles.bookNowBtn} onPress={onBook} activeOpacity={0.8}>
        <Text style={styles.bookNowText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Trending Service Row ─────────────────────────────────────────────────────

const TrendingRow: React.FC<{
  item: (typeof TRENDING)[0];
  onAdd: () => void;
}> = ({ item, onAdd }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <View style={styles.trendingRow}>
      <Image
        source={{ uri: item.image }}
        style={styles.trendingImage}
        resizeMode="cover"
      />
      <View style={styles.trendingContent}>
        <Text style={styles.trendingTitle}>{item.title}</Text>
        <Text style={styles.trendingSubtitle}>{item.subtitle}</Text>
        <View style={styles.trendingPriceRow}>
          <Text style={styles.trendingPrice}>{item.price}</Text>
          <Text
            style={[
              styles.trendingOriginalPrice,
              item.showOriginal && styles.trendingStrikethrough,
            ]}
          >
            {item.originalPrice}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.85}>
        <MaterialIcons name="add" size={20} color={palette.onPrimary} />
      </TouchableOpacity>
    </View>
  );
};

// ─── FAB ──────────────────────────────────────────────────────────────────────

const FAB: React.FC<{ onPress: () => void; bottomOffset: number }> = ({
  onPress,
  bottomOffset,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View
      style={[
        styles.fab,
        { bottom: bottomOffset, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: true }).start()
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
        <LinearGradient
          colors={['#004ac6', '#00d2ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <MaterialIcons name="add-shopping-cart" size={28} color={palette.onPrimary} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

interface HomeDashboardScreenProps {
  onServicePress: (key: string) => void;
  onViewAllServices: () => void;
  onNotifications: () => void;
}

const HomeDashboardScreen: React.FC<HomeDashboardScreenProps> = ({
  onServicePress,
  onViewAllServices,
  onNotifications,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  // Promo banner pulse animation for SOS
  const sosAnim = useRef(new Animated.Value(1)).current;

  // Content stagger animations
  const sectionAnims = useRef(
    [0, 1, 2, 3, 4].map(() => new Animated.Value(0))
  ).current;
  const sectionSlideAnims = useRef(
    [0, 1, 2, 3, 4].map(() => new Animated.Value(20))
  ).current;

  useEffect(() => {
    // SOS pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(sosAnim, {
          toValue: 1.02,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(sosAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Staggered section entrance
    const anims = sectionAnims.map((a, i) =>
      Animated.parallel([
        Animated.timing(a, {
          toValue: 1,
          duration: 500,
          delay: 200 + i * 100,
          useNativeDriver: true,
        }),
        Animated.timing(sectionSlideAnims[i], {
          toValue: 0,
          duration: 500,
          delay: 200 + i * 100,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.parallel(anims).start();
  }, []);

  const aStyle = (i: number) => ({
    opacity: sectionAnims[Math.min(i, sectionAnims.length - 1)],
    transform: [
      { translateY: sectionSlideAnims[Math.min(i, sectionSlideAnims.length - 1)] },
    ],
  });

  const BOTTOM_NAV_HEIGHT = 64 + insets.bottom;
  const FAB_BOTTOM = BOTTOM_NAV_HEIGHT + spacing.sm;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: BOTTOM_NAV_HEIGHT + spacing.xl }}
      >
        {/* ── Gradient Header ── */}
        <LinearGradient
          colors={['#004ac6', '#00d2ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + spacing.xl }]}
        >
          {/* Top row */}
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.headerGreeting}>Good Morning 👋</Text>
              <Text style={styles.headerName}>John Doe</Text>
            </View>
            <View style={styles.headerActions}>
              {/* Notification bell */}
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={onNotifications}
                activeOpacity={0.8}
              >
                <MaterialIcons name="notifications" size={24} color={palette.onPrimary} />
                <View style={styles.notifDot} />
              </TouchableOpacity>
              {/* Avatar */}
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGtGDHvJzo5Dv7ZmDTAtf-Zjzwi8DP66DbGPY3B4eQZ9iSSsz5hDwuuQ29D-7kx4dyakAXszy10VpatbmNAex_-dy2ifDyx3udvdRwYpZ_oc3GxGpGz5aqhyPuLu-CeAytt40c9vn0CdOfflMgcNxkdJEtH2DtTRpBzEkwsJdK7I7QpdzsY1a2_aWY_PhEEDz1XzqEunP4fMgSJCqV8C2wYxM7QJT7MpzrgrVZWzzFkFH8P62lfc_ZnRIZGq-XyU1xq5XV1Pm-bEtv',
                }}
                style={styles.headerAvatar}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Location row */}
          <TouchableOpacity style={styles.locationRow} activeOpacity={0.8}>
            <MaterialIcons name="location-on" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.locationText}>Koramangala, Bangalore</Text>
            <MaterialIcons name="expand-more" size={16} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Overlapping Content ── */}
        <View style={styles.overlappingContent}>
          {/* Search bar */}
          <Animated.View style={[styles.searchBar, aStyle(0)]}>
            <MaterialIcons name="search" size={24} color={palette.outline} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for repair, cleaning..."
              placeholderTextColor={palette.outline}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </Animated.View>

          {/* SOS Banner */}
          <Animated.View
            style={[styles.sosBanner, aStyle(1), { transform: [{ scale: sosAnim }] }]}
          >
            <View style={styles.sosIconCircle}>
              <MaterialIcons name="emergency" size={20} color={palette.onError} />
            </View>
            <View style={styles.sosText}>
              <Text style={styles.sosTitle}>Emergency Repair?</Text>
              <Text style={styles.sosSubtitle}>Book a technician in under 15 mins</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={palette.onErrorContainer} />
          </Animated.View>

          {/* Promo Banners */}
          <Animated.View style={aStyle(2)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promoBannerScroll}
              snapToInterval={SW - spacing.marginMobile * 2 - 16}
              decelerationRate="fast"
            >
              {/* Banner 1 - Image */}
              <View style={styles.promoBanner}>
                <Image
                  source={{ uri: PROMO_BANNERS[0].image! }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.6)', 'transparent']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.promoBannerContent}>
                  <View style={styles.promoBadge}>
                    <Text style={styles.promoBadgeText}>OFFER</Text>
                  </View>
                  <Text style={styles.promoBannerTitle}>
                    Up to 40% Off{'\n'}AC Servicing
                  </Text>
                </View>
              </View>
              {/* Banner 2 - Color */}
              <LinearGradient
                colors={[palette.secondaryContainer, palette.secondary]}
                style={styles.promoBanner}
              >
                <View style={styles.promoBannerContent}>
                  <View style={[styles.promoBadge, { backgroundColor: palette.secondaryFixed }]}>
                    <Text style={[styles.promoBadgeText, { color: palette.onSecondaryFixed }]}>
                      NEW
                    </Text>
                  </View>
                  <Text style={styles.promoBannerTitle}>
                    Deep Home Cleaning{'\n'}Starting at ₹999
                  </Text>
                </View>
              </LinearGradient>
            </ScrollView>
          </Animated.View>

          {/* Services Grid */}
          <Animated.View style={[styles.section, aStyle(2)]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>What do you need?</Text>
              <TouchableOpacity onPress={onViewAllServices}>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.servicesGrid}>
              {SERVICES.map((svc) => (
                <ServiceIcon
                  key={svc.key}
                  icon={svc.icon}
                  label={svc.label}
                  onPress={() => onServicePress(svc.key)}
                />
              ))}
            </View>
          </Animated.View>

          {/* Top Rated Near You */}
          <Animated.View style={[styles.section, aStyle(3)]}>
            <Text style={styles.sectionTitle}>Top Rated Near You</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.prosScroll}
              style={styles.prosScrollView}
            >
              {PROS.map((pro) => (
                <ProCard key={pro.id} item={pro} onBook={() => {}} />
              ))}
            </ScrollView>
          </Animated.View>

          {/* Trending Services */}
          <Animated.View style={[styles.section, aStyle(4)]}>
            <Text style={styles.sectionTitle}>Trending Services</Text>
            <View style={styles.trendingList}>
              {TRENDING.map((item) => (
                <TrendingRow key={item.id} item={item} onAdd={() => {}} />
              ))}
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* FAB */}
      <FAB onPress={() => {}} bottomOffset={FAB_BOTTOM} />
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
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.xl * 3,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerGreeting: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.9)',
  },
  headerName: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    color: palette.onPrimary,
    letterSpacing: -0.26,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.error,
    borderWidth: 2,
    borderColor: palette.primaryContainer,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  locationText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },

  // ── Overlapping content ───────────────────────────────────────────────────
  overlappingContent: {
    marginTop: -(spacing.xl * 3),
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: palette.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}80`,
    paddingHorizontal: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurface,
  },

  // ── SOS Banner ────────────────────────────────────────────────────────────
  sosBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.errorContainer,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${palette.error}1A`,
  },
  sosIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.error,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sosText: { flex: 1 },
  sosTitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.onErrorContainer,
  },
  sosSubtitle: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: `${palette.onErrorContainer}CC`,
  },

  // ── Promo Banners ─────────────────────────────────────────────────────────
  promoBannerScroll: {
    gap: spacing.md,
  },
  promoBanner: {
    width: SW - spacing.marginMobile * 2 - 16,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  promoBannerContent: {
    padding: spacing.md,
    justifyContent: 'flex-end',
    flex: 1,
  },
  promoBadge: {
    backgroundColor: palette.primaryContainer,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.base,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  promoBadgeText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    color: palette.onPrimary,
    letterSpacing: 0.5,
  },
  promoBannerTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
    color: palette.onPrimary,
    lineHeight: 24,
  },

  // ── Sections ──────────────────────────────────────────────────────────────
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
  },
  viewAllText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
  },

  // ── Services Grid ─────────────────────────────────────────────────────────
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    rowGap: spacing.lg,
  },
  serviceIconWrapper: {
    width: (SW - spacing.marginMobile * 2 - spacing.md * 3) / 4,
    alignItems: 'center',
  },
  serviceIconTouchable: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  serviceIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: palette.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
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
  serviceIconLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurface,
    textAlign: 'center',
  },

  // ── Pro Cards ─────────────────────────────────────────────────────────────
  prosScrollView: {
    marginHorizontal: -spacing.marginMobile,
  },
  prosScroll: {
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.md,
  },
  proCard: {
    width: 240,
    backgroundColor: palette.surfaceContainerLowest,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}33`,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  proImageWrapper: {
    height: 128,
    position: 'relative',
  },
  proImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.base,
    borderRadius: 8,
  },
  ratingText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    color: palette.onSurface,
  },
  proCardBody: { padding: spacing.md },
  proCardName: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.onSurface,
  },
  proCardSub: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.outline,
    marginTop: spacing.base,
    marginBottom: spacing.md,
  },
  bookNowBtn: {
    backgroundColor: `${palette.primaryContainer}1A`,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookNowText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
  },

  // ── Trending ──────────────────────────────────────────────────────────────
  trendingList: { gap: spacing.md },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.surfaceContainerLowest,
    padding: spacing.md,
    borderRadius: 16,
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
  trendingImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    flexShrink: 0,
  },
  trendingContent: { flex: 1 },
  trendingTitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.onSurface,
  },
  trendingSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.outline,
    marginTop: spacing.base,
  },
  trendingPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.base,
  },
  trendingPrice: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
  },
  trendingOriginalPrice: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.outline,
  },
  trendingStrikethrough: {
    textDecorationLine: 'line-through',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── FAB ───────────────────────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    right: spacing.lg,
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
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

});

export default HomeDashboardScreen;