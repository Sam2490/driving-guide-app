import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useApp, useDir } from '@/state/AppProvider';
import { useStudy } from '@/state/StudyProvider';
import { Badge, Button, Card, Chip, EmptyState, Row, Section, SourceBadge, T } from '@/components/ui';
import { SignImage } from '@/components/Media';
import { SIGNS } from '@/data/signs';
import { GUIDE_TOPICS } from '@/data/licenseGuide';
import { signName, topicText } from '@/data/localize';
import { LAYOUT, RADIUS, SPACE } from '@/theme/tokens';

/** A sign's detail: the large sign, its names and type, related signs, and a way to practise its group. */
export function SignDetailBody({ id, onOpen, onPractise, showTitle }: { id: string; onOpen: (id: string) => void; onPractise: (group: string) => void; showTitle?: boolean }) {
  const { t, c, lang } = useApp();
  const d = useDir();
  const s = SIGNS.find((x) => x.id === id);
  if (!s) return <EmptyState text={t.common.noResults} />;
  const related = SIGNS.filter((x) => x.group === s.group && x.id !== s.id).slice(0, 6);
  return (
    <View style={{ gap: LAYOUT.list }}>
      <Card style={{ alignItems: 'center', paddingVertical: SPACE.xl, backgroundColor: c.paper, borderColor: c.ln }}>
        <SignImage id={s.id} size={220} label={s.nameAr} />
      </Card>
      <Card style={{ gap: SPACE.xs }}>
        <T role={showTitle ? 'h2' : 'h3'} content={lang === 'ar'} header={showTitle}>{signName(s, lang)}</T>
        {lang !== 'ar' ? <T size={16} muted content>{s.nameAr}</T> : null}
        <Row gap={SPACE.xs} style={{ marginTop: SPACE.xs, alignSelf: d.start }}>
          <Chip label={`${t.signs.group}: ${lang === 'ar' ? s.group : t.signs.groups[s.group] ?? s.group}`} />
        </Row>
      </Card>
      <Button kind="secondary" icon="eye" title={t.rd.practiseGroup} onPress={() => onPractise(s.group)} />
      {related.length ? (
        <Section title={t.ux.relatedSigns}>
          <View style={[styles.grid, { flexDirection: d.row }]}>
            {related.map((r) => (
              <Pressable
                key={r.id}
                accessibilityRole="button"
                accessibilityLabel={signName(r, lang)}
                onPress={() => onOpen(r.id)}
                style={({ pressed }) => [styles.tile, { backgroundColor: pressed ? c.fill : c.card, borderColor: c.ln }]}
              >
                <SignImage id={r.id} size={64} />
                <T size={12} center content={lang === 'ar'} numberOfLines={2}>{signName(r, lang)}</T>
              </Pressable>
            ))}
          </View>
        </Section>
      ) : null}
      <T size={12} muted>{t.signs.credit}</T>
    </View>
  );
}

/** A guide topic: readable text (Body Large, 640 column), tables highlighted, read status, previous / next. */
export function TopicBody({ id, onNav, showTitle }: { id: string; onNav: (id: string) => void; showTitle?: boolean }) {
  const { t, c, lang } = useApp();
  const { learn, markRead } = useStudy();
  const d = useDir();
  const item = GUIDE_TOPICS.find((x) => x.id === id);
  // A topic counts as read when the learner marks it or moves on with "Next topic", not merely on opening it.
  const read = learn.read.includes(id);
  if (!item) return <EmptyState text={t.common.noResults} />;
  const tx = topicText(item, lang);
  const at = GUIDE_TOPICS.indexOf(item);
  const prev = at > 0 ? GUIDE_TOPICS[at - 1] : undefined;
  const next = GUIDE_TOPICS[at + 1];
  const ar = lang === 'ar';
  return (
    <View style={{ gap: LAYOUT.list }}>
      {showTitle ? <T role="h2" header content={ar}>{tx.title}</T> : null}
      <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <SourceBadge kind="official" />
        {read ? <Badge tone="ok" icon="check" text={t.rd.isRead} /> : null}
      </Row>
      {tx.blocks.map((b, i) =>
        'text' in b ? (
          <Row key={i} gap={SPACE.sm} style={{ alignItems: 'flex-start' }}>
            <View style={[styles.dot, { backgroundColor: c.acSolid }]} />
            <View style={{ flex: 1 }}><T content={ar} size={17}>{b.text}</T></View>
          </Row>
        ) : (
          <Card key={i} style={{ padding: 0, overflow: 'hidden', borderColor: c.info }}>
            {b.table.map((row, r) => (
              <View key={r} style={[styles.tr, { flexDirection: d.row, backgroundColor: r === 0 ? c.infobg : 'transparent', borderTopColor: c.ln, borderTopWidth: r ? 1 : 0 }]}>
                {row.map((cell, k) => (
                  <View key={k} style={{ flex: k === row.length - 1 ? 2 : 1, padding: SPACE.sm }}>
                    <T content={ar} size={14} weight={r === 0 ? 'semibold' : 'regular'}>{cell}</T>
                  </View>
                ))}
              </View>
            ))}
          </Card>
        ),
      )}
      {read ? null : <Button kind="secondary" icon="check" title={t.rd.markRead} onPress={() => markRead(item.id)} />}
      {/* Keep reading without going back to the list. */}
      <Row gap={SPACE.sm} style={{ marginTop: SPACE.xs }}>
        {prev ? <Button small kind="secondary" title={t.ux.prevTopic} onPress={() => onNav(prev.id)} style={{ flex: 1 }} /> : <View style={{ flex: 1 }} />}
        {next ? <Button small title={t.ux.nextTopic} onPress={() => { markRead(item.id); onNav(next.id); }} style={{ flex: 1 }} /> : <View style={{ flex: 1 }} />}
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexWrap: 'wrap', gap: SPACE.sm },
  tile: { flexBasis: '28%', flexGrow: 1, alignItems: 'center', gap: SPACE.xxs, padding: SPACE.xs, borderRadius: RADIUS.md, borderWidth: 1, minHeight: 112 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 12 },
  tr: { alignItems: 'stretch' },
});
