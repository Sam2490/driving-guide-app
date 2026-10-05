import React, { useEffect } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { getLocales } from 'expo-localization';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/state/AppProvider';
import type { Lang } from '@/data/types';
import { SPACE, MAX_CONTENT_WIDTH } from '@/theme/tokens';
import { Button, Card, T } from './ui';
import { LanguageList } from './LanguageList';

const SUPPORTED: Lang[] = ['ar', 'en', 'ur', 'hi', 'bn'];

/** First launch only: pick a language before anything else (the app serves five audiences). */
export function Welcome() {
  const { c, t, lang, setLang, pendingLang, finishWelcome } = useApp();
  const insets = useSafeAreaInsets();
  // Start from the phone's language when the app supports it. Picking a language switches the screen to it
  // straight away (fonts, direction and words), so the choice is confirmed as soon as it is tapped.
  useEffect(() => {
    const device = getLocales()[0]?.languageCode;
    const guess = SUPPORTED.find((l) => l === device);
    if (guess && guess !== lang) setLang(guess);
    // Only once, on first show.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: SPACE.lg, paddingTop: insets.top + SPACE.xl, paddingBottom: insets.bottom + SPACE.xl }}>
      <View style={{ width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', gap: SPACE.md }}>
        <Image source={require('../../assets/icon.png')} style={{ width: 72, height: 72, borderRadius: 16, alignSelf: 'center' }} accessibilityIgnoresInvertColors />
        <T size={24} weight="bold" center role="header">{t.ux.welcomeTitle}</T>
        <T size={14} muted center>{t.ux.welcomeSub}</T>
        <Card style={{ padding: SPACE.xs }}>
          <LanguageList value={pendingLang ?? lang} onPick={setLang} pending={pendingLang} />
        </Card>
        <Button title={t.ux.welcomeGo} onPress={() => finishWelcome(pendingLang ?? lang)} />
      </View>
    </ScrollView>
  );
}
