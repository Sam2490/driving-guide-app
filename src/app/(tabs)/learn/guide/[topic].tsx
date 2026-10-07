import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { Screen } from '@/components/ui';
import { TopicBody } from '@/components/learn/Details';
import { GUIDE_TOPICS } from '@/data/licenseGuide';
import { topicText } from '@/data/localize';

export default function Topic() {
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const { lang } = useApp();
  const item = GUIDE_TOPICS.find((x) => x.id === topic);
  return (
    <Screen back title={item ? topicText(item, lang).title : undefined} contentTitle={lang === 'ar'}>
      <TopicBody id={topic ?? ''} onNav={(id) => router.replace({ pathname: '/learn/guide/[topic]', params: { topic: id } })} />
    </Screen>
  );
}
