import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useApp, useDir } from '@/state/AppProvider';
import { Card, EmptyState, Row, Screen, SearchBox, SourceBadge, T } from '@/components/ui';
import { Icon, type IconName } from '@/components/Icon';
import { GUIDE_TOPICS } from '@/data/licenseGuide';
import { topicText } from '@/data/localize';

export default function GuideIndex() {
  const { t, c, lang } = useApp();
  const d = useDir();
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? GUIDE_TOPICS.filter((x) => JSON.stringify(topicText(x, lang)).toLowerCase().includes(s)) : GUIDE_TOPICS;
  }, [q, lang]);
  return (
    <Screen title={t.guide.title}>
      <T muted>{t.guide.sub}</T>
      <Card label={t.guide.licenseCard} onPress={() => router.push('/guide/license')} accent={c.feature.license + '66'}>
        <Row>
          <View style={[styles.chip, { backgroundColor: c.feature.license + '29' }]}><Icon name="license" color={c.feature.license} /></View>
          <View style={{ flex: 1 }}>
            <T size={18} weight="semibold">{t.guide.licenseCard}</T>
            <T size={14} muted>{t.guide.licenseCardSub}</T>
          </View>
          <Icon name="go" size={18} color={c.tx2} flip={!d.rtl} />
        </Row>
      </Card>
      <SourceBadge kind="official" />
      <SearchBox value={q} onChange={setQ} placeholder={t.guide.search} />
      {list.length === 0 ? <EmptyState text={t.common.noResults} /> : null}
      {list.map((topic) => (
        <Card key={topic.id} label={topicText(topic, lang).title} onPress={() => router.push({ pathname: '/guide/[topic]', params: { topic: topic.id, q } })}>
          <Row>
            <View style={[styles.chip, { backgroundColor: c.fill }]}><Icon name={topic.icon as IconName} size={20} color={c.feature.guide} /></View>
            <View style={{ flex: 1 }}><T size={16} weight="medium" content={lang === 'ar'}>{topicText(topic, lang).title}</T></View>
            <Icon name="go" size={18} color={c.tx2} flip={!d.rtl} />
          </Row>
        </Card>
      ))}
      <T size={14} muted>{t.guide.note}</T>
    </Screen>
  );
}

const styles = StyleSheet.create({ chip: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' } });
