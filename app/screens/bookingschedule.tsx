// screens/BookingScheduleScreen.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalendarDay {
  day: string;
  date: number;
  disabled?: boolean;
}

interface TimeSlot {
  time: string;
  period: 'Morning' | 'Afternoon' | 'Evening';
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CALENDAR_DAYS: CalendarDay[] = [
  { day: 'Mon', date: 12, disabled: true },
  { day: 'Tue', date: 13 },
  { day: 'Wed', date: 14 },
  { day: 'Thu', date: 15 },
  { day: 'Fri', date: 16 },
  { day: 'Sat', date: 17 },
  { day: 'Sun', date: 18 },
];

const TIME_SLOTS: TimeSlot[] = [
  { time: '09:00 AM', period: 'Morning' },
  { time: '10:00 AM', period: 'Morning' },
  { time: '11:00 AM', period: 'Morning' },
  { time: '12:00 PM', period: 'Afternoon' },
  { time: '01:00 PM', period: 'Afternoon' },
  { time: '03:00 PM', period: 'Afternoon' },
  { time: '04:00 PM', period: 'Evening' },
  { time: '05:30 PM', period: 'Evening' },
  { time: '07:00 PM', period: 'Evening' },
];

const PERIOD_ICONS: Record<string, string> = {
  Morning: 'wb-sunny',
  Afternoon: 'light-mode',
  Evening: 'nights-stay',
};

const BOOKING_STEPS = [
  { id: 1, label: 'Service', done: true },
  { id: 2, label: 'Schedule', active: true },
  { id: 3, label: 'Address' },
  { id: 4, label: 'Confirm' },
];

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
    outputRange: ['0%', '33%'],
  });

  return (
    <View style={stepStyles.container}>
      <View style={stepStyles.connectorBg} />
      <Animated.View style={[stepStyles.connectorFill, { width: progressWidth }]} />
      {BOOKING_STEPS.map((step) => {
        const isActive = !!step.active;
        const isDone = !!step.done;
        return (
          <View key={step.id} style={stepStyles.stepItem}>
            <View
              style={[
                stepStyles.circle,
                (isDone || isActive) && stepStyles.circleActive,
                isActive && stepStyles.circleRing,
              ]}
            >
              {isDone && !isActive ? (
                <MaterialIcons name="check" size={16} color={palette.onPrimary} />
              ) : (
                <Text
                  style={[
                    stepStyles.num,
                    (isDone || isActive) && stepStyles.numActive,
                  ]}
                >
                  {step.id}
                </Text>
              )}
            </View>
            <Text
              style={[stepStyles.label, isActive && stepStyles.labelActive]}
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
    backgroundColor: palette.surfaceContainerHigh,
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
  stepItem: { alignItems: 'center', gap: spacing.xs, zIndex: 2 },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    backgroundColor: palette.primaryContainer,
    ...Platform.select({
      ios: {
        shadowColor: palette.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  circleRing: {
    borderWidth: 4,
    borderColor: `${palette.primaryContainer}33`,
  },
  num: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  numActive: { color: palette.onPrimary },
  label: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  labelActive: { color: palette.primaryContainer, fontWeight: '700' },
});

// ─── Calendar Day Button ──────────────────────────────────────────────────────

const CalendarDayButton: React.FC<{
  item: CalendarDay;
  selected: boolean;
  onSelect: () => void;
}> = ({ item, selected, onSelect }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  if (item.disabled) {
    return (
      <View style={[calStyles.btn, calStyles.btnDisabled]}>
        <Text style={calStyles.dayLabel}>{item.day}</Text>
        <Text style={calStyles.dateLabel}>{item.date}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[calStyles.btn, selected && calStyles.btnSelected]}
        onPress={onSelect}
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
          style={[calStyles.dayLabel, selected && calStyles.labelSelected]}
        >
          {item.day}
        </Text>
        <Text
          style={[calStyles.dateLabel, selected && calStyles.labelSelected]}
        >
          {item.date}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const calStyles = StyleSheet.create({
  btn: {
    width: 60,
    height: 80,
    borderRadius: 12,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    flexShrink: 0,
  },
  btnSelected: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
    ...Platform.select({
      ios: {
        shadowColor: palette.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  btnDisabled: {
    backgroundColor: palette.surfaceContainer,
    borderColor: `${palette.outlineVariant}4D`,
    opacity: 0.6,
  },
  dayLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
  },
  dateLabel: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
    lineHeight: 26,
  },
  labelSelected: {
    color: palette.onPrimary,
  },
});

// ─── Time Slot Button ─────────────────────────────────────────────────────────

const TimeSlotButton: React.FC<{
  time: string;
  selected: boolean;
  onSelect: () => void;
}> = ({ time, selected, onSelect }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: selected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [selected]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[tsStyles.btn, selected && tsStyles.btnSelected]}
        onPress={onSelect}
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
        <Text style={[tsStyles.text, selected && tsStyles.textSelected]}>
          {time}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const tsStyles = StyleSheet.create({
  btn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSelected: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
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
  text: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
  },
  textSelected: { color: palette.onPrimary },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export interface BookingScheduleScreenProps {
  onBack: () => void;
  onContinue: (date: number, time: string) => void;
}

const BookingScheduleScreen: React.FC<BookingScheduleScreenProps> = ({
  onBack,
  onContinue,
}) => {
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState<number>(13);
  const [selectedTime, setSelectedTime] = useState<string>('12:00 PM');

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

  // Group slots by period
  const periods = ['Morning', 'Afternoon', 'Evening'] as const;
  const slotsByPeriod = (period: string) =>
    TIME_SLOTS.filter((s) => s.period === period);

  const FOOTER_H = insets.bottom + 52 + spacing.marginMobile * 2;

  return (
    <View style={[schStyles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={schStyles.header}>
        <TouchableOpacity onPress={onBack} style={schStyles.backBtn} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={palette.primary} />
        </TouchableOpacity>
        <Text style={schStyles.logo}>Zepair</Text>
        <View style={schStyles.avatarBox}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYGvyzz2LBYZBSf16-x0Mvp6MPNkx-p0TUt9pFlF0j6FWBS02ztxOCuICl93ngIkrGN6mNw1WlTUjeHw5IQ7ZYrmjKeWW6aexyNs-kN0dKXE3_SiVHrCgyeM3EnkDD8I9fC_Xqp4-Vm9Jr3ryYpmddn4WQ34olU2GVHtkmPptQFGzCBwBJYBNOToDmgf2-LTWIa8g8AwQXBU35-wcYD49UqHOQIXNrQdNTDfubQ2g_xBSVPtBuUVQpNZwHkqzW2BVn-I0ourD2w1O-',
            }}
            style={schStyles.avatarImg}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          schStyles.scrollContent,
          { paddingBottom: FOOTER_H },
        ]}
      >
        {/* Stepper */}
        <View style={{ paddingHorizontal: spacing.marginMobile }}>
          <ProgressStepper />
        </View>

        {/* Page heading */}
        <Animated.View
          style={[
            schStyles.pageHeading,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <Text style={schStyles.pageTitle}>When do you need it?</Text>
          <Text style={schStyles.pageSubtitle}>
            Choose a convenient date and time for your repair professional.
          </Text>
        </Animated.View>

        {/* Calendar Strip */}
        <Animated.View
          style={[
            { opacity: contentOpacity, transform: [{ translateY: contentSlide }] },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={schStyles.calendarRow}
            style={{ marginHorizontal: -spacing.marginMobile }}
          >
            {CALENDAR_DAYS.map((day) => (
              <CalendarDayButton
                key={day.date}
                item={day}
                selected={selectedDate === day.date && !day.disabled}
                onSelect={() => !day.disabled && setSelectedDate(day.date)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Time Slots */}
        <Animated.View
          style={[
            schStyles.slotsSection,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <Text style={schStyles.slotsTitle}>Select Time Slot</Text>

          {periods.map((period) => (
            <View key={period} style={schStyles.periodGroup}>
              {/* Period header */}
              <View style={schStyles.periodHeader}>
                <MaterialIcons
                  name={PERIOD_ICONS[period] as any}
                  size={18}
                  color={palette.onSurfaceVariant}
                />
                <Text style={schStyles.periodLabel}>
                  {period.toUpperCase()}
                </Text>
              </View>
              {/* Slot grid */}
              <View style={schStyles.slotGrid}>
                {slotsByPeriod(period).map((slot) => (
                  <View key={slot.time} style={schStyles.slotCell}>
                    <TimeSlotButton
                      time={slot.time}
                      selected={selectedTime === slot.time}
                      onSelect={() => setSelectedTime(slot.time)}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Info note */}
        <Animated.View
          style={[
            schStyles.infoNote,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <MaterialIcons name="info" size={20} color={palette.primary} />
          <Text style={schStyles.infoText}>
            Professional will arrive within 15 minutes of selected time.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Footer CTA */}
      <View
        style={[
          schStyles.footer,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
          <TouchableOpacity
            onPress={() => onContinue(selectedDate, selectedTime)}
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
              colors={[palette.primary, palette.secondary]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={schStyles.ctaBtn}
            >
              <Text style={schStyles.ctaText}>CONTINUE</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const schStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.surface },
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
  backBtn: { padding: spacing.base },
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
    borderColor: palette.primaryContainer,
  },
  avatarImg: { width: '100%', height: '100%' },
  scrollContent: { paddingBottom: 0 },
  pageHeading: {
    paddingHorizontal: spacing.marginMobile,
    marginBottom: spacing.lg,
    gap: spacing.base,
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
  calendarRow: {
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingBottom: spacing.xl,
  },
  slotsSection: {
    paddingHorizontal: spacing.marginMobile,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  slotsTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: palette.onSurface,
  },
  periodGroup: { gap: spacing.sm },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  periodLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1,
    color: palette.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slotCell: {
    width: (SW - spacing.marginMobile * 2 - spacing.sm * 2) / 3,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginHorizontal: spacing.marginMobile,
    padding: spacing.md,
    backgroundColor: palette.surfaceContainer,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}33`,
    marginBottom: spacing.xl,
  },
  infoText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
    flex: 1,
  },
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  ctaBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: palette.onPrimary,
  },
});

export default BookingScheduleScreen;