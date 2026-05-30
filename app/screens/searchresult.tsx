// screens/SearchResultsScreen.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  StatusBar,
  ScrollView,
  FlatList,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme';

const { width: SW } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'services' | 'professionals';
type FilterKey = 'Price' | 'Rating' | 'Availability';

// ─── Data ─────────────────────────────────────────────────────────────────────

const FILTERS: FilterKey[] = ['Price', 'Rating', 'Availability'];

const SERVICE_RESULTS = [
  {
    id: '1',
    title: 'Emergency Pipe Repair',
    description:
      'Quick response for leaks, bursts, and clogged drains. 24/7 availability guaranteed.',
    price: '$85/hr',
    rating: '4.9',
    proCount: 12,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAwV7c_XVeXpjMcKTfjcpsqaTGLAVj10J7sXROe7nSFgOQStKS7zraTdL16esE-6FMeD22yy2i1OeudruM1CCjJaDoQ46HhvMg1jroepmxuaMnRitppYrPtdEAn62n-t7DCh4UIMrfbtpZYdHul7_BT-X2TPIp9yh57zg4P3LTZLcrIb-UbWMSNpzu6HvgbWc5ju-FC21UUBH_TgudyA1gy8xHR5uF0v_8rHWKKwdBPCi9E28bsB6nfJOmDIwcgdKGCoKdqSVvtNFyY',
    proAvatars: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAocRx-YtiyfEKgl2pg8L3T2r7IPAP4HXfLhtFf0dxiyR0mKznX5pYDBMvzV35amSZAJAeLGVkRa_M_mynhZa_edG8g5bJJ5I3jrEgzNh2wiU4g3JhS2OwFD5kDN4cVkVZTkG5qsO6Q3AET_sTbDtwzjE5hvwLiG3KbYiUQXFEiDR4dMX0neiX6lgIPs8ToJweIrL_sRR1RpvdqVT8bZJ-ZnyrMmKkHNGMgZtgpvg7NZVcSjDljYHo6UaZCYKCdpFH09zbT1vgm2FSZ',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQQNk8-sOBZCuoG4U0vYIBmBSFRiYyF0Bvxs6Yp2x4Z5Q6U0-LUwz_Ov5ngIi__OcXXFJll4OoslkFjTTC-vtlaLmA2IL7gLnW0JMECKU6I7lNEwFZBnJmoL_BZ0XwJrCXzDiUtPl5F2-sBrepPZ6wNIJgpe_tB3CHltC5kH1b4B08g_6Dx_p_UIpW5Csn4Pi56PGJFJs625Oh92CKkIGsTnTddNDH89_ZYKCryaSocFaxZH3FlsUz3Y_HmgBGgFY6CjDP2teMrGNQ',
    ],
    tags: [],
  },
  {
    id: '2',
    title: 'Water Heater Install',
    description:
      'Standard and tankless water heater installation and maintenance services.',
    price: '$240',
    rating: '4.7',
    proCount: 0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC5U5vDOTbzvBVl_0Lanj7PE7RBQXkorFCVU3VIH-xlupBucDhgKgQ0aeJUXMMbKluCYZ8P9u6Bgt1vyCjj1KfY4gBNCapZVDMtVlnfllsoTjlTVzALBSKeeg3WM57mHFJTUCD63u9GJCtdHijTa-DvcX4IggJj-WEqBtsGtf7l_UMXpjQYj1tQk9IQB46XkIQVRRsXYaTyA0xuTSJtiTC1wiLSiScc1xrKQi8f4TJGt-5KUrEMCiVzy9alH9F7E2Y0KTiPumcN-4sh',
    proAvatars: [],
    tags: ['Licensed', 'Warranty Included'],
  },
];

// ─── Shimmer Skeleton ─────────────────────────────────────────────────────────

const ShimmerCard: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const shimmerBg = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      palette.surfaceContainer,
      palette.surfaceContainerLow,
      palette.surfaceContainer,
    ],
  });

  return (
    <View style={shimStyles.card}>
      <Animated.View
        style={[shimStyles.imageBlock, { backgroundColor: shimmerBg }]}
      />
      <View style={shimStyles.textBlock}>
        <Animated.View
          style={[shimStyles.titleLine, { backgroundColor: shimmerBg }]}
        />
        <Animated.View
          style={[shimStyles.subLine, { backgroundColor: shimmerBg }]}
        />
      </View>
    </View>
  );
};

const shimStyles = StyleSheet.create({
  card: {
    backgroundColor: palette.surfaceContainerLowest,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}1A`,
    gap: spacing.md,
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
  imageBlock: {
    height: 160,
    width: '100%',
    borderRadius: 10,
  },
  textBlock: { gap: spacing.xs },
  titleLine: {
    height: 24,
    width: '75%',
    borderRadius: 4,
  },
  subLine: {
    height: 16,
    width: '50%',
    borderRadius: 4,
  },
});

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        emptyStyles.container,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={emptyStyles.iconCircle}>
        <MaterialIcons
          name="search-off"
          size={80}
          color={`${palette.outline}66`}
        />
      </View>
      <Text style={emptyStyles.title}>No results found</Text>
      <Text style={emptyStyles.body}>
        We couldn't find any services matching "plumber" with those filters. Try
        adjusting your selection.
      </Text>
      <TouchableOpacity
        style={emptyStyles.resetBtn}
        onPress={onReset}
        activeOpacity={0.85}
      >
        <Text style={emptyStyles.resetBtnText}>Reset Filters</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  iconCircle: {
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: palette.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.onSurface,
    textAlign: 'center',
  },
  body: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
  },
  resetBtn: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: palette.primary,
    borderRadius: 12,
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
  resetBtnText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onPrimary,
  },
});

// ─── Service Result Card ──────────────────────────────────────────────────────

const ServiceResultCard: React.FC<{
  item: (typeof SERVICE_RESULTS)[0];
  onPress: () => void;
  animValue: Animated.Value;
  slideValue: Animated.Value;
}> = ({ item, onPress, animValue, slideValue }) => {
  const pressAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View
      style={[
        cardStyles.card,
        {
          opacity: animValue,
          transform: [{ translateY: slideValue }, { scale: pressAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
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
        {/* Image */}
        <View style={cardStyles.imageWrapper}>
          <Image
            source={{ uri: item.image }}
            style={cardStyles.image}
            resizeMode="cover"
          />
          {/* Rating badge */}
          <View style={cardStyles.ratingBadge}>
            <MaterialIcons name="star" size={12} color={palette.tertiary} />
            <Text style={cardStyles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={cardStyles.content}>
          <View style={cardStyles.titleRow}>
            <Text style={cardStyles.title}>{item.title}</Text>
            <Text style={cardStyles.price}>{item.price}</Text>
          </View>
          <Text style={cardStyles.description}>{item.description}</Text>

          {/* Footer: avatars or tags */}
          {item.proAvatars.length > 0 ? (
            <View style={cardStyles.proRow}>
              <View style={cardStyles.avatarsStack}>
                {item.proAvatars.map((uri, i) => (
                  <Image
                    key={i}
                    source={{ uri }}
                    style={[
                      cardStyles.proAvatar,
                      { marginLeft: i > 0 ? -8 : 0 },
                    ]}
                    resizeMode="cover"
                  />
                ))}
              </View>
              <Text style={cardStyles.proCountText}>
                {item.proCount} Professionals available
              </Text>
            </View>
          ) : (
            <View style={cardStyles.tagsRow}>
              {item.tags.map((tag) => (
                <View key={tag} style={cardStyles.tag}>
                  <Text style={cardStyles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: palette.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}33`,
    overflow: 'hidden',
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
  imageWrapper: {
    height: 176,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.base,
    borderRadius: 9999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  ratingText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    color: palette.onSurface,
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
    flex: 1,
    marginRight: spacing.sm,
  },
  price: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: palette.primary,
    flexShrink: 0,
  },
  description: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarsStack: {
    flexDirection: 'row',
  },
  proAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: palette.surfaceContainerLowest,
  },
  proCountText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.outline,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.base,
    backgroundColor: palette.surfaceContainerLow,
    borderRadius: 6,
  },
  tagText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onPrimaryFixedVariant,
  },
});

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

// ─── Tab Indicator ────────────────────────────────────────────────────────────

const TabBar: React.FC<{
  activeTab: TabKey;
  onSwitch: (tab: TabKey) => void;
}> = ({ activeTab, onSwitch }) => {
  const indicatorAnim = useRef(
    new Animated.Value(activeTab === 'services' ? 0 : 1)
  ).current;

  const handleSwitch = (tab: TabKey) => {
    Animated.timing(indicatorAnim, {
      toValue: tab === 'services' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    onSwitch(tab);
  };

  const indicatorLeft = indicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <View style={tabStyles.container}>
      {(['services', 'professionals'] as TabKey[]).map((tab) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            style={tabStyles.tab}
            onPress={() => handleSwitch(tab)}
            activeOpacity={0.8}
          >
            <Text
              style={[tabStyles.tabText, isActive && tabStyles.tabTextActive]}
            >
              {tab === 'services' ? 'Services' : 'Professionals'}
            </Text>
          </TouchableOpacity>
        );
      })}
      <Animated.View style={[tabStyles.indicator, { left: indicatorLeft }]} />
    </View>
  );
};

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: `${palette.outlineVariant}33`,
    position: 'relative',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  tabText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  tabTextActive: {
    fontWeight: '700',
    color: palette.primary,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: '50%',
    height: 3,
    backgroundColor: palette.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

interface SearchResultsScreenProps {
  initialQuery?: string;
  onBack: () => void;
  onServicePress: (id: string) => void;
  onNavigate: (tab: string) => void;
  onOpenFilters: () => void;
}

const SearchResultsScreen: React.FC<SearchResultsScreenProps> = ({
  initialQuery = 'plumber',
  onBack,
  onServicePress,
  onNavigate,
  onOpenFilters,
}) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<TabKey>('services');
  const [navTab, setNavTab] = useState('services');
  const [viewState, setViewState] = useState<'results' | 'loading' | 'empty'>(
    'results'
  );
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>('Price');

  // Per-card entrance animations
  const cardAnims = useRef(
    SERVICE_RESULTS.map(() => new Animated.Value(0))
  ).current;
  const cardSlideAnims = useRef(
    SERVICE_RESULTS.map(() => new Animated.Value(16))
  ).current;

  const playCardAnims = useCallback(() => {
    cardAnims.forEach((a) => a.setValue(0));
    cardSlideAnims.forEach((a) => a.setValue(16));
    Animated.parallel(
      cardAnims.map((a, i) =>
        Animated.parallel([
          Animated.timing(a, {
            toValue: 1,
            duration: 400,
            delay: i * 80,
            useNativeDriver: true,
          }),
          Animated.timing(cardSlideAnims[i], {
            toValue: 0,
            duration: 400,
            delay: i * 80,
            useNativeDriver: true,
          }),
        ])
      )
    ).start();
  }, []);

  useEffect(() => {
    if (viewState === 'results') playCardAnims();
  }, [viewState]);

  const handleTabSwitch = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === 'professionals') {
      setViewState('loading');
      setTimeout(() => setViewState('empty'), 900);
    } else {
      setViewState('results');
    }
  };

  const handleReset = () => {
    setViewState('loading');
    setTimeout(() => {
      setActiveTab('services');
      setViewState('results');
    }, 600);
  };

  const handleClearSearch = () => {
    setQuery('');
    setViewState('empty');
  };

  const HEADER_HEIGHT = insets.top + 64 + 48 + 48; // topbar + filters + tabs

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Fixed Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {/* Search Row */}
        <View style={styles.searchRow}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={palette.onSurface} />
          </TouchableOpacity>
          <View style={styles.searchInputWrapper}>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search services..."
              placeholderTextColor={palette.outline}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleClearSearch} activeOpacity={0.7}>
              <MaterialIcons name="close" size={20} color={palette.outline} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
          style={styles.filtersScrollView}
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => {
                  setActiveFilter(isActive ? null : filter);
                  onOpenFilters();
                }}
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
                <MaterialIcons
                  name="expand-more"
                  size={16}
                  color={isActive ? palette.onPrimaryContainer : palette.onSurfaceVariant}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Tabs */}
        <TabBar activeTab={activeTab} onSwitch={handleTabSwitch} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: HEADER_HEIGHT + spacing.md },
          { paddingBottom: 64 + insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {viewState === 'loading' && (
          <View style={styles.loadingContainer}>
            <ShimmerCard />
            <ShimmerCard />
          </View>
        )}

        {viewState === 'results' &&
          SERVICE_RESULTS.map((item, i) => (
            <ServiceResultCard
              key={item.id}
              item={item}
              onPress={() => onServicePress(item.id)}
              animValue={cardAnims[i]}
              slideValue={cardSlideAnims[i]}
            />
          ))}

        {viewState === 'empty' && <EmptyState onReset={handleReset} />}
      </ScrollView>

      {/* Bottom Nav */}
      <BottomNav activeTab={navTab} onTabPress={setNavTab} />
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
    backgroundColor: palette.surfaceBright,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.md,
  },
  backBtn: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: palette.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    color: palette.onSurface,
    paddingVertical: 0,
  },
  filtersScrollView: {
    height: 48,
  },
  filtersScroll: {
    paddingHorizontal: spacing.marginMobile,
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}80`,
  },
  filterChipActive: {
    backgroundColor: palette.primaryContainer,
    borderColor: palette.primaryContainer,
  },
  filterChipText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: palette.onPrimaryContainer,
  },

  // ── Content ───────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.lg,
    flexGrow: 1,
  },
  loadingContainer: {
    gap: spacing.lg,
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

export default SearchResultsScreen;s