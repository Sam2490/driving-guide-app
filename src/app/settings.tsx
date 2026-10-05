import React from 'react';
import { router } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { LanguageList } from '@/components/LanguageList';
import { Card, IconButton, Screen, Section, Segmented, T } from '@/components/ui';
import type { ThemePref } from '@/services/storage';

const THEMES: ThemePref[] = ['system', 'light', 'dark'];

export default function Settings() {
  const { t, lang, setLang, themePref, setTheme, pendingLang } = useApp();
  return (
    <Screen title={t.settings.title} tabSpace={false} right={<IconButton icon="close" label={t.common.close} onPress={() => router.back()} />}>
      <Section title={t.settings.language}>
        <Card style={{ padding: 8 }}>
          <LanguageList value={pendingLang ?? lang} onPick={setLang} pending={pendingLang} />
        </Card>
      </Section>
      <Section title={t.settings.theme}>
        <Segmented options={[t.settings.system, t.settings.light, t.settings.dark]} value={THEMES.indexOf(themePref)} onChange={(i) => setTheme(THEMES[i])} />
      </Section>
      <Card style={{ marginTop: 16 }}><T size={14} muted>{t.settings.contentNote}</T></Card>
    </Screen>
  );
}

