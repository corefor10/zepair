// screens/ProfileSetupScreen.tsx
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
  ActionSheetIOS,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme_constant';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Gender = 'Male' | 'Female' | 'Other';
type HomeType = 'Apartment' | 'House' | 'Villa' | 'PG / Room';
type HomeSize = '1 BHK' | '2 BHK' | '3 BHK' | '4+ BHK' | '';

const GENDER_OPTIONS: Gender[] = ['Male', 'Female', 'Other'];
const HOME_TYPE_OPTIONS: {
  key: HomeType;
  icon: string;
}[] = [
  { key: 'Apartment', icon: 'apartment' },
  { key: 'House', icon: 'home' },
  { key: 'Villa', icon: 'villa' },
  { key: 'PG / Room', icon: 'hotel' },
];
const HOME_SIZE_OPTIONS: HomeSize[] = ['1 BHK', '2 BHK', '3 BHK', '4+ BHK'];

// ─── Avatar Upload ────────────────────────────────────────────────────────────

const AvatarUpload: React.FC<{ onUpload: () => void }> = ({ onUpload }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [hasImage, setHasImage] = useState(false);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.93,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
    onUpload();
  };

  return (
    <View style={avStyles.wrapper}>
      <Animated.View
        style={[avStyles.avatarRing, { transform: [{ scale: scaleAnim }] }]}
      >
        <TouchableOpacity
          style={avStyles.avatarInner}
          onPress={handlePress}
          activeOpacity={1}
        >
          {/* Placeholder image */}
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBePbgF9Aa99ZAkaEBJQkecRF30th2H1IvKUcITFucKFnlTsjVUvMCNC3pUfwIa2wt-Ig5h1yMtLeoUgG4XMd9DZj2ysmMFxoFJAYByT4HUSU4wF8TAcU-iyj3tOAFj_H-SMQyqYlUIdChlHnmg-ufGazYQYOUDrjynLyVCbv8Y35MbctZgDSUjtZywp9ULqCrFFVGHsYqXJ8Lgo0YchYdgU_UvhL5aWKixaLISJMkfb9x3-esegl6lD_75NbRA0cOY-5xer2HG8yx0',
            }}
            style={avStyles.avatarImage}
            resizeMode="cover"
          />
          {/* Camera overlay */}
          <View style={avStyles.cameraOverlay}>
            <MaterialIcons
              name="photo-camera"
              size={30}
              color={palette.primary}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Add button */}
      <TouchableOpacity
        style={avStyles.addButton}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[palette.primary, palette.primaryContainer]}
          style={avStyles.addButtonGradient}
        >
          <MaterialIcons name="add" size={18} color={palette.onPrimary} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const avStyles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignSelf: 'center',
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: palette.surfaceBright,
    overflow: 'hidden',
    backgroundColor: palette.surfaceContainerHigh,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  cameraOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: `${palette.primary}33`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: palette.surfaceBright,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  addButtonGradient: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Animated Input ───────────────────────────────────────────────────────────

const AnimatedInput: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  trailingIcon?: string;
  keyboardType?: any;
}> = ({ label, placeholder, value, onChangeText, trailingIcon, keyboardType }) => {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.outlineVariant, palette.primary],
  });

  const handleFocus = () => {
    setFocused(true);
    Animated.parallel([
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.01,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.parallel([
      Animated.timing(borderAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={inputStyles.wrapper}>
      <Text style={inputStyles.label}>{label}</Text>
      <Animated.View
        style={[
          inputStyles.container,
          { borderColor, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <TextInput
          style={inputStyles.input}
          placeholder={placeholder}
          placeholderTextColor={`${palette.outline}80`}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
        />
        {trailingIcon && (
          <MaterialIcons
            name={trailingIcon as any}
            size={22}
            color={palette.outline}
          />
        )}
      </Animated.View>
    </View>
  );
};

const inputStyles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
    marginLeft: spacing.base,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: palette.surfaceContainerLowest,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    color: palette.onSurface,
  },
});

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProfileProgressBar: React.FC<{
  percent: number;
  step: number;
  totalSteps: number;
}> = ({ percent, step, totalSteps }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percent,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  const width = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={pbStyles.wrapper}>
      <View style={pbStyles.labelRow}>
        <Text style={pbStyles.label}>Profile {percent}% Complete</Text>
        <Text style={pbStyles.step}>
          Step {step} of {totalSteps}
        </Text>
      </View>
      <View style={pbStyles.track}>
        <Animated.View style={[pbStyles.fill, { width }]} />
      </View>
    </View>
  );
};

const pbStyles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
  },
  step: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    color: palette.outline,
    letterSpacing: 0.22,
  },
  track: {
    height: 8,
    width: '100%',
    backgroundColor: palette.surfaceContainerHighest,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: palette.primary,
    borderRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#0053db',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
    }),
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

interface ProfileSetupScreenProps {
  onBack: () => void;
  onSaveAndContinue: (data: any) => void;
}

const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  onBack,
  onSaveAndContinue,
}) => {
  const insets = useSafeAreaInsets();

  const [displayName, setDisplayName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [homeType, setHomeType] = useState<HomeType>('Apartment');
  const [homeSize, setHomeSize] = useState<HomeSize>('');
  const [loading, setLoading] = useState(false);

  // CTA Scale
  const ctaScale = useRef(new Animated.Value(1)).current;

  const handleSave = () => {
    Animated.sequence([
      Animated.timing(ctaScale, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(ctaScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSaveAndContinue({ displayName, dob, gender, homeType, homeSize });
    }, 1200);
  };

  const handleHomeSizePicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...HOME_SIZE_OPTIONS],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            setHomeSize(HOME_SIZE_OPTIONS[buttonIndex - 1]);
          }
        }
      );
    }
  };

  const BOTTOM_HEIGHT = insets.bottom + 52 + spacing.lg + spacing.sm;

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top }]}
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={palette.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Zepair</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BOTTOM_HEIGHT },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress */}
        <ProfileProgressBar percent={40} step={2} totalSteps={4} />

        {/* Heading */}
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Complete Your Profile</Text>
          <Text style={styles.subheading}>
            Help us personalize your experience for better repair services.
          </Text>
        </View>

        {/* Avatar */}
        <AvatarUpload onUpload={() => {}} />

        {/* Form Fields */}
        <View style={styles.formFields}>
          {/* Display Name */}
          <AnimatedInput
            label="Display Name"
            placeholder="e.g. John Doe"
            value={displayName}
            onChangeText={setDisplayName}
          />

          {/* Date of Birth */}
          <AnimatedInput
            label="Date of Birth"
            placeholder="DD / MM / YYYY"
            value={dob}
            onChangeText={setDob}
            trailingIcon="calendar-today"
            keyboardType="numeric"
          />

          {/* Gender */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {GENDER_OPTIONS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderChip,
                    gender === g && styles.genderChipSelected,
                  ]}
                  onPress={() => setGender(g)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.genderChipText,
                      gender === g && styles.genderChipTextSelected,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Home Type */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Home Type</Text>
            <View style={styles.homeTypeGrid}>
              {HOME_TYPE_OPTIONS.map((ht) => {
                const isSelected = homeType === ht.key;
                return (
                  <TouchableOpacity
                    key={ht.key}
                    style={[
                      styles.homeTypeCard,
                      isSelected && styles.homeTypeCardSelected,
                    ]}
                    onPress={() => setHomeType(ht.key)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons
                      name={ht.icon as any}
                      size={20}
                      color={isSelected ? palette.primary : palette.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.homeTypeLabel,
                        isSelected && styles.homeTypeLabelSelected,
                      ]}
                    >
                      {ht.key}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Home Size */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Home Size</Text>
            <TouchableOpacity
              style={styles.dropdownBtn}
              onPress={handleHomeSizePicker}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !homeSize && styles.dropdownPlaceholder,
                ]}
              >
                {homeSize || 'Select size'}
              </Text>
              <MaterialIcons
                name="expand-more"
                size={22}
                color={palette.outline}
              />
            </TouchableOpacity>
            {/* Android: simple chip row as fallback */}
            {Platform.OS === 'android' && (
              <View style={styles.homeSizeChips}>
                {HOME_SIZE_OPTIONS.map((sz) => (
                  <TouchableOpacity
                    key={sz}
                    style={[
                      styles.homeSizeChip,
                      homeSize === sz && styles.homeSizeChipSelected,
                    ]}
                    onPress={() => setHomeSize(sz)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.homeSizeChipText,
                        homeSize === sz && styles.homeSizeChipTextSelected,
                      ]}
                    >
                      {sz}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fixed CTA */}
      <View
        style={[
          styles.ctaContainer,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <Animated.View
          style={[styles.ctaWrapper, { transform: [{ scale: ctaScale }] }]}
        >
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={handleSave}
            activeOpacity={1}
          >
            <LinearGradient
              colors={[palette.primary, palette.primaryContainer]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.ctaGradient}
            >
              {loading ? (
                <Text style={styles.ctaText}>Saving...</Text>
              ) : (
                <>
                  <Text style={styles.ctaText}>Save & Continue</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color={palette.onPrimary}
                  />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.surfaceBright,
  },
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
  backBtn: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
    borderRadius: 20,
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
    color: palette.primary,
    letterSpacing: -0.18,
  },
  scrollContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },
  headingBlock: {
    gap: spacing.base,
  },
  heading: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.onSurface,
  },
  subheading: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
    lineHeight: 20,
  },
  formFields: {
    gap: spacing.lg,
  },
  fieldWrapper: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
    marginLeft: spacing.base,
  },

  // ── Gender ────────────────────────────────────────────────────────────────
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  genderChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
    backgroundColor: palette.surfaceContainerLow,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
  },
  genderChipSelected: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  genderChipText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  genderChipTextSelected: {
    color: palette.onPrimary,
  },

  // ── Home Type ─────────────────────────────────────────────────────────────
  homeTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  homeTypeCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surfaceContainerLowest,
  },
  homeTypeCardSelected: {
    borderColor: palette.primary,
    backgroundColor: `${palette.primary}0D`,
  },
  homeTypeLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  homeTypeLabelSelected: {
    color: palette.primary,
  },

  // ── Home Size ─────────────────────────────────────────────────────────────
  dropdownBtn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surfaceContainerLowest,
    paddingHorizontal: spacing.md,
  },
  dropdownText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    color: palette.onSurface,
  },
  dropdownPlaceholder: {
    color: `${palette.outline}80`,
  },
  homeSizeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  homeSizeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surfaceContainerLowest,
  },
  homeSizeChipSelected: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  homeSizeChipText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
  },
  homeSizeChipTextSelected: {
    color: palette.onPrimary,
  },

  // ── CTA ───────────────────────────────────────────────────────────────────
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.sm,
    backgroundColor: 'rgba(250,248,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: `${palette.outlineVariant}20`,
  },
  ctaWrapper: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: palette.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  ctaBtn: {
    width: '100%',
  },
  ctaGradient: {
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

export default ProfileSetupScreen;