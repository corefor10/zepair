/**
 * Zepair — Responsive Context
 *
 * Provides the entire component tree with:
 *   • Current breakpoint + boolean helpers (isMobile, isTablet, isDesktop)
 *   • Viewport dimensions (width / height)
 *   • Safe-area insets (iOS notch / Android edge-to-edge)
 *   • Orientation ("portrait" | "landscape")
 *   • Reduced-motion preference
 *
 * Usage
 * ─────
 *   // 1. Wrap your app once
 *   <ResponsiveProvider>
 *     <App />
 *   </ResponsiveProvider>
 *
 *   // 2. Consume anywhere
 *   const { isMobile, breakpoint, safeArea } = useResponsive();
 */

"use client"; // Next.js — remove if using plain React / Vite (kept from original)

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
  CSSProperties,
} from "react";

import { breakpoints } from "./theme";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ResponsiveValue {
  breakpoint: string;
  viewportWidth: number;
  viewportHeight: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isMobileCanvas: boolean;
  orientation: "portrait" | "landscape";
  safeArea: SafeAreaInsets;
  prefersReducedMotion: boolean;
  responsive: <T>(map: Partial<Record<string, T>>) => T | undefined;
}

interface ResponsiveProviderProps {
  children: ReactNode;
  debounceMs?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Ordered list of breakpoint keys, smallest → largest. */
const BP_ORDER = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the named breakpoint for a given viewport width.
 */
function resolveBreakpoint(width: number): string {
  for (let i = BP_ORDER.length - 1; i >= 0; i--) {
    const key = BP_ORDER[i];
    if (width >= breakpoints[key]) return key;
  }
  return "xs";
}

/**
 * Reads a single CSS env() safe-area-inset side in px.
 * Uses a throw-away DOM element so env() is evaluated by the browser.
 */
function readSafeAreaInset(side: "top" | "right" | "bottom" | "left"): number {
  if (typeof window === "undefined") return 0;
  const el = document.createElement("div");
  el.style.cssText = `
    position: fixed;
    pointer-events: none;
    opacity: 0;
    height: env(safe-area-inset-${side}, 0px);
    width:  env(safe-area-inset-${side}, 0px);
  `;
  document.body.appendChild(el);
  const value =
    parseFloat(getComputedStyle(el).height) ||
    parseFloat(getComputedStyle(el).width) ||
    0;
  document.body.removeChild(el);
  return value;
}

/**
 * Reads all four safe-area insets.
 */
function readAllSafeAreaInsets(): SafeAreaInsets {
  if (typeof window === "undefined") {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  return {
    top: readSafeAreaInset("top"),
    right: readSafeAreaInset("right"),
    bottom: readSafeAreaInset("bottom"),
    left: readSafeAreaInset("left"),
  };
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ResponsiveContext = createContext<ResponsiveValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * Provides responsive context to all children.
 */
export function ResponsiveProvider({
  children,
  debounceMs = 100,
}: ResponsiveProviderProps) {
  // ── State ─────────────────────────────────────────────────────────────────

  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerWidth : breakpoints.sm,
  );
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerHeight : 844,
  );
  const [safeArea, setSafeArea] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Resize handler ────────────────────────────────────────────────────────

  const handleResize = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const update = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
      setSafeArea(readAllSafeAreaInsets());
    };

    if (debounceMs === 0) {
      update();
    } else {
      timerRef.current = setTimeout(update, debounceMs);
    }
  }, [debounceMs]);

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Initial safe-area read after mount (env() not available during SSR)
    setSafeArea(readAllSafeAreaInsets());

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, {
      passive: true,
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleResize]);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────

  const breakpoint = useMemo<string>(
    () => resolveBreakpoint(viewportWidth),
    [viewportWidth],
  );
  const isMobile = viewportWidth < breakpoints.md;
  const isTablet =
    viewportWidth >= breakpoints.md && viewportWidth < breakpoints.lg;
  const isDesktop = viewportWidth >= breakpoints.lg;
  const isMobileCanvas = viewportWidth <= breakpoints.sm;
  const orientation: "portrait" | "landscape" =
    viewportHeight > viewportWidth ? "portrait" : "landscape";

  // ── responsive() helper ───────────────────────────────────────────────────

  /**
   * Resolves a value from a breakpoint map for the current viewport.
   * Falls back to the nearest smaller breakpoint if the exact one is absent.
   */
  const responsive = useCallback(
    <T,>(map: Partial<Record<string, T>>): T | undefined => {
      const currentIndex = BP_ORDER.indexOf(breakpoint as string);
      for (let i = currentIndex; i >= 0; i--) {
        const key = BP_ORDER[i];
        if (key in map) return map[key];
      }
      return undefined;
    },
    [breakpoint],
  );

  // ── Context value ─────────────────────────────────────────────────────────

  const value = useMemo<ResponsiveValue>(
    () => ({
      breakpoint,
      viewportWidth,
      viewportHeight,
      isMobile,
      isTablet,
      isDesktop,
      isMobileCanvas,
      orientation,
      safeArea,
      prefersReducedMotion,
      responsive,
    }),
    [
      breakpoint,
      viewportWidth,
      viewportHeight,
      orientation,
      safeArea,
      prefersReducedMotion,
      responsive,
    ],
  );

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
}

// ─── Primary hook ─────────────────────────────────────────────────────────────

/**
 * Access the full responsive state anywhere inside <ResponsiveProvider>.
 */
export function useResponsive(): ResponsiveValue {
  const ctx = useContext(ResponsiveContext);
  if (!ctx) {
    throw new Error(
      "[Zepair] useResponsive() must be called inside <ResponsiveProvider>.\n" +
        "Wrap your app root (or page root) with <ResponsiveProvider>.",
    );
  }
  return ctx;
}

// ─── Convenience hooks ────────────────────────────────────────────────────────

/** Returns true when viewport width is below md (768 px). */
export function useIsMobile(): boolean {
  return useResponsive().isMobile;
}

/** Returns the current named breakpoint string. */
export function useBreakpoint(): string {
  return useResponsive().breakpoint;
}

/** Returns whether the user prefers reduced motion. */
export function usePrefersReducedMotion(): boolean {
  return useResponsive().prefersReducedMotion;
}

/**
 * Returns a value from a responsive map for the current breakpoint.
 */
export function useResponsiveValue<T>(map: Partial<Record<string, T>>): T | undefined {
  return useResponsive().responsive(map);
}

export default ResponsiveContext;
