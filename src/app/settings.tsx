import React, { useState } from 'react';
import { router } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { useStudy } from '@/state/StudyProvider';
import { LanguageList } from '@/components/LanguageList';
import { Button, Card, Dialog, IconButton, ListRow, Row, Screen, Section, Segmented, T } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { EMPTY_PROGRESS } from '@/features/levels/levels';
import type { ThemePref } from '@/services/storage';
import { SPACE } from '@/theme/tokens';

const THEMES: ThemePref[] = ['system', 'light', 'dark'];

export default function Settings() {
  const { t, c, lang, setLang, themePref, setTheme, pendingLang, progress, setProgress } = useApp();
  const { mistakes, clearMistakes } = useStudy();
  const [ask, setAsk] = useState<null | 'levels' | 'mistakes'>(null);
  const hasLevels = Object.keys(progress.done).length > 0 || progress.xp > 0;
  const hasMistakes = Object.keys(mistakes).length > 0;
  return (
    <Screen title={t.settings.title} tabSpace={false} right={<IconButton icon="close" label={t.common.close} onPress={() => router.back()} />}>
      <Section title={t.settings.language}>
        <Card style={{ padding: SPACE.xs }}>
          <LanguageList value={pendingLang ?? lang} onPick={setLang} pending={pendingLang} />
        </Card>
      </Section>
      <Section title={t.settings.theme}>
        <Segmented options={[t.settings.system, t.settings.light, t.settings.dark]} value={THEMES.indexOf(themePref)} onChange={(i) => setTheme(THEMES[i])} />
        <Row gap={SPACE.xs}>
          <Icon name="text" size={16} color={c.tx2} />
          <T size={14} muted style={{ flex: 1 }}>{t.rd.textSize}</T>
        </Row>
      </Section>
      <Section title={t.rd.progressT}>
        <Button kind="secondary" icon="loop" title={t.levels.reset} disabled={!hasLevels} onPress={() => setAsk('levels')} />
        <Button kind="secondary" icon="trash" title={t.rd.clearMistakes} disabled={!hasMistakes} onPress={() => setAsk('mistakes')} />
      </Section>
      <Section title={t.home.about}>
        <ListRow icon="info" title={t.about.title} onPress={() => router.push('/about')} />
        <Card><T size={14} muted>{t.settings.contentNote}</T></Card>
      </Section>
      <Dialog
        visible={ask !== null}
        text={ask === 'levels' ? t.levels.resetq : t.rd.clearAsk}
        onClose={() => setAsk(null)}
        actions={
          <>
            <Button kind="secondary" title={t.common.cancel} onPress={() => setAsk(null)} />
            <Button
              kind="destructive"
              title={ask === 'levels' ? t.levels.reset : t.rd.clearMistakes}
              onPress={() => {
                if (ask === 'levels') setProgress(EMPTY_PROGRESS);
                else clearMistakes();
                setAsk(null);
              }}
            />
          </>
        }
      />
    </Screen>
  );
}
