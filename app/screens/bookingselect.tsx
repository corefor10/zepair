// screens/BookingSelectAddressScreen.tsx
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
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme';

const { width: SW } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { step: 1, label: 'Address' },
  { step: 2, label: 'Schedule' },
  { step: 3, label: 'Details' },
  { step: 4, label: 'Confirm' },
] as const;

type AddressId = 'home' | 'office';

const ADDRESSES: {
  id: AddressId;
  label: string;
  address: string;
  icon: string;
}[] = [
  {
    id: 'home',
    label: 'Home',
    address: '245 E 50th St, New York, NY 10022',
    icon: 'home',
  },
  {
    id: 'office',
    label: 'Office',
    address: '40 Wall St, New York, NY 10005',
    icon: 'work',
  },
];

const MAP_IMAGE_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAFtp6jNpUvjr_vUTmdR04XWFlSE-9dcTm0ffOFV-AIei3S2Y50-s3W_bsHroZn0NG_KOdcCdh6n0ez61T5OOZPtZ5vcUky_d0tRdJUg5rOlNwmDMahA5gYS0KtcIeOxnfg0cRRxW1kpBgyjb3ZJEKQxz1b-svbFUPWwPJFRNblXsUTHlc0kcOH5wZKrV-viT5IoS1qXEZIk9ak9V8AsBAqy2ZCNQL6KUkb6x3qmns6-9oliCpFdMotRHb7HA9XhPGEkiGHJnNi1waC';

// ─── Progress Stepper ─────────────────────────────────────────────────────────

const ProgressStepper: React.FC<{ currentStep: number }> = ({
  currentStep,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={stepStyles.row}
    style={stepStyles.scrollView}
  >
    {STEPS.map((item, index) => {
      const isActive = item.step === currentStep;
      const isDone = item.step < currentStep;
      const isLast = index === STEPS.length - 1;

      return (
        <React.Fragment key={item.step}>
          <View style={stepStyles.stepItem}>
            <View
              style={[
                stepStyles.circle,
                isActive && stepStyles.circleActive,
                isDone && stepStyles.circleDone,
              ]}
            >
              {isDone ? (
                <MaterialIcons name="check" size={14} color={palette.onPrimary} />
              ) : (
                <Text
                  style={[
                    stepStyles.number,
                    (isActive || isDone) && stepStyles.numberActive,
                  ]}
                >
                  {item.step}
                </Text>
              )}
            </View>
            <Text
              style={[
                stepStyles.label,
                isActive && stepStyles.labelActive,
              ]}
            >
              {item.label}
            </Text>
          </View>
          {!isLast && (
            <View
              style={[
                stepStyles.connector,
                isDone && stepStyles.connectorDone,
              ]}
            />
          )}
        </React.Fragment>
      );
    })}
  </ScrollView>
);

const stepStyles = StyleSheet.create({
  scrollView: { marginBottom: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  stepItem: { alignItems: 'center', gap: spacing.xs, minWidth: 70 },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: { backgroundColor: palette.primary },
  circleDone: { backgroundColor: palette.primary },
  number: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.onSurfaceVariant,
  },
  numberActive: { color: palette.onPrimary },
  label: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
  },
  labelActive: { color: palette.primary, fontWeight: '700' },
  connector: {
    width: 32,
    height: 2,
    backgroundColor: palette.surfaceContainerHigh,
    marginBottom: spacing.lg,
  },
  connectorDone: { backgroundColor: palette.primary },
});

// ─── Address Card ─────────────────────────────────────────────────────────────

interface AddressCardProps {
  item: (typeof ADDRESSES)[number];
  selected: boolean;
  onSelect: () => void;
}

const AddressCard: React.FC<AddressCardProps> = ({
  item,
  selected,
  onSelect,
}) => {
  const borderAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: selected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [selected]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', palette.primary],
  });

  return (
    <Animated.View
      style={[
        addrStyles.card,
        { borderColor, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={addrStyles.inner}
        onPress={onSelect}
        onPressIn={() =>
          Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
          }).start()
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
        {/* Icon */}
        <View
          style={[
            addrStyles.iconBox,
            selected
              ? { backgroundColor: `${palette.primaryContainer}1A` }
              : { backgroundColor: palette.surfaceContainerHigh },
          ]}
        >
          <MaterialIcons
            name={item.icon as any}
            size={22}
            color={selected ? palette.primary : palette.onSurfaceVariant}
          />
        </View>

        {/* Content */}
        <View style={addrStyles.content}>
          <View style={addrStyles.labelRow}>
            <Text style={addrStyles.label}>{item.label}</Text>
            {/* Custom radio */}
            <View
              style={[
                addrStyles.radio,
                selected && addrStyles.radioSelected,
              ]}
            >
              {selected && <View style={addrStyles.radioDot} />}
            </View>
          </View>
          <Text style={addrStyles.address}>{item.address}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const addrStyles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: palette.surfaceContainerLowest,
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
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.onSurface,
  },
  address: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: palette.outline,
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

// ─── Map Preview ──────────────────────────────────────────────────────────────

const MapPreview: React.FC<{ uri: string }> = ({ uri }) => {
  const imageOpacity = useRef(new Animated.Value(1)).current;
  const pinScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bounce pin in
    Animated.spring(pinScale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [uri]);

  return (
    <View style={mapStyles.container}>
      <Animated.Image
        source={{ uri }}
        style={[mapStyles.image, { opacity: imageOpacity }]}
        resizeMode="cover"
      />
      <View style={mapStyles.dimOverlay} />
      {/* Pin */}
      <View style={mapStyles.pinAnchor}>
        <Animated.View
          style={[
            mapStyles.pinCircle,
            { transform: [{ scale: pinScale }] },
          ]}
        >
          <MaterialIcons
            name="location-on"
            size={16}
            color={palette.onPrimary}
          />
        </Animated.View>
        <View style={mapStyles.pinTail} />
      </View>
    </View>
  );
};

const mapStyles = StyleSheet.create({
  container: {
    height: 192,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surfaceContainerHigh,
    position: 'relative',
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
  image: { width: '100%', height: '100%' },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  pinAnchor: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -40 }],
    alignItems: 'center',
  },
  pinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.surfaceContainerLowest,
    ...Platform.select({
      ios: {
        shadowColor: palette.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  pinTail: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.primary,
    marginTop: -2,
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export interface BookingSelectAddressScreenProps {
  currentStep?: number;
  onClose: () => void;
  onConfirm: (addressId: AddressId) => void;
  onAddNew: () => void;
}

const BookingSelectAddressScreen: React.FC<BookingSelectAddressScreenProps> = ({
  currentStep = 1,
  onClose,
  onConfirm,
  onAddNew,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState<AddressId>('home');

  // Entrance animations
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(16)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlide, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleConfirm = () => {
    Animated.sequence([
      Animated.spring(ctaScale, { toValue: 0.96, useNativeDriver: true }),
      Animated.spring(ctaScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(() => onConfirm(selectedId));
  };

  const FOOTER_H = insets.bottom + 52 + spacing.md + spacing.marginMobile;

  return (
    <View style={[bkStyles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={bkStyles.header}>
        <View style={bkStyles.headerLeft}>
          <TouchableOpacity
            onPress={onClose}
            style={bkStyles.closeBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={24} color={palette.primary} />
          </TouchableOpacity>
          <Text style={bkStyles.logo}>Zepair</Text>
        </View>
        <View style={bkStyles.avatarBox}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiSz63hsff9tmg80Mya28brfdEgJO4ViLMGrSZaMFVliV7zDo1_3RR6iRFLpyz6djoFar2w0-y14mp3exGVeDUwnzf-lfnnepOPjkl0fkzOoNXtkgOtDZwlMuSYirUzy-mXZO60fsSiyWqnGPx5FzoSx9eZbgQz5-AoBQOx9ZooUI7ZLr3sn1LY7TfutKxPKaHKtKrMqM1iDgkkdQSDRPFVIdaxZiVo3fRgQFxE563P3xlQmYkLh-undTXNplCiXCjhOUhwjmQg9R7',
            }}
            style={bkStyles.avatarImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          bkStyles.scrollContent,
          { paddingBottom: FOOTER_H },
        ]}
      >
        {/* Progress */}
        <ProgressStepper currentStep={currentStep} />

        {/* Page title */}
        <Animated.View
          style={[
            bkStyles.titleBlock,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <Text style={bkStyles.pageTitle}>Service Address</Text>
          <Text style={bkStyles.pageSubtitle}>
            Where do you need the service?
          </Text>
        </Animated.View>

        {/* Address cards */}
        <Animated.View
          style={[
            bkStyles.addrList,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          {ADDRESSES.map((addr) => (
            <AddressCard
              key={addr.id}
              item={addr}
              selected={selectedId === addr.id}
              onSelect={() => setSelectedId(addr.id)}
            />
          ))}

          {/* Add New */}
          <TouchableOpacity
            style={bkStyles.addNewBtn}
            onPress={onAddNew}
            activeOpacity={0.85}
          >
            <View style={bkStyles.addNewIconBox}>
              <MaterialIcons name="add" size={24} color={palette.primary} />
            </View>
            <Text style={bkStyles.addNewText}>Add New Address</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Map Preview */}
        <Animated.View
          style={[
            bkStyles.mapSection,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <Text style={bkStyles.mapLabel}>LOCATION PREVIEW</Text>
          <MapPreview uri={MAP_IMAGE_URI} />
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          bkStyles.footer,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <Animated.View
          style={[bkStyles.ctaWrapper, { transform: [{ scale: ctaScale }] }]}
        >
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={1}
            style={{ width: '100%' }}
          >
            <LinearGradient
              colors={['#004ac6', '#2563eb']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={bkStyles.ctaBtn}
            >
              <Text style={bkStyles.ctaText}>Confirm Address</Text>
              <MaterialIcons
                name="arrow-forward"
                size={18}
                color={palette.onPrimary}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const bkStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.surface },

  // ── Header ────────────────────────────────────────────────────────────────
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  closeBtn: { padding: spacing.base, marginLeft: -spacing.base },
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
    backgroundColor: palette.surfaceContainerHigh,
  },
  avatarImage: { width: '100%', height: '100%' },

  // ── Content ───────────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
  },
  titleBlock: {
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  pageTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
  },
  pageSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
  },

  // ── Address list ──────────────────────────────────────────────────────────
  addrList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: palette.outlineVariant,
    borderRadius: 12,
  },
  addNewIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
  },

  // ── Map section ───────────────────────────────────────────────────────────
  mapSection: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  mapLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1,
    color: palette.onSurfaceVariant,
    textTransform: 'uppercase',
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(250,248,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: `${palette.surfaceVariant}4D`,
    alignItems: 'center',
  },
  ctaWrapper: {
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
  ctaBtn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: 12,
  },
  ctaText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onPrimary,
  },
});

export default BookingSelectAddressScreen;