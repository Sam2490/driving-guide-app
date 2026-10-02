import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useApp, useDir } from '@/state/AppProvider';
import { Card, EmptyState, Notice, Row, Screen, SearchBox, SourceBadge, T } from '@/components/ui';
import { Icon, type IconName } from '@/components/Icon';
import { GUIDE_TOPICS } from '@/data/licenseGuide';
import { FEATURE } from '@/theme/colors';

export default function GuideIndex() {
  const { t, c, lang } = useApp();
  const d = useDir();
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const s = q.trim();
    return s ? GUIDE_TOPICS.filter((x) => JSON.stringify(x).includes(s)) : GUIDE_TOPICS;
  }, [q]);
  return (
    <Screen title={t.guide.title}>
      <T muted>{t.guide.sub}</T>
      <Card label={t.guide.licenseCard} onPress={() => router.push('/guide/license')} accent={FEATURE.license + '66'}>
        <Row>
          <View style={[styles.chip, { backgroundColor: FEATURE.license + '29' }]}><Icon name="license" color={FEATURE.license} /></View>
          <View style={{ flex: 1 }}>
            <T size={17} weight="semibold">{t.guide.licenseCard}</T>
            <T size={13} muted>{t.guide.licenseCardSub}</T>
          </View>
          <Icon name="go" size={18} color={c.tx2} flip={!d.rtl} />
        </Row>
      </Card>
      <SourceBadge kind="official" />
      {lang !== 'ar' ? <Notice text={t.common.arabicOnly} /> : null}
      <SearchBox value={q} onChange={setQ} placeholder={t.guide.search} />
      {list.length === 0 ? <EmptyState text={t.common.noResults} /> : null}
      {list.map((topic) => (
        <Card key={topic.id} label={topic.title} onPress={() => router.push({ pathname: '/guide/[topic]', params: { topic: topic.id, q } })}>
          <Row>
            <View style={[styles.chip, { backgroundColor: c.fill }]}><Icon name={topic.icon as IconName} size={20} color={FEATURE.guide} /></View>
            <View style={{ flex: 1 }}><T size={16} weight="medium" content>{topic.title}</T></View>
            <Icon name="go" size={18} color={c.tx2} flip={!d.rtl} />
          </Row>
        </Card>
      ))}
      <T size={13} muted>{t.guide.note}</T>
    </Screen>
  );
}

const styles = StyleSheet.create({ chip: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' } });
