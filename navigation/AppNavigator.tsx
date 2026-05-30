import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { palette, spacing } from '../theme';
import BottomTabNavigator, { TabKey } from './BottomTabNavigator';

// ── Import Actual Screens ─────────────────────────────────────────────────────
import HomeDashboardScreen from '../app/screens/homedashboard';
import AllServicesScreen from '../app/screens/allservices';
import BookingSelectScreen from '../app/screens/bookingselect';
import ProfessionalProfileScreen from '../app/screens/professionalprofile';

// ── Chat Placeholder (Screen not implemented yet) ───────────────────────────
const ChatPlaceholder: React.FC = () => (
  <View style={placeholderStyles.screen}>
    <MaterialIcons name="chat-bubble" size={64} color={palette.primary} />
    <Text style={placeholderStyles.title}>Chat</Text>
    <Text style={placeholderStyles.subtitle}>Messages coming soon</Text>
  </View>
);

const placeholderStyles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceBright,
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.26,
    color: palette.primary,
    marginTop: spacing.md,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: palette.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

// ─── Main App Navigator ───────────────────────────────────────────────────────

const AppNavigator: React.FC = () => {
  const [badgeCounts] = useState<Partial<Record<TabKey, number>>>({
    chat: 3,
    bookings: 1,
  });

  const screens: Record<TabKey, React.ReactNode> = {
    home: <HomeDashboardScreen />,
    services: <AllServicesScreen />,
    bookings: <BookingSelectScreen />,
    chat: <ChatPlaceholder />,
    profile: <ProfessionalProfileScreen />,
  };

  const handleTabChange = (tab: TabKey) => {
    console.log('[AppNavigator] Tab changed to:', tab);
    // Analytics / side-effects can go here
  };

  return (
    <SafeAreaProvider>
      <BottomTabNavigator
        initialTab="home"
        screens={screens}
        badgeCounts={badgeCounts}
        onTabChange={handleTabChange}
      />
    </SafeAreaProvider>
  );
};

export default AppNavigator;
