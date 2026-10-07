import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp, useDir } from '@/state/AppProvider';
import { Icon, type IconName } from '@/components/Icon';
import { T } from '@/components/ui';
import { BREAKPOINTS, ICON, RADIUS, SPACE } from '@/theme/tokens';

const ICONS: Record<string, IconName> = { index: 'home', practice: 'exam', learn: 'book', schools: 'schools' };

/**
 * Docked tab bar (level 2: hairline, no shadow) with four tabs, ordered right-to-left for Arabic and Urdu.
 * On wide screens (840 pt+) the same tabs become a navigation rail on the reading-start side.
 */
function TabBar({ state, navigation }: BottomTabBarProps) {
  const { c, t, lang } = useApp();
  const d = useDir();
  const insets = useSafeAreaInsets();
  const rail = useWindowDimensions().width >= BREAKPOINTS.expanded;
  const labels: Record<string, string> = { index: t.tabs.home, practice: t.tabs.practice, learn: t.tabs.learn, schools: t.tabs.schools };
  const items = state.routes.map((route, i) => {
    const on = state.index === i;
    const press = () => {
      const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!on && !e.defaultPrevented) {
        Haptics.selectionAsync().catch(() => {});
        navigation.navigate(route.name);
      } else if (on) {
        navigation.navigate(route.name, { screen: 'index' } as never);
      }
    };
    return (
      <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={labels[route.name]} onPress={press} style={rail ? styles.railTab : styles.tab}>
        <View style={[styles.pill, { backgroundColor: on ? c.acSoft : 'transparent' }]}>
          <Icon name={ICONS[route.name] ?? 'home'} size={ICON.nav} color={on ? c.onAcSoft : c.tx2} />
        </View>
        <T size={12} weight={on ? 'semibold' : 'medium'} color={on ? c.ac : c.tx2} center numberOfLines={1} maxScale={1.2} style={{ lineHeight: lang === 'ur' ? 22 : 16 }}>
          {labels[route.name]}
        </T>
      </Pressable>
    );
  });
  if (rail) {
    return (
      <View style={[styles.rail, { backgroundColor: c.card, paddingTop: insets.top + SPACE.md, borderColor: c.ln }, d.rtl ? { borderLeftWidth: 1 } : { borderRightWidth: 1 }]}>
        {items}
      </View>
    );
  }
  return (
    <View style={[styles.bar, { backgroundColor: c.card, borderTopColor: c.ln, paddingBottom: Math.max(insets.bottom, SPACE.xs), flexDirection: d.row }]}>
      {items}
    </View>
  );
}

export default function TabLayout() {
  const { c, rtl } = useApp();
  const rail = useWindowDimensions().width >= BREAKPOINTS.expanded;
  return (
    <Tabs
      tabBar={(p) => <TabBar {...p} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg }, tabBarPosition: rail ? (rtl ? 'right' : 'left') : 'bottom' }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="practice" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="schools" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { borderTopWidth: 1, paddingTop: SPACE.xs, paddingHorizontal: SPACE.xs },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: 56 },
  pill: { width: 56, height: 30, borderRadius: RADIUS.pill, alignItems: 'center', justifyContent: 'center' },
  rail: { width: 96, alignItems: 'center', gap: SPACE.md },
  railTab: { alignItems: 'center', justifyContent: 'center', gap: SPACE.xxs, minHeight: 64, width: 88 },
});
