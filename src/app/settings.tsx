import React from 'react';
import { router } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { Card, IconButton, Screen, Section, Segmented, T } from '@/components/ui';
import { LANGUAGES } from '@/i18n';
import type { ThemePref } from '@/services/storage';

const THEMES: ThemePref[] = ['system', 'light', 'dark'];

export default function Settings() {
  const { t, lang, setLang, themePref, setTheme } = useApp();
  return (
    <Screen title={t.settings.title} tabSpace={false} right={<IconButton icon="close" label={t.common.close} onPress={() => router.back()} />}>
      <Section title={t.settings.language}>
        <Segmented options={LANGUAGES.map((l) => l.name)} value={LANGUAGES.findIndex((l) => l.id === lang)} onChange={(i) => setLang(LANGUAGES[i].id)} />
      </Section>
      <Section title={t.settings.theme}>
        <Segmented options={[t.settings.system, t.settings.light, t.settings.dark]} value={THEMES.indexOf(themePref)} onChange={(i) => setTheme(THEMES[i])} />
      </Section>
      <Card style={{ marginTop: 18 }}><T size={14} muted>{t.settings.contentNote}</T></Card>
    </Screen>
  );
}
