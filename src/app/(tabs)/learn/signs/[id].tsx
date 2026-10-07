import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { Screen } from '@/components/ui';
import { SignDetailBody } from '@/components/learn/Details';
import { SIGNS } from '@/data/signs';
import { signName } from '@/data/localize';

export default function SignDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lang } = useApp();
  const s = SIGNS.find((x) => x.id === id);
  return (
    <Screen back title={s ? signName(s, lang) : undefined} contentTitle={lang === 'ar'}>
      <SignDetailBody
        id={id ?? ''}
        onOpen={(r) => router.replace({ pathname: '/learn/signs/[id]', params: { id: r } })}
        onPractise={(group) => router.navigate({ pathname: '/learn', params: { section: 'signs', group, practice: '1' } })}
      />
    </Screen>
  );
}
