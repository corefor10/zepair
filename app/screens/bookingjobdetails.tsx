// screens/BookingJobDetailsScreen.tsx
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
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme';

const { width: SW } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

type AccessOption = 'home' | 'security' | 'neighbor';
type Language = 'English' | 'Hindi' | 'Kannada';

// ─── Data ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Service', done: true },
  { id: 2, label: 'Schedule', done: true },
  { id: 3, label: 'Details', active: true },
  { id: 4, label: 'Review', done: false },
];

const ACCESS_OPTIONS: { id: AccessOption; label: string; icon: string }[] = [
  { id: 'home', label: "I'm home", icon: 'home' },
  { id: 'security', label: 'Key with security', icon: 'security' },
  { id: 'neighbor', label: 'Key with neighbor', icon: 'group' },
];

const LANGUAGES: Language[] = ['English', 'Hindi', 'Kannada'];

// ─── Progress Stepper ─────────────────────────────────────────────────────────

const ProgressStepper: React.FC = () => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '66%'],
  });

  return (
    <View style={stepStyles.container}>
      {/* Background connector */}
      <View style={stepStyles.connectorBg} />
      {/* Progress fill */}
      <Animated.View style={[stepStyles.connectorFill, { width: progressWidth }]} />

      {STEPS.map((step) => {
        const isActive = !!step.active;
        const isDone = step.done && !isActive;

        return (
          <View key={step.id} style={stepStyles.stepItem}>
            <View
              style={[
                stepStyles.circle,
                (isDone || isActive) && stepStyles.circleActive,
                isActive && stepStyles.circleRing,
              ]}
            >
              {isDone ? (
                <MaterialIcons name="check" size={16} color={palette.onPrimary} />
              ) : (
                <Text
                  style={[
                    stepStyles.circleText,
                    (isDone || isActive) && stepStyles.circleTextActive,
                  ]}
                >
                  {step.id}
                </Text>
              )}
            </View>
            <Text
              style={[
                stepStyles.label,
                isActive && stepStyles.labelActive,
              ]}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const stepStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  connectorBg: {
    position: 'absolute',
    top: spacing.lg + 16,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: palette.surfaceVariant,
    zIndex: 0,
  },
  connectorFill: {
    position: 'absolute',
    top: spacing.lg + 16,
    left: 0,
    height: 2,
    backgroundColor: palette.primary,
    zIndex: 1,
  },
  stepItem: {
    alignItems: 'center',
    gap: spacing.xs,
    zIndex: 2,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    backgroundColor: palette.primary,
    ...Platform.select({
      ios: {
        shadowColor: palette.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  circleRing: {
    borderWidth: 4,
    borderColor: palette.primaryFixed,
  },
  circleText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  circleTextActive: {
    color: palette.onPrimary,
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

// ─── Photo Slot ───────────────────────────────────────────────────────────────

const PhotoSlot: React.FC<{ onAdd: () => void }> = ({ onAdd }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <TouchableOpacity
      style={photoStyles.addSlot}
      onPress={onAdd}
      onPressIn={() =>
        Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true }).start()
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
      <Animated.View
        style={[photoStyles.addSlotInner, { transform: [{ scale: scaleAnim }] }]}
      >
        <MaterialIcons name="add" size={28} color={palette.primary} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const photoStyles = StyleSheet.create({
  addSlot: {
    flexShrink: 0,
  },
  addSlotInner: {
    width: 96,
    height: 96,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Access Option Card ───────────────────────────────────────────────────────

const AccessCard: React.FC<{
  option: (typeof ACCESS_OPTIONS)[0];
  selected: boolean;
  onSelect: () => void;
}> = ({ option, selected, onSelect }) => {
  const borderAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const bgAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(borderAnim, {
        toValue: selected ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(bgAnim, {
        toValue: selected ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [selected]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.outlineVariant, palette.primary],
  });

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.surfaceContainerLowest, palette.surfaceContainerLow],
  });

  return (
    <Animated.View style={[accessStyles.card, { borderColor, backgroundColor }]}>
      <TouchableOpacity
        style={accessStyles.cardInner}
        onPress={onSelect}
        activeOpacity={0.85}
      >
        <MaterialIcons
          name={option.icon as any}
          size={24}
          color={selected ? palette.primary : palette.onSurfaceVariant}
        />
        <Text style={accessStyles.label}>{option.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const accessStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    color: palette.onSurface,
  },
});

// ─── Language Chip ────────────────────────────────────────────────────────────

const LanguageChip: React.FC<{
  label: Language;
  selected: boolean;
  onPress: () => void;
}> = ({ label, selected, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[langStyles.chip, selected && langStyles.chipSelected]}
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true }).start()
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
        <Text
          style={[langStyles.chipText, selected && langStyles.chipTextSelected]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const langStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
    backgroundColor: palette.surfaceContainerHighest,
  },
  chipSelected: {
    backgroundColor: palette.primary,
    ...Platform.select({
      ios: {
        shadowColor: palette.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
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
  chipTextSelected: {
    color: palette.onPrimary,
  },
});

// ─── Animated TextArea ────────────────────────────────────────────────────────

const AnimatedTextArea: React.FC<{
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  rows?: number;
}> = ({ placeholder, value, onChangeText, rows = 4 }) => {
  const borderAnim = useRef(new Animated.Value(0)).current;

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.outlineVariant, palette.primary],
  });

  return (
    <Animated.View style={[taStyles.wrapper, { borderColor }]}>
      <TextInput
        style={[taStyles.input, { height: rows * 24 }]}
        placeholder={placeholder}
        placeholderTextColor={palette.outline}
        value={value}
        onChangeText={onChangeText}
        multiline
        textAlignVertical="top"
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

const taStyles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: palette.surfaceContainerLowest,
  },
  input: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurface,
    padding: spacing.md,
  },
});

// ─── Section Label ────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ icon: string; label: string }> = ({
  icon,
  label,
}) => (
  <View style={slStyles.row}>
    <MaterialIcons name={icon as any} size={18} color={palette.primary} />
    <Text style={slStyles.text}>{label}</Text>
  </View>
);

const slStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  text: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export interface BookingJobDetailsScreenProps {
  onBack: () => void;
  onContinue: (data: {
    description: string;
    specialInstructions: string;
    access: AccessOption;
    hasPets: boolean;
    language: Language;
  }) => void;
}

const BookingJobDetailsScreen: React.FC<BookingJobDetailsScreenProps> = ({
  onBack,
  onContinue,
}) => {
  const insets = useSafeAreaInsets();

  const [description, setDescription] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [access, setAccess] = useState<AccessOption>('home');
  const [hasPets, setHasPets] = useState(false);
  const [language, setLanguage] = useState<Language>('English');

  // Content entrance
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(16)).current;

  // CTA scale
  const ctaScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlide, {
        toValue: 0,
        duration: 500,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    Animated.sequence([
      Animated.spring(ctaScale, { toValue: 0.97, useNativeDriver: true }),
      Animated.spring(ctaScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start(() =>
      onContinue({ description, specialInstructions, access, hasPets, language })
    );
  };

  const FOOTER_H = insets.bottom + 52 + spacing.marginMobile * 2;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={palette.primary} />
          </TouchableOpacity>
          <Text style={styles.logo}>Zepair</Text>
        </View>
        <View style={styles.avatarBox}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBGM4AYS3ID7yduRhyy4KDQEXGLxlF0mI3pyIrlYUc9PR4fafMXXP8K2LqDrTBF_4auGr33EQTAq21nUCpNw64BzPKaMVFGHJQigr0ypFjA9337lxgHP8-xR_p3fH9AbyjH0MrqmcQV98aAmUnmo2lYZc3TP45TQ25iojhzNJo6sBOz1I0jR5qZqal12fTTdImSy-_rTKM8qxQmZf4Jg30tkGe59UvvVwDd0_xj9XKW-QHJTqtcbwjm9oQoNo-lMm_IfPzt-EyxD44',
            }}
            style={styles.avatarImg}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: FOOTER_H },
        ]}
      >
        {/* Progress Stepper */}
        <View style={styles.stepperWrapper}>
          <ProgressStepper />
        </View>

        {/* Page heading */}
        <Animated.View
          style={[
            styles.pageHeading,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <Text style={styles.pageTitle}>Tell Us More</Text>
          <Text style={styles.pageSubtitle}>
            Help our technician prepare for your visit.
          </Text>
        </Animated.View>

        {/* Description */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <SectionLabel icon="description" label="Describe the issue..." />
          <AnimatedTextArea
            placeholder="Ex: My washing machine is making a loud rattling noise during the spin cycle and there's a small leak at the base."
            value={description}
            onChangeText={setDescription}
            rows={4}
          />
        </Animated.View>

        {/* Add Photos */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <View style={styles.photoSectionHeader}>
            <SectionLabel icon="add-a-photo" label="Add Photos" />
            <Text style={styles.photoOptLabel}>Optional (Max 4)</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoRow}
          >
            <PhotoSlot onAdd={() => {}} />
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.photoPlaceholder}>
                <MaterialIcons
                  name="image"
                  size={24}
                  color={palette.outline}
                />
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Special Instructions */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <SectionLabel icon="sticky-note-2" label="Special Instructions" />
          <AnimatedTextArea
            placeholder="Ex: Please ring the side doorbell."
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            rows={2}
          />
        </Animated.View>

        {/* Property Access */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <SectionLabel icon="vpn-key" label="Property Access" />
          <View style={styles.accessList}>
            {ACCESS_OPTIONS.map((opt) => (
              <AccessCard
                key={opt.id}
                option={opt}
                selected={access === opt.id}
                onSelect={() => setAccess(opt.id)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Pets Toggle */}
        <Animated.View
          style={[
            styles.petsRow,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <View style={styles.petsLeft}>
            <MaterialIcons name="pets" size={24} color={palette.primary} />
            <View>
              <Text style={styles.petsTitle}>Pets at Home?</Text>
              <Text style={styles.petsSubtitle}>Inform the technician</Text>
            </View>
          </View>
          <Switch
            value={hasPets}
            onValueChange={setHasPets}
            trackColor={{
              false: palette.surfaceVariant,
              true: palette.primary,
            }}
            thumbColor={palette.surfaceContainerLowest}
          />
        </Animated.View>

        {/* Preferred Language */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <SectionLabel icon="translate" label="Preferred Language" />
          <View style={styles.languageRow}>
            {LANGUAGES.map((lang) => (
              <LanguageChip
                key={lang}
                label={lang}
                selected={language === lang}
                onPress={() => setLanguage(lang)}
              />
            ))}
          </View>
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
            onPress={handleContinue}
            activeOpacity={1}
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
          >
            <LinearGradient
              colors={['#004ac6', '#2563eb']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.ctaBtn}
            >
              <Text style={styles.ctaText}>Continue</Text>
              <MaterialIcons name="arrow-forward" size={20} color={palette.onPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
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
  logo: {
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
    backgroundColor: palette.surfaceContainerHigh,
  },
  avatarImg: { width: '100%', height: '100%' },
  scrollContent: {
    paddingHorizontal: spacing.marginMobile,
  },
  stepperWrapper: {
    paddingHorizontal: spacing.base,
  },
  pageHeading: {
    marginBottom: spacing.xl,
    gap: spacing.base,
  },
  pageTitle: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.onSurface,
  },
  pageSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
  },
  section: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  photoSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoOptLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.outline,
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  photoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: palette.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  accessList: { gap: spacing.sm },
  petsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: `${palette.surfaceContainerHigh}80`,
    borderWidth: 1,
    borderColor: palette.surfaceVariant,
    marginBottom: spacing.xl,
  },
  petsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  petsTitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
  },
  petsSubtitle: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
  },
  languageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
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
  },
  ctaBtn: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
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
  ctaText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onPrimary,
  },
});

export default BookingJobDetailsScreen;