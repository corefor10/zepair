// screens/PaymentScreen.tsx
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
  Platform,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme_constant';

const { width: SW } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentTab = 'Cards' | 'UPI' | 'Net Banking' | 'Wallets';
type CardNetwork = 'VISA' | 'MASTERCARD' | 'AMEX' | 'CARD';

const PAYMENT_TABS: PaymentTab[] = ['Cards', 'UPI', 'Net Banking', 'Wallets'];

// ─── Card Preview ─────────────────────────────────────────────────────────────

interface CardPreviewProps {
  number: string;
  name: string;
  expiry: string;
  cardType: CardNetwork;
}

const CardPreview: React.FC<CardPreviewProps> = ({
  number,
  name,
  expiry,
  cardType,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const displayNumber =
    number.trim() ? number : '•••• •••• •••• ••••';
  const displayName = name.trim() ? name.toUpperCase() : 'NAME ON CARD';
  const displayExpiry = expiry.trim() ? expiry : 'MM/YY';

  return (
    <View style={cardStyles.card}>
      <LinearGradient
        colors={[palette.primary, palette.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Decorative orbs */}
      <View style={cardStyles.orb1} />
      <View style={cardStyles.orb2} />

      <View style={cardStyles.topRow}>
        <MaterialIcons name="credit-card" size={36} color="rgba(255,255,255,0.8)" />
        <Text style={cardStyles.cardType}>{cardType}</Text>
      </View>
      <View style={cardStyles.bottomBlock}>
        <Text style={cardStyles.cardNumber}>{displayNumber}</Text>
        <View style={cardStyles.cardFooter}>
          <View>
            <Text style={cardStyles.cardFieldLabel}>Card Holder</Text>
            <Text style={cardStyles.cardFieldValue}>{displayName}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={cardStyles.cardFieldLabel}>Expires</Text>
            <Text style={cardStyles.cardFieldValue}>{displayExpiry}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    width: '100%',
    height: 192,
    borderRadius: 12,
    overflow: 'hidden',
    padding: spacing.lg,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  orb1: {
    position: 'absolute',
    top: -64,
    right: -64,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  orb2: {
    position: 'absolute',
    bottom: -32,
    left: -32,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardType: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
    fontStyle: 'italic',
    color: palette.onPrimary,
    letterSpacing: 2,
  },
  bottomBlock: {},
  cardNumber: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 20,
    color: palette.onPrimary,
    letterSpacing: 4,
    marginBottom: spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardFieldLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardFieldValue: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: palette.onPrimary,
    letterSpacing: 1,
  },
});

// ─── Animated Card Input ──────────────────────────────────────────────────────

const CardInput: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: any;
  secureTextEntry?: boolean;
  maxLength?: number;
  icon?: string;
  flex?: number;
}> = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  maxLength,
  icon,
  flex = 1,
}) => {
  const borderAnim = useRef(new Animated.Value(0)).current;
  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.outlineVariant, palette.primary],
  });

  return (
    <View style={{ flex }}>
      <Text style={ciStyles.label}>{label}</Text>
      <Animated.View style={[ciStyles.inputWrapper, { borderColor }]}>
        {icon && (
          <MaterialIcons
            name={icon as any}
            size={20}
            color={palette.onSurfaceVariant}
            style={ciStyles.icon}
          />
        )}
        <TextInput
          style={[ciStyles.input, icon && { paddingLeft: 0 }]}
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
    </View>
  );
};

const ciStyles = StyleSheet.create({
  label: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
    marginBottom: spacing.base,
    marginLeft: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: palette.surfaceContainerLowest,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  icon: { flexShrink: 0 },
  input: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 14,
    color: palette.onSurface,
    height: '100%',
  },
});

// ─── Success Screen ───────────────────────────────────────────────────────────

const PaymentSuccessScreen: React.FC<{ amount: string; onHome: () => void }> = ({
  amount,
  onHome,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [strokeProgress, setStrokeProgress] = useState(0);
  const strokeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      delay: 100,
      useNativeDriver: true,
    }).start();
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 400,
      delay: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(strokeAnim, {
      toValue: 1,
      duration: 600,
      delay: 500,
      useNativeDriver: false,
    }).start();
    strokeAnim.addListener(({ value }) => setStrokeProgress(value));
    return () => strokeAnim.removeAllListeners();
  }, []);

  const circleStrokeDashoffset = 157 - strokeProgress * 157;
  const checkStrokeDashoffset = 100 - strokeProgress * 100;

  return (
    <View style={successStyles.screen}>
      <Animated.View
        style={[
          successStyles.iconWrapper,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Svg width={96} height={96} viewBox="0 0 52 52">
          <Circle
            cx="26"
            cy="26"
            r="25"
            fill="none"
            stroke="#10b981"
            strokeWidth={3}
            strokeDasharray="157"
            strokeDashoffset={circleStrokeDashoffset}
          />
          <Path
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
            fill="none"
            stroke="#10b981"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="100"
            strokeDashoffset={checkStrokeDashoffset}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={{ opacity: opacityAnim, alignItems: 'center' }}>
        <Text style={successStyles.title}>Payment Successful!</Text>
        <Text style={successStyles.subtitle}>
          Your booking is confirmed. Our technician will reach out shortly.
        </Text>
        <View style={successStyles.receiptCard}>
          <View style={successStyles.receiptRow}>
            <Text style={successStyles.receiptLabel}>Transaction ID</Text>
            <Text style={successStyles.receiptValue}>#ZP992834</Text>
          </View>
          <View style={successStyles.receiptRow}>
            <Text style={successStyles.receiptLabel}>Amount Paid</Text>
            <Text style={[successStyles.receiptValue, { color: palette.primary }]}>
              {amount}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={successStyles.homeBtn} onPress={onHome} activeOpacity={0.85}>
          <Text style={successStyles.homeBtnText}>Return to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const successStyles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.surface,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.marginMobile,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.onSurface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: palette.surfaceContainerLow,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
  },
  receiptValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 14,
    fontWeight: '500',
    color: palette.onSurface,
  },
  homeBtn: {
    width: '100%',
    height: 52,
    backgroundColor: palette.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onPrimary,
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export interface PaymentScreenProps {
  amount?: string;
  onBack: () => void;
  onPaymentSuccess: () => void;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({
  amount = '₹599',
  onBack,
  onPaymentSuccess,
}) => {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<PaymentTab>('Cards');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardType, setCardType] = useState<CardNetwork>('CARD');
  const [saveCard, setSaveCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const ctaScale = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(12)).current;

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

  const handleCardNumberChange = (val: string) => {
    // Format as groups of 4
    const raw = val.replace(/\D/g, '');
    const formatted = raw.match(/.{1,4}/g)?.join(' ') ?? '';
    setCardNumber(formatted);

    // Detect card type
    if (raw.startsWith('4')) setCardType('VISA');
    else if (raw.startsWith('5')) setCardType('MASTERCARD');
    else if (raw.startsWith('3')) setCardType('AMEX');
    else setCardType('CARD');
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '');
    if (raw.length > 2) {
      setCardExpiry(raw.slice(0, 2) + '/' + raw.slice(2, 4));
    } else {
      setCardExpiry(raw);
    }
  };

  const handlePay = () => {
    Animated.sequence([
      Animated.spring(ctaScale, { toValue: 0.97, useNativeDriver: true }),
      Animated.spring(ctaScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
    }, 1800);
  };

  const FOOTER_H = insets.bottom + 52 + 48 + spacing.md * 2 + spacing.lg;

  return (
    <View style={[pyStyles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={pyStyles.header}>
        <View style={pyStyles.headerLeft}>
          <TouchableOpacity onPress={onBack} style={pyStyles.backBtn} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={palette.primary} />
          </TouchableOpacity>
          <Text style={pyStyles.logo}>Zepair</Text>
        </View>
        <View style={pyStyles.avatarBox}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIgqqzR5072OpuCE6U0kgVOf-uDpopg8eXJQXd_gDypVUyHtbyzVQ3fEg1hCuN35ISWk4L2dnhEUiOPFJ7yGUY2vV7I3WFfUGDUmOrVQ9qri_LlQEOSFl9hBE3ivbkcb9preYNwkzvhrv4rk55ISIBIbvjAv0-4ut8TibvgJArgoICcDfSbSUhJk0s8W9jp4MfWsuAKhE5U5HT_Ow7idTkDhr_FfJAcG0iCA0uF6zWMfUQ6pOTGWHZ7ltEysbqPlvVXCr6dwAoo3ZU',
            }}
            style={pyStyles.avatarImg}
            resizeMode="cover"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          pyStyles.scrollContent,
          { paddingBottom: FOOTER_H },
        ]}
      >
        {/* Card Preview */}
        <Animated.View
          style={[
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <CardPreview
            number={cardNumber}
            name={cardName}
            expiry={cardExpiry}
            cardType={cardType}
          />
        </Animated.View>

        {/* Payment Method Tabs */}
        <Animated.View
          style={[
            pyStyles.tabsRow,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          {PAYMENT_TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                style={[pyStyles.tab, isActive && pyStyles.tabActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    pyStyles.tabText,
                    isActive && pyStyles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Card Form */}
        <Animated.View
          style={[
            pyStyles.formSection,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <CardInput
            label="Card Number"
            placeholder="0000 0000 0000 0000"
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            keyboardType="numeric"
            maxLength={19}
            icon="credit-card"
          />

          <CardInput
            label="Account Holder Name"
            placeholder="John Doe"
            value={cardName}
            onChangeText={setCardName}
            keyboardType="default"
          />

          <View style={pyStyles.twoCol}>
            <CardInput
              label="Expiry Date"
              placeholder="MM/YY"
              value={cardExpiry}
              onChangeText={handleExpiryChange}
              keyboardType="numeric"
              maxLength={5}
            />
            <CardInput
              label="CVV"
              placeholder="•••"
              value={cardCVV}
              onChangeText={setCardCVV}
              keyboardType="numeric"
              secureTextEntry
              maxLength={3}
            />
          </View>

          {/* Save card checkbox */}
          <TouchableOpacity
            style={pyStyles.saveCardRow}
            onPress={() => setSaveCard(!saveCard)}
            activeOpacity={0.85}
          >
            <View style={[pyStyles.checkbox, saveCard && pyStyles.checkboxChecked]}>
              {saveCard && (
                <MaterialIcons name="check" size={12} color={palette.onPrimary} />
              )}
            </View>
            <Text style={pyStyles.saveCardText}>
              Securely save card for future bookings
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Trust Badges */}
        <Animated.View
          style={[
            pyStyles.trustSection,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <Text style={pyStyles.trustNote}>
            Your transaction is secured with 256-bit encryption. We do not store
            your full card credentials on our servers.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          pyStyles.footer,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
          <TouchableOpacity
            onPress={handlePay}
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
              colors={[palette.primary, palette.primaryContainer]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={pyStyles.payBtn}
            >
              {isProcessing ? (
                <Text style={pyStyles.payBtnText}>Processing...</Text>
              ) : (
                <>
                  <Text style={pyStyles.payBtnText}>Pay {amount}</Text>
                  <MaterialIcons name="lock" size={20} color={palette.onPrimary} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={pyStyles.trustBadges}>
          <Text style={pyStyles.trustBadgeText}>🔒 PCI DSS Compliant</Text>
          <View style={pyStyles.trustDivider} />
          <Text style={pyStyles.trustBadgeText}>SSL Secure</Text>
        </View>
      </View>

      {/* Success Overlay */}
      {showSuccess && (
        <PaymentSuccessScreen
          amount={amount}
          onHome={onPaymentSuccess}
        />
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const pyStyles = StyleSheet.create({
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
  logo: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.primary,
  },
  avatarBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.outlineVariant,
  },
  avatarImg: { width: '100%', height: '100%' },
  scrollContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    overflow: 'hidden',
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 9999,
    backgroundColor: palette.surfaceContainerHigh,
    flexShrink: 1,
  },
  tabActive: { backgroundColor: palette.primaryContainer },
  tabText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  tabTextActive: { color: palette.onPrimaryContainer },

  // Form
  formSection: { gap: spacing.md },
  twoCol: { flexDirection: 'row', gap: spacing.md },
  saveCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: palette.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  saveCardText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
    flex: 1,
  },

  // Trust
  trustSection: { alignItems: 'center', gap: spacing.md },
  trustNote: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 14,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
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
  payBtn: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  payBtnText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.onPrimary,
  },
  trustBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: spacing.base,
  },
  trustBadgeText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: `${palette.onSurfaceVariant}99`,
  },
  trustDivider: {
    width: 1,
    height: 16,
    backgroundColor: palette.outlineVariant,
  },
});

export default PaymentScreen;