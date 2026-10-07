import React, { useEffect } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { getLocales } from 'expo-localization';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/state/AppProvider';
import type { Lang } from '@/data/types';
import { LAYOUT, MAX_CONTENT_WIDTH, RADIUS, SPACE } from '@/theme/tokens';
import { Button, Card, Row, T } from './ui';
import { Icon, type IconName } from './Icon';
import { LanguageList } from './LanguageList';

const SUPPORTED: Lang[] = ['ar', 'en', 'ur', 'hi', 'bn'];
const VALUE_ICONS: IconName[] = ['exam', 'signs', 'schools'];

/** First launch only: the palm mark, what the app does in three lines, then the language (it switches live). */
export function Welcome() {
  const { c, t, lang, setLang, pendingLang, finishWelcome } = useApp();
  const insets = useSafeAreaInsets();
  // Start from the phone's language when the app supports it.
  useEffect(() => {
    const device = getLocales()[0]?.languageCode;
    const guess = SUPPORTED.find((l) => l === device);
    if (guess && guess !== lang) setLang(guess);
    // Only once, on first show.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: LAYOUT.gutter, paddingTop: insets.top + SPACE.xl, paddingBottom: insets.bottom + SPACE.xl }}>
      <View style={{ width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', gap: SPACE.md }}>
        <Image source={require('../../assets/icon.png')} style={{ width: 80, height: 80, borderRadius: RADIUS.xl, alignSelf: 'center' }} accessibilityIgnoresInvertColors />
        <T role="h1" center header>{t.appName}</T>
        <View style={{ gap: SPACE.xs, alignSelf: 'center' }}>
          {t.rd.welcomeLines.map((line, i) => (
            <Row key={line} gap={SPACE.sm}>
              <Icon name={VALUE_ICONS[i] ?? 'check'} size={20} color={c.ac} />
              <T size={16}>{line}</T>
            </Row>
          ))}
        </View>
        <T role="h3" center style={{ marginTop: SPACE.sm }}>{t.ux.welcomeTitle}</T>
        <Card style={{ padding: SPACE.xs }}>
          <LanguageList value={pendingLang ?? lang} onPick={setLang} pending={pendingLang} />
        </Card>
        <T size={14} muted center>{t.ux.welcomeSub}</T>
        <Button title={t.ux.welcomeGo} onPress={() => finishWelcome(pendingLang ?? lang)} />
      </View>
    </ScrollView>
  );
}
