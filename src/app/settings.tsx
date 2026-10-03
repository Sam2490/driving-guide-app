import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { Icon } from '@/components/Icon';
import { fontFor, lineHeightFor } from '@/theme/fonts';
import { useApp, useDir } from '@/state/AppProvider';
import { Card, IconButton, Screen, Section, Segmented, T } from '@/components/ui';
import { LANGUAGES } from '@/i18n';
import type { ThemePref } from '@/services/storage';

const THEMES: ThemePref[] = ['system', 'light', 'dark'];

export default function Settings() {
  const { t, c, lang, setLang, themePref, setTheme } = useApp();
  const d = useDir();
  return (
    <Screen title={t.settings.title} tabSpace={false} right={<IconButton icon="close" label={t.common.close} onPress={() => router.back()} />}>
      <Section title={t.settings.language}>
        <Card style={{ padding: 6 }}>
          {LANGUAGES.map((l) => (
            <Pressable key={l.id} accessibilityRole="radio" accessibilityState={{ selected: l.id === lang }} accessibilityLabel={l.name} onPress={() => setLang(l.id)} style={[styles.row, { flexDirection: d.row, backgroundColor: l.id === lang ? c.fill : 'transparent' }]}>
              <Text style={{ flex: 1, fontFamily: fontFor(l.id, l.id === lang ? 'semibold' : 'regular'), fontSize: 17, lineHeight: lineHeightFor(l.id, 17), color: l.id === lang ? c.ac : c.tx, textAlign: d.align }}>{l.name}</Text>
              {l.id === lang ? <Icon name="check" size={20} color={c.ac} /> : null}
            </Pressable>
          ))}
        </Card>
      </Section>
      <Section title={t.settings.theme}>
        <Segmented options={[t.settings.system, t.settings.light, t.settings.dark]} value={THEMES.indexOf(themePref)} onChange={(i) => setTheme(THEMES[i])} />
      </Section>
      <Card style={{ marginTop: 18 }}><T size={14} muted>{t.settings.contentNote}</T></Card>
    </Screen>
  );
}

const styles = StyleSheet.create({ row: { alignItems: 'center', minHeight: 52, paddingHorizontal: 14, borderRadius: 12, gap: 10 } });
