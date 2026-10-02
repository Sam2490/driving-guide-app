import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { Card, Chip, EmptyState, Screen, T } from '@/components/ui';
import { SignImage } from '@/components/Media';
import { SIGNS } from '@/data/signs';
import { signName } from '@/data/localize';

export default function SignDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, c, lang } = useApp();
  const s = SIGNS.find((x) => x.id === id);
  if (!s) return <Screen back><EmptyState text={t.common.noResults} /></Screen>;
  return (
    <Screen back title={signName(s, lang)} contentTitle={lang === 'ar'}>
      <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
        <View style={{ backgroundColor: c.fill, borderRadius: 18, padding: 16 }}>
          <SignImage id={s.id} size={220} label={s.nameAr} />
        </View>
      </Card>
      <Card style={{ gap: 6 }}>
        <T size={20} weight="bold" content={lang === 'ar'}>{signName(s, lang)}</T>
        {lang !== 'ar' ? <T size={16} muted content>{s.nameAr}</T> : null}
        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          <Chip label={`${t.signs.group}: ${lang === 'ar' ? s.group : t.signs.groups[s.group] ?? s.group}`} />
        </View>
      </Card>
      <T size={12} muted>{t.signs.credit}</T>
    </Screen>
  );
}
