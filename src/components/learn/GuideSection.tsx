import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useApp, useDir } from '@/state/AppProvider';
import { useStudy } from '@/state/StudyProvider';
import { Badge, Card, EmptyState, ListRow, Row, SearchBox, Section, SourceBadge, T } from '@/components/ui';
import { Icon, type IconName } from '@/components/Icon';
import { GUIDE_TOPICS } from '@/data/licenseGuide';
import { topicText } from '@/data/localize';
import { TIPS, TIRE_RATINGS } from '@/data/tips';
import { RADIUS, SPACE } from '@/theme/tokens';

/** Guide topics (with read status), then the quick tips and the tyre speed card that used to sit on Home. */
export function GuideSection({ onOpen, selected }: { onOpen: (id: string) => void; selected?: string }) {
  const { t, c, lang } = useApp();
  const { learn } = useStudy();
  const d = useDir();
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? GUIDE_TOPICS.filter((x) => JSON.stringify(topicText(x, lang)).toLowerCase().includes(s)) : GUIDE_TOPICS;
  }, [q, lang]);
  const read = GUIDE_TOPICS.filter((x) => learn.read.includes(x.id)).length;
  return (
    <View style={{ gap: SPACE.sm }}>
      <T muted>{t.guide.sub}</T>
      <Row gap={SPACE.sm} style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <SourceBadge kind="official" style={{ flexGrow: 1, flexShrink: 1, flexBasis: 160 }} />
        <Badge tone={read ? 'ok' : 'neutral'} icon="book" text={t.rd.readCount(read, GUIDE_TOPICS.length)} />
      </Row>
      <SearchBox value={q} onChange={setQ} placeholder={t.guide.search} />
      {list.length === 0 ? <EmptyState text={t.common.noResults} /> : null}
      {list.map((topic) => {
        const title = topicText(topic, lang).title;
        const isRead = learn.read.includes(topic.id);
        return (
          <View key={topic.id} style={selected === topic.id ? [styles.sel, { borderColor: c.acSolid }] : undefined}>
            <ListRow
              icon={topic.icon as IconName}
              title={title}
              content={lang === 'ar'}
              label={isRead ? `${title}, ${t.rd.isRead}` : title}
              badge={isRead ? <Icon name="check" size={16} color={c.ok} /> : undefined}
              onPress={() => onOpen(topic.id)}
            />
          </View>
        );
      })}
      <T size={14} muted>{t.guide.note}</T>

      {/* Quick tips are not searched, so they step aside while a search is running. */}
      {q.trim() ? null : <Section title={t.home.quick}>
        {TIPS[lang].map((tip) => (
          <Card key={tip.title} style={{ gap: SPACE.xs }}>
            <Row gap={SPACE.xs}>
              <Icon name="bulb" size={20} color={c.info} />
              <View style={{ flex: 1 }}><T role="title" content={lang === 'ar'}>{tip.title}</T></View>
            </Row>
            {tip.lines.map((line) => (
              <Row key={line} gap={SPACE.sm} style={{ alignItems: 'flex-start' }}>
                <View style={[styles.dot, { backgroundColor: c.info }]} />
                <View style={{ flex: 1 }}><T size={16} muted content={lang === 'ar'}>{line}</T></View>
              </Row>
            ))}
          </Card>
        ))}
        <Card style={{ gap: SPACE.xs }}>
          <T role="title">{t.home.tireT}</T>
          <T size={14} muted>{t.home.tireP}</T>
          <View style={[styles.tires, { flexDirection: d.row }]}>
            {TIRE_RATINGS.map(([letter, kmh]) => (
              <View key={letter} style={[styles.tire, { backgroundColor: c.fill }]} accessible accessibilityLabel={`${letter} ${kmh}`}>
                <T size={18} weight="bold" center latin maxScale={1.3}>{letter}</T>
                <T size={14} muted center maxScale={1.3}>{String(kmh)}</T>
              </View>
            ))}
          </View>
        </Card>
      </Section>}
    </View>
  );
}

const styles = StyleSheet.create({
  sel: { borderWidth: 2, borderRadius: RADIUS.md + 2, margin: -2 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 10 },
  tires: { flexWrap: 'wrap', gap: SPACE.xs },
  tire: { minWidth: 64, borderRadius: RADIUS.md, paddingVertical: SPACE.xs, paddingHorizontal: SPACE.xs },
});
