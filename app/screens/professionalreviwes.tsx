// screens/ProfessionalReviewsScreen.tsx
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
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme';

const { width: SW } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────

const RATING_BARS = [
  { star: 5, percent: 85 },
  { star: 4, percent: 10 },
  { star: 3, percent: 3 },
  { star: 2, percent: 1 },
  { star: 1, percent: 1 },
];

const FILTER_OPTIONS = ['All', 'Positive', 'Critical', 'With Photos'] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

const REVIEWS = [
  {
    id: '1',
    name: 'Rahul S.',
    time: '2 days ago',
    rating: 5,
    body: 'Excellent service, arrived on time and fixed the leak quickly. Marcus explained everything clearly and didn\'t try to upsell anything I didn\'t need. Highly recommended!',
    photos: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAuyux1YxMpsKDRXjp-lp83T4b5zPRXADHiQU7N52V3fq6vSkwHK-qNMcYzv73ZTiHYkd1qXYZuJPg1Nly5YtoXBUKbhX1jSIlEPLwMyJ49U4s64G3m0mXNGwViT3WA8MklkKram8ytHuphtBHxwDxOmKxZZ1ABc_TPcQ75j-XJeV_eCvJ8VsjZdAzGtUnKjN2jqCZuFxwv6xI8ZKJ9h2sdaEOQjpVj55AalDA4bFQvhhVOHyuk-9O6YFHznLXjD3yEqP_rHYi8cX0T',
    ],
    helpfulCount: 12,
    reply:
      '"Thank you for the kind words, Rahul! Glad I could get your sink sorted before your guests arrived. Looking forward to helping you again if needed."',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDOhF14xxyBSwyC4kFQ9zSipz_5SAt-BdquUOj_J5k1DhL7ugItqhiD6uG8jVesArVgxO3_83-RvxRFcZpDNDmW4AYIhp9hC_3313v9cN5ro-6WwG7gZTSiTJsK6LIRqWgHqalcaD3SyCJDhv_7WFaJnyUMtZJiB7416jhGbqoDHr5m4lZ9AWptYWBc13Pyyn08UefyGuDo0ZxU0T1xQr54L0S-PLKFI1ZnH2DvSeh9aUvMH5qGZwzwWpg5BEv5eux6h22POO6MBNzH',
  },
  {
    id: '2',
    name: 'Elena D.',
    time: '1 week ago',
    rating: 5,
    body: 'Very professional and kept the workspace spotless. Hard to find reliable pros like this these days. 5 stars for sure!',
    photos: [],
    helpfulCount: 4,
    reply: null,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCx35xTIYnJACAiOS4cdoqS7YvLdfvB9B4RyIXzEZcC99pOZ5dFK4ivTrZfuTiFRDptfgwIGbsC792gpgBHG39FmqjfAudSHpMkidLJyO93MwMsYb5zdGOl8cMgEoYucW2zw-kTFbfY_4WVVg3DXj7NlP7rxZvgy233E3S1o5WBHrj6ReWiIEJTZv2zIm_MPU3-1VDPZvRig1A7GWE98eqafSwMVvs-0eLr8kWqLhJQ3MBP0RTNit7LtKojfb3FYw_bxJrRuFe84GgV',
  },
];

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'services', label: 'Services', icon: 'build-circle' },
  { key: 'bookings', label: 'Bookings', icon: 'calendar-month' },
  { key: 'chat', label: 'Chat', icon: 'chat-bubble' },
  { key: 'profile', label: 'Profile', icon: 'person' },
] as const;

// ─── Star Rating Row ──────────────────────────────────────────────────────────

const StarRow: React.FC<{ count: number; filled?: boolean; size?: number }> = ({
  count,
  filled = true,
  size = 18,
}) => (
  <View style={{ flexDirection: 'row' }}>
    {Array(count)
      .fill(0)
      .map((_, i) => (
        <MaterialIcons
          key={i}
          name={filled ? 'star' : 'star-border'}
          size={size}
          color="#f59e0b"
        />
      ))}
  </View>
);

// ─── Rating Bar ───────────────────────────────────────────────────────────────

const RatingBar: React.FC<{ star: number; percent: number }> = ({
  star,
  percent,
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percent,
      duration: 900,
      delay: (5 - star) * 80,
      useNativeDriver: false,
    }).start();
  }, []);

  const barWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={rbStyles.row}>
      <Text style={rbStyles.starNum}>{star}</Text>
      <View style={rbStyles.track}>
        <Animated.View style={[rbStyles.fill, { width: barWidth }]} />
      </View>
      <Text style={rbStyles.pct}>{percent}%</Text>
    </View>
  );
};

const rbStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  starNum: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
    width: 16,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: palette.surfaceContainer,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: palette.primaryContainer,
    borderRadius: 4,
  },
  pct: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
    width: 32,
    textAlign: 'right',
  },
});

// ─── Review Card ─────────────────────────────────────────────────────────────

interface ReviewCardProps {
  review: (typeof REVIEWS)[0];
  opacity: Animated.Value;
  translateY: Animated.Value;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  opacity,
  translateY,
}) => {
  const [helpful, setHelpful] = useState(review.helpfulCount);
  const [isHelpful, setIsHelpful] = useState(false);

  const helpfulScale = useRef(new Animated.Value(1)).current;

  const handleHelpful = () => {
    Animated.sequence([
      Animated.spring(helpfulScale, { toValue: 1.2, useNativeDriver: true }),
      Animated.spring(helpfulScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    if (!isHelpful) {
      setHelpful((h) => h + 1);
      setIsHelpful(true);
    } else {
      setHelpful((h) => h - 1);
      setIsHelpful(false);
    }
  };

  return (
    <Animated.View
      style={[
        rcStyles.card,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      {/* Header */}
      <View style={rcStyles.header}>
        <View style={rcStyles.authorRow}>
          <Image
            source={{ uri: review.avatar }}
            style={rcStyles.avatar}
            resizeMode="cover"
          />
          <View>
            <Text style={rcStyles.name}>{review.name}</Text>
            <Text style={rcStyles.time}>{review.time}</Text>
          </View>
        </View>
        <StarRow count={review.rating} size={16} />
      </View>

      {/* Body */}
      <Text style={rcStyles.body}>{review.body}</Text>

      {/* Photos */}
      {review.photos.length > 0 && (
        <View style={rcStyles.photosGrid}>
          {review.photos.map((uri, i) => (
            <Image
              key={i}
              source={{ uri }}
              style={rcStyles.photo}
              resizeMode="cover"
            />
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={rcStyles.actionsRow}>
        <Animated.View style={{ transform: [{ scale: helpfulScale }] }}>
          <TouchableOpacity
            style={rcStyles.actionBtn}
            onPress={handleHelpful}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={isHelpful ? 'thumb-up' : 'thumb-up-off-alt'}
              size={20}
              color={isHelpful ? palette.primary : palette.primary}
            />
            <Text style={rcStyles.actionText}>Helpful ({helpful})</Text>
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={rcStyles.actionBtn} activeOpacity={0.8}>
          <MaterialIcons name="share" size={20} color={palette.onSurfaceVariant} />
          <Text style={rcStyles.actionTextMuted}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Pro Reply */}
      {review.reply && (
        <View style={rcStyles.replyCard}>
          <Text style={rcStyles.replyAuthor}>Response from Marcus</Text>
          <Text style={rcStyles.replyBody}>{review.reply}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const rcStyles = StyleSheet.create({
  card: {
    backgroundColor: palette.surfaceContainerLowest,
    borderRadius: 12,
    padding: spacing.lg,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.surfaceContainerHigh,
  },
  name: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: palette.onSurface,
  },
  time: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
  },
  body: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
  },
  photosGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photo: {
    flex: 1,
    height: 128,
    borderRadius: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: `${palette.outlineVariant}4D`,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
  },
  actionTextMuted: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  replyCard: {
    backgroundColor: palette.surfaceContainer,
    padding: spacing.md,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: `${palette.primary}33`,
    gap: spacing.xs,
  },
  replyAuthor: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
  },
  replyBody: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
    fontStyle: 'italic',
  },
});

// ─── Bottom Navigation ────────────────────────────────────────────────────────

const BottomNav: React.FC<{
  activeTab: string;
  onTabPress: (t: string) => void;
}> = ({ activeTab, onTabPress }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[bnStyles.nav, { paddingBottom: insets.bottom + 4 }]}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === activeTab;
        return (
          <TouchableOpacity
            key={item.key}
            style={[bnStyles.item, isActive && bnStyles.itemActive]}
            onPress={() => onTabPress(item.key)}
            activeOpacity={0.75}
          >
            <MaterialIcons
              name={item.icon as any}
              size={24}
              color={isActive ? palette.primary : palette.onSurfaceVariant}
            />
            <Text style={[bnStyles.label, isActive && bnStyles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const bnStyles = StyleSheet.create({
  nav: {
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
  item: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.base,
    paddingVertical: spacing.base,
  },
  itemActive: {
    backgroundColor: `${palette.primaryContainer}1A`,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
  },
  labelActive: {
    color: palette.primary,
    fontWeight: '700',
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export interface ProfessionalReviewsScreenProps {
  onBack: () => void;
  onNavigate: (tab: string) => void;
}

const ProfessionalReviewsScreen: React.FC<ProfessionalReviewsScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const [activeTab, setActiveTab] = useState('profile');

  // Animations
  const overviewOpacity = useRef(new Animated.Value(0)).current;
  const overviewSlide = useRef(new Animated.Value(16)).current;
  const cardOpacities = useRef(REVIEWS.map(() => new Animated.Value(0))).current;
  const cardTranslates = useRef(
    REVIEWS.map(() => new Animated.Value(16))
  ).current;

  useEffect(() => {
    // Overview section
    Animated.parallel([
      Animated.timing(overviewOpacity, {
        toValue: 1,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(overviewSlide, {
        toValue: 0,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Cards stagger
    Animated.parallel(
      cardOpacities.map((op, i) =>
        Animated.parallel([
          Animated.timing(op, {
            toValue: 1,
            duration: 450,
            delay: 300 + i * 120,
            useNativeDriver: true,
          }),
          Animated.timing(cardTranslates[i], {
            toValue: 0,
            duration: 450,
            delay: 300 + i * 120,
            useNativeDriver: true,
          }),
        ])
      )
    ).start();
  }, []);

  const BOTTOM_NAV_H = 64 + insets.bottom;

  return (
    <View style={[revStyles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={revStyles.header}>
        <View style={revStyles.headerLeft}>
          <TouchableOpacity onPress={onBack} style={revStyles.backBtn} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={palette.primary} />
          </TouchableOpacity>
          <Text style={revStyles.headerTitle}>Reviews</Text>
        </View>
        <Image
          source={{
            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3qEbyyrxTO64Gf3mTd24OTE1j9RbVpOjHJpw-njzzoeLJz6PH1xB0bNIh2aT3g5BXKMiY-6LXL_tvil85P7WHSyaU8hhyQQnsmbl6Ay44fuCf-LWJ9HQqnXY0taiJyxMwNwtnQJjjhXZeW2ONfxcVaCtoaZEd1IM6mu9Zf8QHyoJhD6rWTfUegQR_II9HAu_hih8Fefwr8xCb-zuDJenksGtusErMTYgJTu4SjPYOq_fidWS7CSVbCnZA5mLEBhGpjiDbTs6bxQ78',
          }}
          style={revStyles.headerAvatar}
          resizeMode="cover"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          revStyles.scrollContent,
          { paddingBottom: BOTTOM_NAV_H + spacing.xl },
        ]}
      >
        {/* Rating Overview */}
        <Animated.View
          style={[
            revStyles.overviewCard,
            {
              opacity: overviewOpacity,
              transform: [{ translateY: overviewSlide }],
            },
          ]}
        >
          {/* Big score */}
          <View style={revStyles.scoreBlock}>
            <Text style={revStyles.bigScore}>4.9</Text>
            <StarRow count={5} size={22} />
            <Text style={revStyles.reviewCount}>128 Reviews</Text>
          </View>

          {/* Divider */}
          <View style={revStyles.overviewDivider} />

          {/* Bar chart */}
          <View style={revStyles.barsBlock}>
            {RATING_BARS.map((r) => (
              <RatingBar key={r.star} star={r.star} percent={r.percent} />
            ))}
          </View>
        </Animated.View>

        {/* Filter Chips */}
        <Animated.View
          style={[
            {
              opacity: overviewOpacity,
              transform: [{ translateY: overviewSlide }],
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={revStyles.filtersRow}
            style={{ marginHorizontal: -spacing.marginMobile }}
          >
            {FILTER_OPTIONS.map((f) => {
              const isActive = f === activeFilter;
              return (
                <TouchableOpacity
                  key={f}
                  style={[
                    revStyles.filterChip,
                    isActive && revStyles.filterChipActive,
                  ]}
                  onPress={() => setActiveFilter(f)}
                  activeOpacity={0.85}
                >
                  {f === 'With Photos' && (
                    <MaterialIcons
                      name="image"
                      size={14}
                      color={
                        isActive ? palette.onPrimaryContainer : palette.onSurfaceVariant
                      }
                    />
                  )}
                  <Text
                    style={[
                      revStyles.filterChipText,
                      isActive && revStyles.filterChipTextActive,
                    ]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Review Cards */}
        <View style={revStyles.cardsSection}>
          {REVIEWS.map((review, i) => (
            <ReviewCard
              key={review.id}
              review={review}
              opacity={cardOpacities[i]}
              translateY={cardTranslates[i]}
            />
          ))}
        </View>
      </ScrollView>

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

const revStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
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
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  backBtn: { padding: spacing.base, marginLeft: -spacing.base },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.primary,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.surfaceContainerHigh,
  },
  scrollContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  overviewCard: {
    flexDirection: 'row',
    backgroundColor: palette.surfaceContainerLowest,
    padding: spacing.lg,
    borderRadius: 12,
    gap: spacing.lg,
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
  scoreBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingRight: spacing.lg,
  },
  bigScore: {
    fontFamily: 'Inter',
    fontSize: 56,
    fontWeight: '700',
    color: palette.primary,
    lineHeight: 64,
  },
  reviewCount: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
  },
  overviewDivider: {
    width: 1,
    backgroundColor: `${palette.outlineVariant}4D`,
    alignSelf: 'stretch',
  },
  barsBlock: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  filtersRow: {
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.xs,
    paddingBottom: spacing.base,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: 9999,
    backgroundColor: palette.surfaceContainerHigh,
  },
  filterChipActive: {
    backgroundColor: palette.primaryContainer,
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
  cardsSection: {
    gap: spacing.lg,
  },
});

export default ProfessionalReviewsScreen;