import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp, useDir } from '@/state/AppProvider';
import { Icon, type IconName } from '@/components/Icon';
import { T } from '@/components/ui';

const ICONS: Record<string, IconName> = { index: 'home', guide: 'book', signs: 'signs', test: 'exam', schools: 'schools' };

/** Floating glass tab bar, in the web app's style, ordered right-to-left for Arabic and Urdu. */
function TabBar({ state, navigation }: BottomTabBarProps) {
  const { c, t, lang } = useApp();
  const d = useDir();
  const insets = useSafeAreaInsets();
  const labels: Record<string, string> = { index: t.tabs.home, guide: t.tabs.guide, signs: t.tabs.signs, test: t.tabs.test, schools: t.tabs.schools };
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 10) }]}>
      <View style={[styles.bar, { backgroundColor: c.glass, borderColor: c.glassBorder, flexDirection: d.row }]}>
        {state.routes.map((route, i) => {
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
            <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={labels[route.name]} onPress={press} style={[styles.tab, on && { backgroundColor: c.fill, borderColor: c.glassBorder }]}>
              <Icon name={ICONS[route.name] ?? 'home'} size={24} color={on ? c.ac : c.tx2} />
              <T size={12} weight={on ? 'semibold' : 'regular'} color={on ? c.ac : c.tx2} center numberOfLines={1} style={{ lineHeight: lang === 'ur' ? 22 : 16 }}>
                {labels[route.name]}
              </T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { c } = useApp();
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="guide" />
      <Tabs.Screen name="signs" />
      <Tabs.Screen name="test" />
      <Tabs.Screen name="schools" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', paddingHorizontal: 12 },
  bar: { width: '100%', maxWidth: 520, borderRadius: 999, borderWidth: 1, padding: 8, gap: 4, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 56, borderRadius: 24, borderWidth: 1, borderColor: 'transparent', paddingVertical: 8 },
});
