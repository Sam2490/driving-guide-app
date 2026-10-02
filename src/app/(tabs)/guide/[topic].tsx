import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useApp, useDir } from '@/state/AppProvider';
import { Card, EmptyState, Row, Screen, SourceBadge, T } from '@/components/ui';
import { GUIDE_TOPICS } from '@/data/licenseGuide';
import { topicText } from '@/data/localize';
import { FEATURE } from '@/theme/colors';

export default function Topic() {
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const { t, c, lang } = useApp();
  const d = useDir();
  const item = GUIDE_TOPICS.find((x) => x.id === topic);
  if (!item) return <Screen back><EmptyState text={t.common.noResults} /></Screen>;
  const tx = topicText(item, lang);
  const ar = lang === 'ar';
  return (
    <Screen back title={tx.title} contentTitle={ar}>
      <SourceBadge kind="official" />
      {tx.blocks.map((b, i) =>
        'text' in b ? (
          <Row key={i} gap={10} style={{ alignItems: 'flex-start' }}>
            <View style={[styles.dot, { backgroundColor: FEATURE.guide }]} />
            <View style={{ flex: 1 }}><T content={ar} size={16}>{b.text}</T></View>
          </Row>
        ) : (
          <Card key={i} style={{ padding: 0, overflow: 'hidden' }}>
            {b.table.map((row, r) => (
              <View key={r} style={[styles.tr, { flexDirection: d.row, backgroundColor: r === 0 ? c.fill : 'transparent', borderTopColor: c.ln, borderTopWidth: r ? 1 : 0 }]}>
                {row.map((cell, k) => (
                  <View key={k} style={{ flex: k === row.length - 1 ? 2 : 1, padding: 10 }}>
                    <T content={ar} size={14} weight={r === 0 ? 'semibold' : 'regular'}>{cell}</T>
                  </View>
                ))}
              </View>
            ))}
          </Card>
        ),
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({ dot: { width: 5, height: 5, borderRadius: 3, marginTop: 12 }, tr: { alignItems: 'stretch' } });
