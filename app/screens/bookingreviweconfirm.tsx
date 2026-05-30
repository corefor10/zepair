// screens/BookingReviewConfirmScreen.tsx
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
  TextInput,
  Switch,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme';

const { width: SW } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRICE_ROWS = [
  { label: 'Base Price', value: '₹483.00', isDeduction: false },
  { label: 'Convenience Fee', value: '₹29.00', isDeduction: false },
  { label: 'GST (18%)', value: '₹87.00', isDeduction: false },
  { label: 'Wallet Deduction', value: '- ₹0.00', isDeduction: true },
];

const TOTAL_WITH_WALLET = '₹479.00';
const TOTAL_DEFAULT = '₹599.00';

type PaymentMethod = 'card' | 'upi';

// ─── Animated Input ───────────────────────────────────────────────────────────

const FocusInput: React.FC<{
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: any;
  secureTextEntry?: boolean;
  maxLength?: number;
}> = ({ placeholder, value, onChangeText, keyboardType, secureTextEntry, maxLength }) => {
  const borderAnim = useRef(new Animated.Value(0)).current;

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.outlineVariant, palette.primary],
  });

  return (
    <Animated.View style={[fiStyles.wrapper, { borderColor }]}>
      <TextInput
        style={fiStyles.input}
        placeholder={placeholder}
        placeholderTextColor={`${palette.outline}80`}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
        onFocus={() =>
          Animated.timing(borderAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }).start()
        }
        onBlur={() =>
          Animated.timing(borderAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }).start()
        }
      />
    </Animated.View>
  );
};

const fiStyles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: palette.surfaceContainerLowest,
    height: 48,
    justifyContent: 'center',
  },
  input: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurface,
    paddingHorizontal: spacing.md,
    height: '100%',
  },
});

// ─── Payment Method Radio ─────────────────────────────────────────────────────

const PaymentMethodRow: React.FC<{
  icon: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
  hasBorder?: boolean;
}> = ({ icon, label, selected, onSelect, hasBorder }) => (
  <TouchableOpacity
    style={[pmStyles.row, hasBorder && pmStyles.rowBorder]}
    onPress={onSelect}
    activeOpacity={0.85}
  >
    <View style={pmStyles.left}>
      <MaterialIcons
        name={icon as any}
        size={22}
        color={selected ? palette.primary : palette.onSurfaceVariant}
      />
      <Text style={[pmStyles.label, selected && pmStyles.labelSelected]}>
        {label}
      </Text>
    </View>
    <View style={[pmStyles.radio, selected && pmStyles.radioSelected]}>
      {selected && <View style={pmStyles.radioDot} />}
    </View>
  </TouchableOpacity>
);

const pmStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: `${palette.outlineVariant}33`,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  label: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: palette.onSurface,
  },
  labelSelected: { color: palette.primary },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: palette.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: palette.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.primary,
  },
});

// ─── Price Row ────────────────────────────────────────────────────────────────

const PriceRow: React.FC<{
  label: string;
  value: string;
  isDeduction?: boolean;
  showInfo?: boolean;
}> = ({ label, value, isDeduction, showInfo }) => (
  <View style={prStyles.row}>
    <View style={prStyles.labelWrap}>
      <Text style={prStyles.label}>{label}</Text>
      {showInfo && (
        <MaterialIcons name="info" size={12} color={palette.tertiary} />
      )}
    </View>
    <Text style={[prStyles.value, isDeduction && prStyles.valueDeduction]}>
      {value}
    </Text>
  </View>
);

const prStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
  },
  value: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurface,
  },
  valueDeduction: { color: palette.tertiary },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export interface BookingReviewConfirmScreenProps {
  onBack: () => void;
  onConfirmAndPay: () => void;
}

const BookingReviewConfirmScreen: React.FC<BookingReviewConfirmScreenProps> = ({
  onBack,
  onConfirmAndPay,
}) => {
  const insets = useSafeAreaInsets();

  const [couponCode, setCouponCode] = useState('');
  const [walletEnabled, setWalletEnabled] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalDisplay = walletEnabled ? TOTAL_WITH_WALLET : TOTAL_DEFAULT;

  // Content entrance
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(16)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlide, {
        toValue: 0,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleConfirm = () => {
    Animated.sequence([
      Animated.spring(ctaScale, { toValue: 0.97, useNativeDriver: true }),
      Animated.spring(ctaScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmAndPay();
    }, 1800);
  };

  const FOOTER_H = insets.bottom + 52 + 48 + spacing.md * 2 + spacing.lg;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={palette.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Booking</Text>
        </View>
        <View style={styles.avatarBox}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCabyY63BWcY3MN97vY_xZ5EpU4ZSAwUh29a198CdN22W42VrrE3dCljIzJzkj7rSjAvv-aaQ1LQRNgF8lbBMQ7oXXwWfrfIBv1W5PFbRoi9ESaDctUzuvQxljaupBI8078D3FCyfprsklpQzs_71u7dOBnQE069T71MoJTPt73H2BE6riaGDcda30wjwffF4rubkGNy92l5iZQvmVSDSm4Le2B0qN4lgpXsVAXc4gwJAiQx8gN9Y65pRebZtschJ6lK1Zg6NQdyTy7',
            }}
            style={styles.avatarImg}
            resizeMode="cover"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: FOOTER_H },
        ]}
      >
        {/* Step indicator */}
        <Animated.View
          style={[
            styles.stepIndicator,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <View style={styles.stepCircleDone}>
            <MaterialIcons name="check" size={12} color={palette.onPrimary} />
          </View>
          <View style={styles.stepConnector} />
          <View style={styles.stepCircleActive}>
            <Text style={styles.stepNum}>4</Text>
          </View>
          <Text style={styles.stepLabel}>Step 4 of 4: Confirm Active</Text>
        </Animated.View>

        {/* Pro Mini Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <View style={styles.proRow}>
            <View style={styles.proAvatarWrapper}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDszisYceHdSFYHcSPNiSrJOPiF5gyetT-43K_C4eILmSHCuDJGmq4Rc8ka61ZAFVZSnqSfUJKHxHBFoaepYaVEgKP5r-s9pPa0gh_7Eu9hRy4He3wXbkCku9SmVqHzFM-MPpBuBJAZLiQbPihbjIEf4mA0I9uLxlNRqb2joVgESVIo6m7HDNHX6MK5oFBjBExnuYg97VoqphEAk-zCDM8lFevdjEynSNdGLg47ryrf8lfIaZK6w-SdLPNAptzGgwJT1gW_4Li7QeTS',
                }}
                style={styles.proAvatar}
                resizeMode="cover"
              />
              <View style={styles.proOnlineDot} />
            </View>
            <View style={styles.proInfo}>
              <View style={styles.proNameRow}>
                <Text style={styles.proName}>Arjun Sharma</Text>
                <View style={styles.ratingBadge}>
                  <MaterialIcons name="star" size={12} color="#f59e0b" />
                  <Text style={styles.ratingText}>4.9</Text>
                </View>
              </View>
              <Text style={styles.proSubtitle}>Senior HVAC Specialist • 8 yrs exp.</Text>
              <View style={styles.certRow}>
                <MaterialIcons name="verified" size={14} color={palette.primary} />
                <Text style={styles.certText}>Zepair Certified Pro</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Service Details */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
              gap: spacing.md,
            },
          ]}
        >
          {/* Service name */}
          <View style={styles.serviceRow}>
            <View style={styles.serviceIconBox}>
              <MaterialIcons name="ac-unit" size={22} color={palette.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceLabel}>SERVICE SELECTED</Text>
              <Text style={styles.serviceTitle}>AC Deep Cleaning & Gas Refill</Text>
            </View>
          </View>

          {/* Date / time grid */}
          <View style={[styles.detailGrid, styles.borderTop]}>
            <View style={styles.detailGridItem}>
              <Text style={styles.detailItemLabel}>
                <MaterialIcons name="calendar-today" size={12} /> Date
              </Text>
              <Text style={styles.detailItemValue}>Oct 24, 2023</Text>
            </View>
            <View style={styles.detailGridItem}>
              <Text style={styles.detailItemLabel}>
                <MaterialIcons name="schedule" size={12} /> Time
              </Text>
              <Text style={styles.detailItemValue}>10:00 AM - 11:30 AM</Text>
            </View>
          </View>

          {/* Address */}
          <View style={styles.borderTop}>
            <Text style={styles.detailItemLabel}>
              <MaterialIcons name="location-on" size={12} /> Service Address
            </Text>
            <View style={styles.addressRow}>
              <Text style={styles.addressText}>
                Flat 402, Sapphire Heights, Sector 45, Gurugram, HR 122003
              </Text>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgUM-WxMKu80MO1EgXgMD_4ZyTiXahKbHGWHDPUQxrqZMlM_WU6nLhe2dlflSmVkplcBfjIaeYPhIaNSR3EHEBlXo4HDSsL31oBIEw_CM1GbAXF4TOKFQ-SkARXOh-bvP68TG7M_n8L4ochfBOkXJkkAUHwaKokL5dxAKTinrHpMMrfCjBCICZ9tvENUJoHXpDrDwu_JWr0fRh5Jkz76pRlqPPJz0Ull6FpCQwxg9IcJOu0Tbknsm_XviTVc1qBsSZxvzKhD_SA6ah',
                }}
                style={styles.mapThumb}
                resizeMode="cover"
              />
            </View>
          </View>
        </Animated.View>

        {/* Coupon */}
        <Animated.View
          style={[
            styles.couponRow,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <FocusInput
            placeholder="Apply Coupon Code"
            value={couponCode}
            onChangeText={setCouponCode}
          />
          <TouchableOpacity style={styles.applyBtn} activeOpacity={0.85}>
            <Text style={styles.applyBtnText}>APPLY</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Wallet */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
          ]}
        >
          <View style={styles.walletLeft}>
            <View
              style={[
                styles.walletIconBox,
                { backgroundColor: `${palette.tertiaryFixed}4D` },
              ]}
            >
              <MaterialIcons
                name="account-balance-wallet"
                size={22}
                color={palette.tertiary}
              />
            </View>
            <View>
              <Text style={styles.walletTitle}>Zepair Wallet</Text>
              <Text style={styles.walletBalance}>Balance: ₹120.00</Text>
            </View>
          </View>
          <Switch
            value={walletEnabled}
            onValueChange={setWalletEnabled}
            trackColor={{
              false: palette.surfaceVariant,
              true: palette.primary,
            }}
            thumbColor={palette.surfaceContainerLowest}
          />
        </Animated.View>

        {/* Payment Method */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
              gap: 0,
            },
          ]}
        >
          <Text style={styles.payMethodHeader}>SELECT PAYMENT METHOD</Text>
          <View style={styles.payMethodList}>
            <PaymentMethodRow
              icon="credit-card"
              label="Credit / Debit Card"
              selected={paymentMethod === 'card'}
              onSelect={() => setPaymentMethod('card')}
              hasBorder
            />
            <PaymentMethodRow
              icon="qr-code-2"
              label="UPI (GPay, PhonePe)"
              selected={paymentMethod === 'upi'}
              onSelect={() => setPaymentMethod('upi')}
            />
          </View>
        </Animated.View>

        {/* Price Breakdown */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
              gap: spacing.sm,
            },
          ]}
        >
          <Text style={styles.priceBreakdownHeader}>PRICE BREAKDOWN</Text>
          {PRICE_ROWS.map((row) => (
            <PriceRow
              key={row.label}
              label={row.label}
              value={
                walletEnabled && row.isDeduction ? '- ₹120.00' : row.value
              }
              isDeduction={row.isDeduction}
              showInfo={row.isDeduction}
            />
          ))}
          <View style={styles.priceDivider} />
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{totalDisplay}</Text>
            </View>
            <View style={styles.bestPriceBadge}>
              <MaterialIcons name="sell" size={12} color="#059669" />
              <Text style={styles.bestPriceText}>Best Price Guaranteed</Text>
            </View>
          </View>
        </Animated.View>

        {/* Policy note */}
        <Animated.View
          style={[
            styles.policyRow,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <MaterialIcons name="verified-user" size={20} color={palette.onSurfaceVariant} />
          <Text style={styles.policyText}>
            By continuing, you agree to our{' '}
            <Text style={styles.policyLink}>Booking Policy</Text>. Free
            cancellation up to 2 hours before the scheduled time.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Footer CTA */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
          <TouchableOpacity
            onPress={handleConfirm}
            onPressIn={() =>
              Animated.spring(ctaScale, { toValue: 0.97, useNativeDriver: true }).start()
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
            <LinearGradient
              colors={['#004ac6', '#2563eb']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.ctaBtn}
            >
              <MaterialIcons name="lock" size={20} color={palette.onPrimary} />
              <Text style={styles.ctaText}>
                {isProcessing ? 'Processing...' : `Confirm & Pay ${totalDisplay}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Trust badges row */}
        <View style={styles.trustRow}>
          <Text style={styles.trustText}>🔒 Secure SSL Encryption</Text>
        </View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: palette.primaryFixed,
  },
  avatarImg: { width: '100%', height: '100%' },
  scrollContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  card: {
    backgroundColor: palette.surfaceContainerLowest,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
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

  // Step
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepCircleDone: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepConnector: {
    width: 32,
    height: 2,
    backgroundColor: palette.primary,
  },
  stepCircleActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    color: palette.onPrimary,
  },
  stepLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
    marginLeft: spacing.xs,
  },

  // Pro
  proRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  proAvatarWrapper: { position: 'relative', flexShrink: 0 },
  proAvatar: { width: 64, height: 64, borderRadius: 10 },
  proOnlineDot: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: palette.surfaceContainerLowest,
  },
  proInfo: { flex: 1 },
  proNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  proName: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: palette.surfaceContainerHigh,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  ratingText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    color: palette.onSurface,
  },
  proSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
    marginTop: spacing.base,
  },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  certText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.primary,
  },

  // Service
  serviceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  serviceIconBox: {
    padding: spacing.sm,
    backgroundColor: `${palette.primaryFixed}4D`,
    borderRadius: 10,
  },
  serviceLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
    color: palette.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  serviceTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
    marginTop: spacing.base,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: `${palette.outlineVariant}33`,
    paddingTop: spacing.sm,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  detailGridItem: { flex: 1, gap: spacing.base },
  detailItemLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
  },
  detailItemValue: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: palette.onSurface,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  addressText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurface,
    flex: 1,
  },
  mapThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
  },

  // Coupon
  couponRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    position: 'relative',
  },
  applyBtn: {
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    bottom: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.primaryFixed,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
  },

  // Wallet
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  walletIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletTitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.onSurface,
  },
  walletBalance: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
  },

  // Payment Method
  payMethodHeader: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
    color: palette.onSurfaceVariant,
    textTransform: 'uppercase',
    backgroundColor: palette.surfaceContainerLow,
    marginHorizontal: -spacing.md,
    marginTop: -spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${palette.outlineVariant}33`,
    marginBottom: spacing.xs,
  },
  payMethodList: { gap: 0 },

  // Price Breakdown
  priceBreakdownHeader: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
    color: palette.onSurfaceVariant,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  priceDivider: {
    height: 1,
    backgroundColor: `${palette.outlineVariant}33`,
    marginVertical: spacing.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
  },
  totalValue: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.primary,
  },
  bestPriceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.base,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  bestPriceText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.22,
    color: '#059669',
  },

  // Policy
  policyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  policyText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
    lineHeight: 16,
    flex: 1,
  },
  policyLink: {
    color: palette.primary,
    fontWeight: '700',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderTopWidth: 1,
    borderTopColor: `${palette.outlineVariant}33`,
    gap: spacing.md,
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
  ctaBtn: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  ctaText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.onPrimary,
  },
  trustRow: {
    alignItems: 'center',
    paddingBottom: spacing.base,
  },
  trustText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
  },
});

export default BookingReviewConfirmScreen;