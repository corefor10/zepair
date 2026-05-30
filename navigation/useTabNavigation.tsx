import { useRef, useState, useCallback } from 'react';
import { TabKey } from './BottomTabNavigator';

/**
 * Lightweight hook to manage tab state + history outside the navigator,
 * useful when you need to programmatically switch tabs from a screen.
 *
 * Usage:
 *   const { activeTab, navigate, goBack, canGoBack } = useTabNavigation('home');
 */
const useTabNavigation = (initial: TabKey = 'home') => {
  const [activeTab, setActiveTab] = useState<TabKey>(initial);
  const historyRef = useRef<TabKey[]>([initial]);

  const navigate = useCallback((tab: TabKey) => {
    if (tab === activeTab) return;
    historyRef.current.push(tab);
    setActiveTab(tab);
  }, [activeTab]);

  const goBack = useCallback(() => {
    if (historyRef.current.length <= 1) return;
    historyRef.current.pop();
    const prev = historyRef.current[historyRef.current.length - 1];
    setActiveTab(prev);
  }, []);

  const canGoBack = historyRef.current.length > 1;

  const reset = useCallback((tab: TabKey = 'home') => {
    historyRef.current = [tab];
    setActiveTab(tab);
  }, []);

  return {
    activeTab,
    navigate,
    goBack,
    canGoBack,
    reset,
    history: historyRef.current,
  };
};

export default useTabNavigation;
