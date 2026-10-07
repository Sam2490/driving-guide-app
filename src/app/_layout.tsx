import React, { useEffect } from 'react';
import { Appearance, I18nManager, Platform, Pressable, Text, View } from 'react-native';
import { router, Stack, type ErrorBoundaryProps } from 'expo-router';
import { getLocales } from 'expo-localization';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '@/state/AppProvider';
import { ExamProvider } from '@/state/ExamProvider';
import { StudyProvider } from '@/state/StudyProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { STRINGS } from '@/i18n';
import type { Lang } from '@/data/types';
import { dark, light } from '@/theme/colors';
import { FONT_FILES } from '@/theme/fonts';
import { Loading } from '@/components/ui';
import { Welcome } from '@/components/Welcome';

SplashScreen.preventAutoHideAsync().catch(() => {});
// The app lays out right-to-left itself, so the system mirroring stays off.
if (Platform.OS !== 'web' && I18nManager.isRTL) {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
}

function Root() {
  const { ready, c, isDark, firstRun } = useApp();
  const reduce = useReducedMotion();
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.bg).catch(() => {});
  }, [c.bg]);
  if (!ready) return <Loading />;
  if (firstRun) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Welcome />
      </>
    );
  }
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg }, animation: reduce ? 'none' : 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="exam" options={{ gestureEnabled: false }} />
        <Stack.Screen name="result" options={{ gestureEnabled: false }} />
        <Stack.Screen name="review" />
        <Stack.Screen name="level/[n]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="drill" options={{ gestureEnabled: false }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="about" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts(FONT_FILES);
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);
  if (!loaded && !error) return null;
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StudyProvider>
          <ExamProvider>
            <Root />
          </ExamProvider>
        </StudyProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

/**
 * Shown instead of the app if a screen throws while rendering. It does not depend on the app state (which may be
 * what failed), shows no technical details, and logs nothing.
 */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  const code = getLocales()[0]?.languageCode ?? 'ar';
  const lang: Lang = (['ar', 'en', 'ur', 'hi', 'bn'] as const).find((l) => l === code) ?? 'ar';
  const t = STRINGS[lang];
  // Follows the phone's light/dark setting directly; the app's own theme state may be what failed.
  const p = Appearance.getColorScheme() === 'light' ? light : dark;
  const btn = { backgroundColor: p.acSolid, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 24, minWidth: 200 } as const;
  return (
    <View style={{ flex: 1, backgroundColor: p.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
      <Text accessibilityRole="header" style={{ color: p.tx, fontSize: 18, textAlign: 'center' }}>{t.errors.crashed}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={t.common.tryAgain} onPress={() => retry()} style={btn}>
        <Text style={{ color: p.onAc, fontSize: 18, textAlign: 'center' }}>{t.common.tryAgain}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.common.home}
        onPress={() => {
          try {
            router.replace('/');
          } catch {
            // Navigation itself may be what failed; retrying still re-renders the app.
          }
          retry();
        }}
        style={[btn, { backgroundColor: p.fill }]}
      >
        <Text style={{ color: p.tx, fontSize: 18, textAlign: 'center' }}>{t.common.home}</Text>
      </Pressable>
    </View>
  );
}
