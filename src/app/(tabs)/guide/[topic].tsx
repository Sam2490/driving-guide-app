import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp, useDir } from '@/state/AppProvider';
import { Button, Card, EmptyState, Row, Screen, SourceBadge, T } from '@/components/ui';
import { GUIDE_TOPICS } from '@/data/licenseGuide';
import { topicText } from '@/data/localize';

export default function Topic() {
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const { t, c, lang } = useApp();
  const d = useDir();
  const item = GUIDE_TOPICS.find((x) => x.id === topic);
  if (!item) return <Screen back><EmptyState text={t.common.noResults} /></Screen>;
  const tx = topicText(item, lang);
  const at = GUIDE_TOPICS.indexOf(item);
  const prev = at > 0 ? GUIDE_TOPICS[at - 1] : undefined;
  const next = GUIDE_TOPICS[at + 1];
  const ar = lang === 'ar';
  return (
    <Screen back title={tx.title} contentTitle={ar}>
      <SourceBadge kind="official" />
      {tx.blocks.map((b, i) =>
        'text' in b ? (
          <Row key={i} gap={12} style={{ alignItems: 'flex-start' }}>
            <View style={[styles.dot, { backgroundColor: c.feature.guide }]} />
            <View style={{ flex: 1 }}><T content={ar} size={16}>{b.text}</T></View>
          </Row>
        ) : (
          <Card key={i} style={{ padding: 0, overflow: 'hidden' }}>
            {b.table.map((row, r) => (
              <View key={r} style={[styles.tr, { flexDirection: d.row, backgroundColor: r === 0 ? c.fill : 'transparent', borderTopColor: c.ln, borderTopWidth: r ? 1 : 0 }]}>
                {row.map((cell, k) => (
                  <View key={k} style={{ flex: k === row.length - 1 ? 2 : 1, padding: 12 }}>
                    <T content={ar} size={14} weight={r === 0 ? 'semibold' : 'regular'}>{cell}</T>
                  </View>
                ))}
              </View>
            ))}
          </Card>
        ),
      )}
      {/* Keep reading without going back to the list. */}
      <Row gap={12} style={{ marginTop: 8 }}>
        {prev ? <Button small kind="ghost" title={t.ux.prevTopic} onPress={() => router.replace({ pathname: '/guide/[topic]', params: { topic: prev.id } })} style={{ flex: 1 }} /> : <View style={{ flex: 1 }} />}
        {next ? <Button small title={t.ux.nextTopic} onPress={() => router.replace({ pathname: '/guide/[topic]', params: { topic: next.id } })} style={{ flex: 1 }} /> : <View style={{ flex: 1 }} />}
      </Row>
    </Screen>
  );
}

const styles = StyleSheet.create({ dot: { width: 5, height: 5, borderRadius: 3, marginTop: 12 }, tr: { alignItems: 'stretch' } });
