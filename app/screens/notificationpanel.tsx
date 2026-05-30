// screens/NotificationPanelScreen.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme';

const { height: SH } = Dimensions.get('window');
const PANEL_MAX_HEIGHT = SH * 0.85;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
  isUnread: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Booking Confirmed',
    body: 'Your AC maintenance service with Pro David K. is confirmed for June 12th.',
    time: '2m ago',
    iconName: 'check-circle',
    iconBg: '#ecfdf5',
    iconColor: '#10b981',
    isUnread: true,
  },
  {
    id: '2',
    title: 'Pro En Route',
    body: 'Technician Sarah is currently on her way to your location. Estimated arrival: 10:15 AM.',
    time: '45m ago',
    iconName: 'local-shipping',
    iconBg: '#eff6ff',
    iconColor: '#3b82f6',
    isUnread: true,
  },
  {
    id: '3',
    title: 'Weekend Special',
    body: 'Enjoy 15% off all electrical services this weekend. Use code ZEPAIR15.',
    time: '3h ago',
    iconName: 'celebration',
    iconBg: '#fffbeb',
    iconColor: '#f59e0b',
    isUnread: false,
  },
  {
    id: '4',
    title: 'Service Completed',
    body: 'Your Refrigerator Repair was successfully completed. How was the experience?',
    time: 'Yesterday',
    iconName: 'task-alt',
    iconBg: palette.surfaceContainer,
    iconColor: palette.onSurfaceVariant,
    isUnread: false,
  },
  {
    id: '5',
    title: 'Payment Received',
    body: "We've received your payment of $85.00 for the Plumbing inspection. Receipt sent to email.",
    time: '2d ago',
    iconName: 'payments',
    iconBg: '#f5f3ff',
    iconColor: '#8b5cf6',
    isUnread: false,
  },
];

// ─── Notification Item ────────────────────────────────────────────────────────

const NotificationItem: React.FC<{
  item: Notification;
  onPress: (id: string) => void;
}> = ({ item, onPress }) => {
  const pressAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.timing(pressAnim, {
      toValue: 0.97,
      duration: 80,
      useNativeDriver: true,
    }).start();

  const handlePressOut = () =>
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
      <TouchableOpacity
        style={styles.notifItem}
        onPress={() => onPress(item.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Icon */}
        <View style={styles.notifIconWrapper}>
          <View
            style={[styles.notifIconCircle, { backgroundColor: item.iconBg }]}
          >
            <MaterialIcons
              name={item.iconName as any}
              size={24}
              color={item.iconColor}
            />
          </View>
          {item.isUnread && <View style={styles.unreadDot} />}
        </View>

        {/* Content */}
        <View style={styles.notifContent}>
          <View style={styles.notifTitleRow}>
            <Text style={styles.notifTitle}>{item.title}</Text>
            <Text style={styles.notifTime}>{item.time}</Text>
          </View>
          <Text style={styles.notifBody} numberOfLines={3}>
            {item.body}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Bottom Navigation ────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'services', label: 'Services', icon: 'build' },
  { key: 'bookings', label: 'Bookings', icon: 'event-note' },
  { key: 'chat', label: 'Chat', icon: 'chat' },
  { key: 'profile', label: 'Profile', icon: 'person' },
] as const;

const BottomNav: React.FC<{
  activeTab: string;
  onTabPress: (tab: string) => void;
}> = ({ activeTab, onTabPress }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 4 }]}>
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={() => onTabPress(item.key)}
            activeOpacity={0.75}
          >
            <MaterialIcons
              name={item.icon as any}
              size={24}
              color={isActive ? palette.primary : palette.onSurfaceVariant}
            />
            <Text
              style={[styles.navLabel, isActive && styles.navLabelActive]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Notification Panel (Sheet) ───────────────────────────────────────────────

interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
  onViewAll: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  visible,
  onClose,
  notifications,
  onMarkAllRead,
  onViewAll,
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-PANEL_MAX_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 10,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -PANEL_MAX_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={[styles.panelBackdrop, { opacity: backdropAnim }]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Panel */}
      <Animated.View
        style={[
          styles.panel,
          {
            paddingTop: insets.top,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Panel Header */}
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Notifications</Text>
          <TouchableOpacity onPress={onMarkAllRead} activeOpacity={0.7}>
            <Text style={styles.markAllReadText}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        {/* Notification List */}
        <ScrollView
          style={styles.panelScrollView}
          contentContainerStyle={styles.panelScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              item={notif}
              onPress={(id) => console.log('Notification pressed:', id)}
            />
          ))}
        </ScrollView>

        {/* Panel Footer */}
        <View
          style={[
            styles.panelFooter,
            { paddingBottom: insets.bottom + spacing.md },
          ]}
        >
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={onViewAll}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[palette.primaryContainer, palette.primaryContainer]}
              style={styles.viewAllGradient}
            >
              <Text style={styles.viewAllText}>View All Notifications</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

interface NotificationPanelScreenProps {
  onNavigate?: (route: string) => void;
}

const NotificationPanelScreen: React.FC<NotificationPanelScreenProps> = ({
  onNavigate,
}) => {
  const insets = useSafeAreaInsets();
  const [panelVisible, setPanelVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [hasUnread, setHasUnread] = useState(true);

  // Bell button badge bounce
  const badgePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Auto-show panel for demo
    const t = setTimeout(() => setPanelVisible(true), 800);

    // Badge pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, {
          toValue: 1.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(badgePulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearTimeout(t);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isUnread: false }))
    );
    setHasUnread(false);
  }, []);

  const BOTTOM_NAV_HEIGHT = 64 + insets.bottom;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <MaterialIcons name="location-on" size={24} color={palette.primary} />
          <Text style={styles.appBarLogo}>Zepair</Text>
        </View>
        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => setPanelVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="notifications" size={24} color={palette.primary} />
          {hasUnread && (
            <Animated.View
              style={[
                styles.notifBadge,
                { transform: [{ scale: badgePulse }] },
              ]}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Home Screen Content (background context) */}
      <ScrollView
        contentContainerStyle={[
          styles.homeContent,
          { paddingBottom: BOTTOM_NAV_HEIGHT + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <View style={styles.welcomeHeader}>
          <Text style={styles.welcomeTitle}>Welcome back, Alex</Text>
          <Text style={styles.welcomeSubtitle}>Your home is in good hands.</Text>
        </View>

        {/* Booking Card */}
        <View style={styles.bookingCard}>
          <View style={styles.bookingIconWrapper}>
            <MaterialIcons name="build" size={24} color={palette.primary} />
          </View>
          <View style={styles.bookingCardText}>
            <Text style={styles.bookingCardTitle}>AC Repair</Text>
            <Text style={styles.bookingCardSubtitle}>
              Scheduled for Tomorrow, 10:00 AM
            </Text>
          </View>
        </View>

        {/* Service Cards Grid */}
        <View style={styles.serviceGrid}>
          {[
            { name: 'Plumbing', icon: 'plumbing' },
            { name: 'Electrical', icon: 'electrical-services' },
          ].map((service) => (
            <TouchableOpacity
              key={service.name}
              style={styles.serviceCard}
              activeOpacity={0.85}
            >
              <MaterialIcons
                name={service.icon as any}
                size={24}
                color={palette.primary}
              />
              <Text style={styles.serviceCardLabel}>{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Placeholder content rows */}
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.placeholderCard} />
        ))}
      </ScrollView>

      {/* Notification Panel */}
      <NotificationPanel
        visible={panelVisible}
        onClose={() => setPanelVisible(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onViewAll={() => {
          setPanelVisible(false);
          onNavigate?.('notifications');
        }}
      />

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

  // ── App Bar ───────────────────────────────────────────────────────────────
  appBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: palette.surfaceBright,
    borderBottomWidth: 1,
    borderBottomColor: `${palette.outlineVariant}33`,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  appBarLogo: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.primary,
  },
  bellButton: {
    position: 'relative',
    padding: spacing.xs,
    borderRadius: 20,
  },
  notifBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.error,
    borderWidth: 2,
    borderColor: palette.surfaceBright,
  },

  // ── Home Content ──────────────────────────────────────────────────────────
  homeContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  welcomeHeader: {
    marginBottom: spacing.xs,
  },
  welcomeTitle: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.onBackground,
    marginBottom: spacing.base,
  },
  welcomeSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: palette.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
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
  bookingIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${palette.primaryContainer}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingCardText: { flex: 1 },
  bookingCardTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: palette.onSurface,
  },
  bookingCardSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: palette.onSurfaceVariant,
  },
  serviceGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  serviceCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: palette.surfaceContainerLowest,
    borderRadius: 12,
    padding: spacing.md,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
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
  serviceCardLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
  },
  placeholderCard: {
    height: 80,
    borderRadius: 12,
    backgroundColor: palette.surfaceContainerLow,
  },

  // ── Notification Panel ────────────────────────────────────────────────────
  panelBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(25,27,35,0.45)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    maxHeight: PANEL_MAX_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'column',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: { elevation: 24 },
    }),
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${palette.outlineVariant}33`,
  },
  panelTitle: {
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: '600',
    color: palette.onBackground,
  },
  markAllReadText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.primary,
  },
  panelScrollView: {
    flex: 1,
  },
  panelScrollContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },

  // ── Notification Item ─────────────────────────────────────────────────────
  notifItem: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  notifIconWrapper: {
    position: 'relative',
    flexShrink: 0,
  },
  notifIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.primary,
    borderWidth: 2,
    borderColor: palette.surfaceContainerLowest,
  },
  notifContent: {
    flex: 1,
    gap: spacing.base,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  notifTitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurface,
    flex: 1,
  },
  notifTime: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
    flexShrink: 0,
  },
  notifBody: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: palette.onSurfaceVariant,
  },

  // ── Panel Footer ──────────────────────────────────────────────────────────
  panelFooter: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: `${palette.outlineVariant}33`,
    gap: spacing.xs,
  },
  viewAllBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: palette.primaryContainer,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  viewAllGradient: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  viewAllText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: palette.onPrimary,
  },
  dismissBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.22,
    color: palette.onSurfaceVariant,
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

export default NotificationPanelScreen;