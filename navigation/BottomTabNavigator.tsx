import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { palette, spacing } from '../theme';

const { width: SW } = Dimensions.get('window');

// ─── Tab Configuration ────────────────────────────────────────────────────────

export type TabKey = 'home' | 'services' | 'bookings' | 'chat' | 'profile';

export interface TabConfig {
  key: TabKey;
  label: string;
  icon: string;
  iconFilled: string;
  badgeCount?: number;
}

const TABS: TabConfig[] = [
  { key: 'home', label: 'Home', icon: 'home', iconFilled: 'home' },
  { key: 'services', label: 'Services', icon: 'build', iconFilled: 'build' },
  { key: 'bookings', label: 'Bookings', icon: 'event-note', iconFilled: 'event-note' },
  { key: 'chat', label: 'Chat', icon: 'chat-bubble-outline', iconFilled: 'chat-bubble' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', iconFilled: 'person' },
];

const TAB_WIDTH = SW / TABS.length;

// ─── Simplified Indicator ───────────────────────────────────────────────────────

const SlideIndicator: React.FC<{ activeIndex: number }> = ({ activeIndex }) => {
  const slideAnim = useRef(new Animated.Value(activeIndex * TAB_WIDTH)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex * TAB_WIDTH,
      friction: 10,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [activeIndex]);

  return (
    <Animated.View
      style={[
        styles.indicator,
        { transform: [{ translateX: slideAnim }] },
      ]}
    />
  );
};

// ─── Compact Tab Item ──────────────────────────────────────────────────────────

interface TabItemProps {
  tab: TabConfig;
  isActive: boolean;
  onPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({ tab, isActive, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.tabContent}>
        {/* Icon with Badge */}
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={(isActive ? tab.iconFilled : tab.icon) as any}
            size={22}
            color={isActive ? palette.primary : palette.onSurfaceVariant}
          />
          
          {tab.badgeCount && tab.badgeCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {tab.badgeCount > 9 ? '9+' : tab.badgeCount}
              </Text>
            </View>
          )}
        </View>

        {/* Label */}
        <Text
          style={[
            styles.tabLabel,
            {
              color: isActive ? palette.primary : palette.onSurfaceVariant,
              fontWeight: isActive ? '600' : '400',
            },
          ]}
        >
          {tab.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Bottom Tab Bar ──────────────────────────────────────────────────────

interface BottomTabBarProps {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  badgeCounts?: Partial<Record<TabKey, number>>;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabPress,
  badgeCounts = {},
}) => {
  const insets = useSafeAreaInsets();
  const activeIndex = TABS.findIndex((t) => t.key === activeTab);

  const tabsWithBadges = TABS.map((tab) => ({
    ...tab,
    badgeCount: badgeCounts[tab.key] ?? tab.badgeCount,
  }));

  return (
    <View
      style={[
        styles.barWrapper,
        { paddingBottom: insets.bottom || 8 },
      ]}
    >
      <SlideIndicator activeIndex={activeIndex} />
      
      <View style={styles.tabsRow}>
        {tabsWithBadges.map((tab) => (
          <TabItem
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onPress={() => onTabPress(tab.key)}
          />
        ))}
      </View>
    </View>
  );
};

// ─── Full Navigator Shell ─────────────────────────────────────────────────────

interface BottomTabNavigatorProps {
  initialTab?: TabKey;
  screens: Record<TabKey, React.ReactNode>;
  badgeCounts?: Partial<Record<TabKey, number>>;
  onTabChange?: (tab: TabKey) => void;
}

const BottomTabNavigator: React.FC<BottomTabNavigatorProps> = ({
  initialTab = 'home',
  screens,
  badgeCounts,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const handleTabPress = (tab: TabKey) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <View style={styles.navigatorRoot}>
      {/* Screen content area */}
      <View style={styles.screenContainer}>
        {TABS.map((tab) => (
          <View
            key={tab.key}
            style={[
              styles.screen,
              { display: activeTab === tab.key ? 'flex' : 'none' },
            ]}
          >
            {screens[tab.key]}
          </View>
        ))}
      </View>

      {/* Bottom Tab Bar */}
      <BottomTabBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
        badgeCounts={badgeCounts}
      />
    </View>
  );
};

// ─── Compact Styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  navigatorRoot: {
    flex: 1,
    backgroundColor: palette.background,
  },
  screenContainer: {
    flex: 1,
    position: 'relative',
  },
  screen: {
    flex: 1,
  },
  
  // Tab bar - COMPACT VERSION
  barWrapper: {
    backgroundColor: palette.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: `${palette.outlineVariant}30`,
  },
  
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: TAB_WIDTH,
    height: 2.5,
    backgroundColor: palette.primary,
    borderTopLeftRadius: 2.5,
    borderTopRightRadius: 2.5,
  },
  
  tabsRow: {
    flexDirection: 'row',
    paddingTop: 6,
    paddingBottom: 6,
  },
  
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  iconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: palette.surfaceContainerLowest,
  },
  
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: palette.onError,
    lineHeight: 11,
  },
  
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.2,
    marginTop: 2,
  },
});

export { BottomTabBar, TABS };
export type { BottomTabBarProps };
export default BottomTabNavigator;