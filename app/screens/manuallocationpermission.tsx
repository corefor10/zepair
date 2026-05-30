// screens/ManualLocationScreen.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
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

const RECENT_SEARCHES = [
  { city: 'Indiranagar, Bangalore', state: 'Karnataka, India' },
  { city: 'Powai, Mumbai', state: 'Maharashtra, India' },
  { city: 'Cyber City, Gurgaon', state: 'Haryana, India' },
];

const POPULAR_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad',
  'Pune', 'Chennai', 'Kolkata', 'Ahmedabad',
];

// ─── Bottom Navigation ────────────────────────────────────────────────────────

interface BottomNavProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'services', label: 'Services', icon: 'build' },
  { key: 'bookings', label: 'Bookings', icon: 'event-note' },
  { key: 'chat', label: 'Chat', icon: 'chat' },
  { key: 'profile', label: 'Profile', icon: 'person' },
] as const;

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabPress }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bottomNav,
        { paddingBottom: insets.bottom + spacing.xs },
      ]}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={() => onTabPress(item.key)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={item.icon as any}
              size={24}
              color={isActive ? palette.primary : palette.onSurfaceVariant}
            />
            <Text
              style={[
                styles.navLabel,
                isActive && styles.navLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── City Chip ────────────────────────────────────────────────────────────────

const CityChip: React.FC<{
  city: string;
  selected: boolean;
  onPress: () => void;
}> = ({ city, selected, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.cityChip, selected && styles.cityChipSelected]}
        onPress={handlePress}
        activeOpacity={1}
      >
        <Text
          style={[
            styles.cityChipText,
            selected && styles.cityChipTextSelected,
          ]}
        >
          {city}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

interface ManualLocationScreenProps {
  onBack: () => void;
  onLocationSelected: (location: string) => void;
  onUseCurrentLocation: () => void;
}

const ManualLocationScreen: React.FC<ManualLocationScreenProps> = ({
  onBack,
  onLocationSelected,
  onUseCurrentLocation,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [searchFocused, setSearchFocused] = useState(false);

  // Animations
  const searchScaleAnim = useRef(new Animated.Value(1)).current;
  const mapHoverAnim = useRef(new Animated.Value(1)).current;
  const contentAnim = useRef(
    [0, 1, 2, 3].map(() => new Animated.Value(0))
  ).current;
  const contentSlideAnim = useRef(
    [0, 1, 2, 3].map(() => new Animated.Value(16))
  ).current;

  useEffect(() => {
    const anims = contentAnim.map((a, i) =>
      Animated.parallel([
        Animated.timing(a, {
          toValue: 1,
          duration: 500,
          delay: 100 + i * 80,
          useNativeDriver: true,
        }),
        Animated.timing(contentSlideAnim[i], {
          toValue: 0,
          duration: 500,
          delay: 100 + i * 80,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.parallel(anims).start();
  }, []);

  const handleSearchFocus = () => {
    setSearchFocused(true);
    Animated.spring(searchScaleAnim, {
      toValue: 1.02,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handleSearchBlur = () => {
    setSearchFocused(false);
    Animated.spring(searchScaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const aStyle = (i: number) => ({
    opacity: contentAnim[i],
    transform: [{ translateY: contentSlideAnim[i] }],
  });

  const BOTTOM_NAV_HEIGHT = 64 + insets.bottom;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <MaterialIcons name="arrow-back" size={24} color={palette.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerLogo}>Zepair</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <MaterialIcons name="notifications" size={24} color={palette.primary} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BOTTOM_NAV_HEIGHT + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Section */}
        <Animated.View style={[styles.searchSection, aStyle(0)]}>
          {/* Search Input */}
          <Animated.View
            style={[
              styles.searchInputWrapper,
              searchFocused && styles.searchInputFocused,
              { transform: [{ scale: searchScaleAnim }] },
            ]}
          >
            <MaterialIcons
              name="location-on"
              size={24}
              color={palette.primary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your area, locality or city"
              placeholderTextColor={palette.outline}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
          </Animated.View>

          {/* Use Current Location */}
          <TouchableOpacity
            style={styles.currentLocationRow}
            onPress={onUseCurrentLocation}
            activeOpacity={0.85}
          >
            <View style={styles.currentLocationIcon}>
              <MaterialIcons name="my-location" size={22} color={palette.primary} />
            </View>
            <View style={styles.currentLocationText}>
              <Text style={styles.currentLocationPrimary}>
                Use Current Location
              </Text>
              <Text style={styles.currentLocationSecondary}>
                Using GPS for better accuracy
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Recent Searches */}
        <Animated.View style={[styles.section, aStyle(1)]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentList}>
            {RECENT_SEARCHES.map((item, index) => (
              <TouchableOpacity
                key={item.city}
                style={[
                  styles.recentItem,
                  index < RECENT_SEARCHES.length - 1 && styles.recentItemBorder,
                ]}
                onPress={() => onLocationSelected(item.city)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="schedule"
                  size={24}
                  color={palette.outline}
                />
                <View style={styles.recentItemText}>
                  <Text style={styles.recentItemCity}>{item.city}</Text>
                  <Text style={styles.recentItemState}>{item.state}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Popular Cities */}
        <Animated.View style={[styles.section, aStyle(2)]}>
          <Text style={styles.sectionTitle}>Popular Cities</Text>
          <View style={styles.chipsContainer}>
            {POPULAR_CITIES.map((city) => (
              <CityChip
                key={city}
                city={city}
                selected={selectedCity === city}
                onPress={() => {
                  setSelectedCity(city);
                  onLocationSelected(city);
                }}
              />
            ))}
          </View>
        </Animated.View>

        {/* Map Preview Section */}
        <Animated.View style={[styles.section, aStyle(3)]}>
          <TouchableOpacity
            style={styles.mapPreviewWrapper}
            activeOpacity={0.9}
            onPressIn={() =>
              Animated.timing(mapHoverAnim, {
                toValue: 1.03,
                duration: 200,
                useNativeDriver: true,
              }).start()
            }
            onPressOut={() =>
              Animated.spring(mapHoverAnim, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
              }).start()
            }
          >
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQLUA1m_B23cAriePPkwLkpzbb4vIydBOiOal80-MrB5jItf4D_gCloQNWjvXJZdQ7U4MvCZPURuQ-8A1apRlfnh4YkwZA7neUmXOsbG1aiIlqHylh7PAlf-Clb56w-sv8uSSvfOhIp5Jx_jpI_yr4865tVtam18rr36VW57IEwdLfhwWFByRuWuFUcf8kx1nSsgqDni5-wp1naIazhcm62M377JM2LgRAhDoDDVqmobwOnaNmwBst9pyVWv7Z-zTtcYxsCqB00-Hr',
              }}
              style={styles.mapImage}
              resizeMode="cover"
            />
            {/* Gradient overlay */}
            <LinearGradient
              colors={['transparent', `${palette.surfaceBright}CC`]}
              style={styles.mapGradient}
            />
            <View style={styles.mapFooter}>
              <Text style={styles.mapFooterText}>
                Find expert repair services near your exact location.
              </Text>
              <MaterialIcons
                name="explore"
                size={32}
                color={palette.primary}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />
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
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
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
      android: { elevation: 2 },
    }),
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
  headerLogo: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    color: palette.primary,
    letterSpacing: -0.26,
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },

  // ── Search ────────────────────────────────────────────────────────────────
  searchSection: {
    gap: spacing.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}80`,
    backgroundColor: palette.surfaceContainerLowest,
    paddingHorizontal: spacing.md,
  },
  searchInputFocused: {
    borderColor: palette.primary,
    borderWidth: 2,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurface,
  },
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: palette.surfaceContainerLowest,
    borderRadius: 12,
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
  currentLocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${palette.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationText: {
    flex: 1,
  },
  currentLocationPrimary: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
  },
  currentLocationSecondary: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
  },

  // ── Sections ──────────────────────────────────────────────────────────────
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
  },
  clearAllText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.primary,
    textTransform: 'uppercase',
  },

  // ── Recent ────────────────────────────────────────────────────────────────
  recentList: {
    backgroundColor: palette.surfaceContainerLowest,
    borderRadius: 12,
    overflow: 'hidden',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  recentItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: `${palette.outlineVariant}33`,
  },
  recentItemText: {
    flex: 1,
  },
  recentItemCity: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    color: palette.onSurface,
  },
  recentItemState: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
  },

  // ── City Chips ────────────────────────────────────────────────────────────
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cityChip: {
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: 9999,
    backgroundColor: palette.surfaceContainerLow,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityChipSelected: {
    backgroundColor: palette.primaryContainer,
    borderColor: palette.primaryContainer,
  },
  cityChipText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
  },
  cityChipTextSelected: {
    color: palette.onPrimary,
  },

  // ── Map Preview ───────────────────────────────────────────────────────────
  mapPreviewWrapper: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
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
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  mapGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  mapFooter: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mapFooterText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
    maxWidth: 200,
    lineHeight: 18,
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

export default ManualLocationScreen;