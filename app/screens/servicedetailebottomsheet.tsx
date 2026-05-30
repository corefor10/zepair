// screens/ServiceDetailBottomSheet.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  ScrollView,
  PanResponder,
  Modal,
  Platform,
  Dimensions,
  LayoutAnimation,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme';

const { height: SH, width: SW } = Dimensions.get('window');
const SHEET_HEIGHT = Math.min(SH * 0.95, 813);
const DISMISS_THRESHOLD = 150;

// ─── Data ─────────────────────────────────────────────────────────────────────

const INCLUDED = [
  'Full 21-point system performance diagnostic',
  'Refrigerant level check and leak detection',
  'Air filter replacement (Standard sizes)',
  'Cleaning of condenser coils & debris removal',
];

const NOT_INCLUDED = [
  'Major parts replacement (Compressors, etc.)',
  'Ductwork cleaning or structural repairs',
];

const PRICING_ROWS = [
  { label: 'Diagnostic Visit', price: '$89.00' },
  { label: 'Standard Filter Set', price: '$25.00' },
  { label: 'Labor (Approx. 1.5 hrs)', price: '$120.00' },
];

const FAQS = [
  {
    q: 'How long does the tune-up take?',
    a: 'On average, our diagnostic and tune-up takes between 60 to 90 minutes depending on the accessibility of your unit.',
  },
  {
    q: 'Do you offer a warranty?',
    a: 'Yes, all our tune-up services come with a 30-day "no-breakdown" guarantee. If your system fails within 30 days of service, we return for free.',
  },
];

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────

const FAQItem: React.FC<{ question: string; answer: string }> = ({
  question,
  answer,
}) => {
  const [open, setOpen] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(0);

  const toggle = () => {
    const toValue = open ? 0 : 1;
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: open ? 0 : contentHeight,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    setOpen(!open);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={faqStyles.item}>
      <TouchableOpacity
        style={faqStyles.header}
        onPress={toggle}
        activeOpacity={0.8}
      >
        <Text style={faqStyles.question}>{question}</Text>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <MaterialIcons name="expand-more" size={24} color={palette.onSurface} />
        </Animated.View>
      </TouchableOpacity>
      <Animated.View style={[faqStyles.answerWrapper, { height: heightAnim }]}>
        {/* Invisible measure layer */}
        <View
          style={faqStyles.answerMeasure}
          onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
        >
          <Text style={faqStyles.answer}>{answer}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const faqStyles = StyleSheet.create({
  item: {
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: palette.surfaceBright,
  },
  question: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
    flex: 1,
    marginRight: spacing.sm,
  },
  answerWrapper: {
    overflow: 'hidden',
  },
  answerMeasure: {
    position: 'absolute',
    width: '100%',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: `${palette.outlineVariant}33`,
    backgroundColor: palette.surfaceContainerLowest,
  },
  answer: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
  },
});

// ─── Included / Not Included List ────────────────────────────────────────────

const InclusionList: React.FC<{
  title: string;
  items: string[];
  isPositive: boolean;
}> = ({ title, items, isPositive }) => (
  <View style={inclStyles.card}>
    <View style={inclStyles.titleRow}>
      <MaterialIcons
        name={isPositive ? 'check-circle' : 'cancel'}
        size={22}
        color={isPositive ? palette.primary : palette.error}
      />
      <Text style={inclStyles.title}>{title}</Text>
    </View>
    {items.map((item, i) => (
      <View key={i} style={inclStyles.row}>
        <MaterialIcons
          name={isPositive ? 'check' : 'close'}
          size={18}
          color={isPositive ? palette.primary : palette.error}
          style={{ marginTop: 2 }}
        />
        <Text style={inclStyles.text}>{item}</Text>
      </View>
    ))}
  </View>
);

const inclStyles = StyleSheet.create({
  card: {
    backgroundColor: palette.surfaceBright,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  text: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
    flex: 1,
  },
});

// ─── Pricing Table ────────────────────────────────────────────────────────────

const PricingTable: React.FC = () => (
  <View style={tableStyles.container}>
    {/* Header */}
    <View style={tableStyles.header}>
      <Text style={tableStyles.headerCell}>SERVICE ITEM</Text>
      <Text style={[tableStyles.headerCell, tableStyles.headerRight]}>PRICE</Text>
    </View>
    {/* Rows */}
    {PRICING_ROWS.map((row, i) => (
      <View
        key={row.label}
        style={[
          tableStyles.row,
          i < PRICING_ROWS.length - 1 && tableStyles.rowBorder,
        ]}
      >
        <Text style={tableStyles.rowLabel}>{row.label}</Text>
        <Text style={tableStyles.rowPrice}>{row.price}</Text>
      </View>
    ))}
    {/* Total row */}
    <View style={[tableStyles.row, tableStyles.totalRow]}>
      <Text style={tableStyles.totalLabel}>Total Estimate</Text>
      <Text style={tableStyles.totalPrice}>$234.00</Text>
    </View>
  </View>
);

const tableStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: palette.surfaceContainerLow,
  },
  headerCell: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
  },
  headerRight: { textAlign: 'right' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: `${palette.outlineVariant}33`,
  },
  rowLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurface,
  },
  rowPrice: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurface,
  },
  totalRow: {
    backgroundColor: `${palette.primary}0D`,
  },
  totalLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
  },
  totalPrice: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: palette.primary,
  },
});

// ─── Main Bottom Sheet ────────────────────────────────────────────────────────

interface ServiceDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddToBooking: () => void;
  onViewSimilar: () => void;
}

const ServiceDetailBottomSheet: React.FC<ServiceDetailBottomSheetProps> = ({
  visible,
  onClose,
  onAddToBooking,
  onViewSimilar,
}) => {
  const insets = useSafeAreaInsets();
  const [isFavorited, setIsFavorited] = useState(false);

  // Sheet animation
  const sheetY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const favScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(sheetY, {
          toValue: 0,
          friction: 10,
          tension: 55,
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
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  }, [onClose]);

  // Drag-to-dismiss
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 5,
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

  const handleFavorite = () => {
    Animated.sequence([
      Animated.spring(favScaleAnim, {
        toValue: 1.3,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(favScaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    setIsFavorited(!isFavorited);
  };

  const FOOTER_HEIGHT = insets.bottom + 52 + spacing.md + spacing.lg + 32;

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
        style={[detailStyles.backdrop, { opacity: backdropOpacity }]}
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
          detailStyles.sheet,
          { transform: [{ translateY: sheetY }] },
        ]}
      >
        {/* Drag Handle */}
        <View style={detailStyles.handleArea} {...panResponder.panHandlers}>
          <View style={detailStyles.handle} />
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={detailStyles.scrollView}
          contentContainerStyle={[
            detailStyles.scrollContent,
            { paddingBottom: FOOTER_HEIGHT },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Hero Image */}
          <View style={detailStyles.imageWrapper}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHi8D9kDA2LWgLUuqi_hgnjlqWoZa2rQeOrH0rGPXHX022LUxogWxXjNKxauh1-lF0_sJzwN-kKs9o6xnzG4dvVxMlWfqlgvL_lTWxmE9tZ4y-J8Stvqwn53HlmJQEUHWjo1jsReQ73x97I4mBOYXah_AOLLKxA8jL9Pr8nkq2_6c-zr0o2Yf605MGXdRDDvw50_i6qmlrkZsjJsd-4ggD3fveFHuz9Yyd7AaXn7WNBqAdAcLj72u7jMpg4zTIfqtbH00jZgv5Ortr',
              }}
              style={detailStyles.heroImage}
              resizeMode="cover"
            />
            {/* Favorite button */}
            <Animated.View
              style={[
                detailStyles.favBtn,
                { transform: [{ scale: favScaleAnim }] },
              ]}
            >
              <TouchableOpacity
                style={detailStyles.favBtnInner}
                onPress={handleFavorite}
                activeOpacity={0.85}
              >
                <MaterialIcons
                  name={isFavorited ? 'favorite' : 'favorite-border'}
                  size={22}
                  color={isFavorited ? palette.error : palette.primary}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Title Block */}
          <View style={detailStyles.titleBlock}>
            <View style={detailStyles.titleBadgesRow}>
              <View style={detailStyles.bestsellerBadge}>
                <Text style={detailStyles.bestsellerText}>BESTSELLER</Text>
              </View>
              <View style={detailStyles.ratingRow}>
                <MaterialIcons name="star" size={13} color={palette.tertiary} />
                <Text style={detailStyles.ratingText}>4.9 (128 reviews)</Text>
              </View>
            </View>
            <Text style={detailStyles.serviceTitle}>
              Premium HVAC Diagnostic & Tune-up
            </Text>
            <Text style={detailStyles.serviceDescription}>
              Ensure your home remains a sanctuary of comfort with our
              comprehensive diagnostic service. Our certified technicians perform
              a 21-point inspection to optimize efficiency, identify potential
              failures, and extend the lifespan of your cooling system.
            </Text>
          </View>

          {/* Included / Not Included */}
          <View style={detailStyles.section}>
            <InclusionList
              title="What's included"
              items={INCLUDED}
              isPositive
            />
          </View>
          <View style={detailStyles.section}>
            <InclusionList
              title="What's not included"
              items={NOT_INCLUDED}
              isPositive={false}
            />
          </View>

          {/* Pricing Table */}
          <View style={detailStyles.section}>
            <Text style={detailStyles.sectionTitle}>Estimated Pricing</Text>
            <PricingTable />
          </View>

          {/* FAQ */}
          <View style={detailStyles.section}>
            <Text style={detailStyles.sectionTitle}>
              Frequently Asked Questions
            </Text>
            <View style={detailStyles.faqList}>
              {FAQS.map((faq) => (
                <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Sticky Footer */}
        <View
          style={[
            detailStyles.footer,
            { paddingBottom: insets.bottom + spacing.md },
          ]}
        >
          <TouchableOpacity
            style={detailStyles.addToBookingBtn}
            onPress={onAddToBooking}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[palette.primary, palette.primaryContainer]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={detailStyles.addToBookingGradient}
            >
              <MaterialIcons name="add-task" size={20} color={palette.onPrimary} />
              <Text style={detailStyles.addToBookingText}>Add to Booking</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={onViewSimilar} activeOpacity={0.7}>
            <Text style={detailStyles.viewSimilarText}>View Similar Services</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const detailStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(38,38,38,0.45)',
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
    overflow: 'hidden',
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
    flexShrink: 0,
  },
  handle: {
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: `${palette.outlineVariant}99`,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.marginMobile,
  },

  // ── Image ─────────────────────────────────────────────────────────────────
  imageWrapper: {
    width: '100%',
    height: 224,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    marginTop: spacing.base,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  favBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  favBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(250,248,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },

  // ── Title Block ───────────────────────────────────────────────────────────
  titleBlock: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  titleBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bestsellerBadge: {
    backgroundColor: `${palette.primary}1A`,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestsellerText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.tertiary,
  },
  serviceTitle: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.onSurface,
    lineHeight: 32,
  },
  serviceDescription: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
  },

  // ── Sections ──────────────────────────────────────────────────────────────
  section: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
  },
  faqList: {
    gap: spacing.sm,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    backgroundColor: palette.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: `${palette.outlineVariant}33`,
    gap: spacing.md,
    alignItems: 'center',
  },
  addToBookingBtn: {
    width: '100%',
    borderRadius: 12,
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
  addToBookingGradient: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: 12,
  },
  addToBookingText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onPrimary,
  },
  viewSimilarText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
    textDecorationLine: 'underline',
    paddingVertical: spacing.xs,
  },
});

export default ServiceDetailBottomSheet;