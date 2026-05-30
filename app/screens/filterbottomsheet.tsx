// screens/FiltersBottomSheetScreen.tsx
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
  PanResponder,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme';

const { height: SH, width: SW } = Dimensions.get('window');
const SHEET_HEIGHT = Math.min(SH * 0.88, 795);
const DISMISS_THRESHOLD = 150;

// ─── Types ────────────────────────────────────────────────────────────────────

type SortOption = 'Popularity' | 'Price: Low to High' | 'Price: High to Low' | 'Rating: High to Low';
type RatingOption = 'Any' | '4+' | '3+' | '2+';
type AvailabilityOption = 'Available Today' | 'Within 24 Hours' | 'Weekend Only';
type PrefOption = 'No Preference' | 'Male' | 'Female';

const SORT_OPTIONS: SortOption[] = [
  'Popularity',
  'Price: Low to High',
  'Price: High to Low',
  'Rating: High to Low',
];
const RATING_OPTIONS: RatingOption[] = ['Any', '4+', '3+', '2+'];
const AVAILABILITY_OPTIONS: AvailabilityOption[] = [
  'Available Today',
  'Within 24 Hours',
  'Weekend Only',
];
const PREF_OPTIONS: { key: PrefOption; icon: string }[] = [
  { key: 'No Preference', icon: 'person' },
  { key: 'Male', icon: 'male' },
  { key: 'Female', icon: 'female' },
];

// ─── Price Range Slider ───────────────────────────────────────────────────────

const PriceRangeSlider: React.FC<{
  value: number;
  onChange: (v: number) => void;
}> = ({ value, onChange }) => {
  const trackWidth = SW - spacing.marginMobile * 2;
  const thumbX = useRef(new Animated.Value((value / 10000) * trackWidth)).current;
  const [displayValue, setDisplayValue] = useState(value);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gs) => {
      const rawX = Math.max(0, Math.min(gs.moveX - spacing.marginMobile, trackWidth));
      thumbX.setValue(rawX);
      const newValue = Math.round((rawX / trackWidth) * 10000 / 100) * 100;
      setDisplayValue(newValue);
      onChange(newValue);
    },
  });

  const fillWidth = thumbX;

  return (
    <View style={sliderStyles.container}>
      {/* Track */}
      <View style={sliderStyles.track}>
        {/* Fill */}
        <Animated.View style={[sliderStyles.fill, { width: fillWidth }]} />
        {/* Thumb */}
        <Animated.View
          style={[sliderStyles.thumb, { transform: [{ translateX: thumbX }] }]}
          {...panResponder.panHandlers}
        />
      </View>
      {/* Labels */}
      <View style={sliderStyles.labels}>
        <Text style={sliderStyles.label}>₹0</Text>
        <Text style={sliderStyles.label}>₹10,000</Text>
      </View>
    </View>
  );
};

const sliderStyles = StyleSheet.create({
  container: { paddingTop: spacing.md, paddingBottom: spacing.xs },
  track: {
    height: 4,
    backgroundColor: `${palette.outlineVariant}80`,
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 4,
    backgroundColor: palette.primary,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.primary,
    borderWidth: 2,
    borderColor: palette.surfaceContainerLowest,
    top: -10,
    left: -12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.outline,
  },
});

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={sectionHeaderStyles.text}>{title}</Text>
);

const sectionHeaderStyles = StyleSheet.create({
  text: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
    marginBottom: spacing.md,
  },
});

// ─── Main Bottom Sheet ────────────────────────────────────────────────────────

interface FiltersBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  resultCount?: number;
}

const FiltersBottomSheet: React.FC<FiltersBottomSheetProps> = ({
  visible,
  onClose,
  onApply,
  resultCount = 148,
}) => {
  const insets = useSafeAreaInsets();

  const [sortBy, setSortBy] = useState<SortOption>('Popularity');
  const [priceMax, setPriceMax] = useState(10000);
  const [rating, setRating] = useState<RatingOption>('4+');
  const [availability, setAvailability] =
    useState<AvailabilityOption>('Available Today');
  const [expertChecked, setExpertChecked] = useState(false);
  const [intermediateChecked, setIntermediateChecked] = useState(false);
  const [pref, setPref] = useState<PrefOption>('No Preference');

  // Sheet animation
  const sheetY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const dragOffset = useRef(0);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(sheetY, {
          toValue: 0,
          friction: 10,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const dismissSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(sheetY, {
        toValue: SHEET_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  }, [onClose]);

  // Drag-to-dismiss via PanResponder on the handle
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 5,
    onPanResponderGrant: () => {
      dragOffset.current = 0;
    },
    onPanResponderMove: (_, gs) => {
      if (gs.dy > 0) {
        sheetY.setValue(gs.dy);
        backdropOpacity.setValue(Math.max(0, 1 - gs.dy / SHEET_HEIGHT));
      }
    },
    onPanResponderRelease: (_, gs) => {
      if (gs.dy > DISMISS_THRESHOLD) {
        dismissSheet();
      } else {
        Animated.spring(sheetY, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }).start();
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleApply = () => {
    dismissSheet();
    onApply({ sortBy, priceMax, rating, availability, expertChecked, intermediateChecked, pref });
  };

  const handleReset = () => {
    setSortBy('Popularity');
    setPriceMax(10000);
    setRating('4+');
    setAvailability('Available Today');
    setExpertChecked(false);
    setIntermediateChecked(false);
    setPref('No Preference');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismissSheet}
    >
      {/* Backdrop */}
      <Animated.View
        style={[sheetStyles.backdrop, { opacity: backdropOpacity }]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={dismissSheet}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          sheetStyles.sheet,
          { transform: [{ translateY: sheetY }] },
        ]}
      >
        {/* Drag Handle */}
        <View style={sheetStyles.handleArea} {...panResponder.panHandlers}>
          <View style={sheetStyles.handle} />
        </View>

        {/* Header */}
        <View style={sheetStyles.sheetHeader}>
          <Text style={sheetStyles.sheetTitle}>Filters</Text>
          <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
            <Text style={sheetStyles.resetText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable content */}
        <ScrollView
          style={sheetStyles.scrollView}
          contentContainerStyle={sheetStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Sort By ── */}
          <View style={sheetStyles.section}>
            <SectionHeader title="Sort By" />
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={sheetStyles.radioRow}
                onPress={() => setSortBy(opt)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    sheetStyles.radioLabel,
                    sortBy === opt && sheetStyles.radioLabelActive,
                  ]}
                >
                  {opt}
                </Text>
                <View
                  style={[
                    sheetStyles.radioCircle,
                    sortBy === opt && sheetStyles.radioCircleActive,
                  ]}
                >
                  {sortBy === opt && <View style={sheetStyles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Price Range ── */}
          <View style={sheetStyles.section}>
            <View style={sheetStyles.sectionTitleRow}>
              <SectionHeader title="Price Range" />
              <Text style={sheetStyles.priceValue}>
                ₹0 - ₹{priceMax.toLocaleString()}
              </Text>
            </View>
            <PriceRangeSlider value={priceMax} onChange={setPriceMax} />
          </View>

          {/* ── Rating ── */}
          <View style={sheetStyles.section}>
            <SectionHeader title="Customer Rating" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.xs }}
            >
              {RATING_OPTIONS.map((opt) => {
                const isActive = rating === opt;
                const hasStars = opt !== 'Any';
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      sheetStyles.ratingChip,
                      isActive && sheetStyles.ratingChipActive,
                    ]}
                    onPress={() => setRating(opt)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        sheetStyles.ratingChipText,
                        isActive && sheetStyles.ratingChipTextActive,
                      ]}
                    >
                      {hasStars ? opt.replace('+', '') : opt}
                    </Text>
                    {hasStars && (
                      <MaterialIcons
                        name="star"
                        size={14}
                        color={isActive ? palette.primary : palette.onSurfaceVariant}
                      />
                    )}
                    {hasStars && (
                      <Text
                        style={[
                          sheetStyles.ratingChipText,
                          isActive && sheetStyles.ratingChipTextActive,
                        ]}
                      >
                        +
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Availability ── */}
          <View style={sheetStyles.section}>
            <SectionHeader title="Availability" />
            <View style={sheetStyles.chipWrap}>
              {AVAILABILITY_OPTIONS.map((opt) => {
                const isActive = availability === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      sheetStyles.availChip,
                      isActive && sheetStyles.availChipActive,
                    ]}
                    onPress={() => setAvailability(opt)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        sheetStyles.availChipText,
                        isActive && sheetStyles.availChipTextActive,
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Experience Level ── */}
          <View style={sheetStyles.section}>
            <SectionHeader title="Experience Level" />
            <View style={sheetStyles.checkGrid}>
              {[
                { key: 'expert', label: 'Expert (5+ yrs)', checked: expertChecked, onToggle: () => setExpertChecked(!expertChecked) },
                { key: 'inter', label: 'Intermediate', checked: intermediateChecked, onToggle: () => setIntermediateChecked(!intermediateChecked) },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    sheetStyles.checkCard,
                    item.checked && sheetStyles.checkCardActive,
                  ]}
                  onPress={item.onToggle}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      sheetStyles.checkBox,
                      item.checked && sheetStyles.checkBoxChecked,
                    ]}
                  >
                    {item.checked && (
                      <MaterialIcons name="check" size={14} color={palette.onPrimary} />
                    )}
                  </View>
                  <Text style={sheetStyles.checkLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Professional Preference ── */}
          <View style={[sheetStyles.section, { marginBottom: 100 }]}>
            <SectionHeader title="Professional Preference" />
            <View style={sheetStyles.prefRow}>
              {PREF_OPTIONS.map((opt) => {
                const isActive = pref === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      sheetStyles.prefCard,
                      isActive && sheetStyles.prefCardActive,
                    ]}
                    onPress={() => setPref(opt.key)}
                    activeOpacity={0.85}
                  >
                    <MaterialIcons
                      name={opt.icon as any}
                      size={24}
                      color={isActive ? palette.primary : palette.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        sheetStyles.prefLabel,
                        isActive && sheetStyles.prefLabelActive,
                      ]}
                    >
                      {opt.key}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Footer Apply Button */}
        <View
          style={[
            sheetStyles.footer,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
        >
          <TouchableOpacity
            style={sheetStyles.applyBtnWrapper}
            onPress={handleApply}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[palette.primary, palette.primaryContainer]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={sheetStyles.applyBtn}
            >
              <Text style={sheetStyles.applyBtnText}>Apply Filters</Text>
              <View style={sheetStyles.applyBadge}>
                <Text style={sheetStyles.applyBadgeText}>
                  {resultCount} Results
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const sheetStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(25,27,35,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: palette.surfaceContainerLowest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'column',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: { elevation: 24 },
    }),
  },
  handleArea: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: `${palette.outlineVariant}99`,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${palette.outlineVariant}4D`,
  },
  sheetTitle: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.onBackground,
  },
  resetText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.base,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
  },
  section: { marginBottom: spacing.xl },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  priceValue: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: palette.primary,
  },

  // ── Sort ──────────────────────────────────────────────────────────────────
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  radioLabel: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
  },
  radioLabelActive: {
    color: palette.primary,
    fontWeight: '500',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: palette.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: palette.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.primary,
  },

  // ── Rating Chips ──────────────────────────────────────────────────────────
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: palette.surfaceContainer,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  ratingChipActive: {
    backgroundColor: `${palette.primary}0D`,
    borderColor: palette.primary,
  },
  ratingChipText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  ratingChipTextActive: {
    color: palette.primary,
  },

  // ── Availability ──────────────────────────────────────────────────────────
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  availChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 9999,
    backgroundColor: palette.surfaceContainer,
  },
  availChipActive: {
    backgroundColor: `${palette.primary}0D`,
    borderWidth: 1,
    borderColor: palette.primary,
  },
  availChipText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  availChipTextActive: {
    color: palette.primary,
  },

  // ── Experience ────────────────────────────────────────────────────────────
  checkGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  checkCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surfaceContainerLowest,
  },
  checkCardActive: {
    borderColor: palette.primary,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: palette.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxChecked: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  checkLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: palette.onSurface,
  },

  // ── Preference ────────────────────────────────────────────────────────────
  prefRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  prefCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: palette.surfaceContainer,
    gap: spacing.base,
  },
  prefCardActive: {
    borderColor: palette.primary,
    backgroundColor: `${palette.primary}0D`,
  },
  prefLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
    textAlign: 'center',
  },
  prefLabelActive: {
    fontWeight: '700',
    color: palette.primary,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: `${palette.outlineVariant}4D`,
    backgroundColor: palette.surfaceContainerLowest,
  },
  applyBtnWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
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
  applyBtn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: 14,
  },
  applyBtnText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onPrimary,
  },
  applyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  applyBadgeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    color: palette.onPrimary,
  },
});

export default FiltersBottomSheet;