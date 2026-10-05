import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp, useDir } from '@/state/AppProvider';
import { Card, Chip, EmptyState, Row, Screen, Section, T } from '@/components/ui';
import { SignImage } from '@/components/Media';
import { SIGNS } from '@/data/signs';
import { signName } from '@/data/localize';
import { RADIUS, SPACE } from '@/theme/tokens';

export default function SignDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, c, lang } = useApp();
  const d = useDir();
  const s = SIGNS.find((x) => x.id === id);
  if (!s) return <Screen back><EmptyState text={t.common.noResults} /></Screen>;
  const related = SIGNS.filter((x) => x.group === s.group && x.id !== s.id).slice(0, 6);
  return (
    <Screen back title={signName(s, lang)} contentTitle={lang === 'ar'}>
      <Card style={{ alignItems: 'center', paddingVertical: SPACE.xl }}>
        <View style={{ backgroundColor: c.fill, borderRadius: RADIUS.lg, padding: SPACE.md }}>
          <SignImage id={s.id} size={220} label={s.nameAr} />
        </View>
      </Card>
      <Card style={{ gap: SPACE.xs }}>
        <T size={20} weight="bold" content={lang === 'ar'}>{signName(s, lang)}</T>
        {lang !== 'ar' ? <T size={16} muted content>{s.nameAr}</T> : null}
        <Row gap={SPACE.xs} style={{ marginTop: SPACE.xs, alignSelf: d.start }}>
          <Chip label={`${t.signs.group}: ${lang === 'ar' ? s.group : t.signs.groups[s.group] ?? s.group}`} />
        </Row>
      </Card>
      {related.length ? (
        <Section title={t.ux.relatedSigns}>
          <View style={[styles.grid, { flexDirection: d.row }]}>
            {related.map((r) => (
              <Pressable
                key={r.id}
                accessibilityRole="button"
                accessibilityLabel={signName(r, lang)}
                onPress={() => router.replace({ pathname: '/signs/[id]', params: { id: r.id } })}
                style={({ pressed }) => [styles.tile, { backgroundColor: c.card, borderColor: c.ln, opacity: pressed ? 0.85 : 1 }]}
              >
                <SignImage id={r.id} size={64} />
                <T size={12} center content={lang === 'ar'} numberOfLines={2}>{signName(r, lang)}</T>
              </Pressable>
            ))}
          </View>
        </Section>
      ) : null}
      <T size={12} muted>{t.signs.credit}</T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexWrap: 'wrap', gap: SPACE.sm },
  tile: { flexBasis: '28%', flexGrow: 1, alignItems: 'center', gap: SPACE.xxs, padding: SPACE.xs, borderRadius: RADIUS.md, borderWidth: 1, minHeight: 112 },
});
