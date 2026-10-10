import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { Badge, Button, Card, EmptyState, Notice, Row, Screen, SourceBadge, T } from '@/components/ui';
import { SCHOOLS, SCHOOLS_CHECKED } from '@/data/schools';
import { openAbsher, openInMaps } from '@/services/maps';
import { cityName, formatDate, regionName, schoolText } from '@/data/localize';
import { BREAKPOINTS, SPACE } from '@/theme/tokens';

export default function SchoolDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang, rtl } = useApp();
  const ar = lang === 'ar';
  const wide = useWindowDimensions().width >= BREAKPOINTS.medium;
  // Failures are counted: a repeated failure remounts the notice, so screen readers hear it again.
  const [failed, setFailed] = useState(0);
  const s = SCHOOLS.find((x) => x.id === id);
  if (!s) return <Screen back><EmptyState text={t.common.noResults} /></Screen>;
  const city = s.cities[0];
  const rows: [string, string][] = [
    [t.schools.city, cityName(city, lang)],
    [t.schools.region, regionName(s.region, lang)],
    [t.ux.category, s.gender === 'men' ? t.schools.men : t.schools.women],
  ];
  return (
    <Screen back>
      {/* The name lives in the body, not the header, so long names do not wrap beside the back button. */}
      <T role="h2" header content={ar}>{schoolText(s, lang).name}</T>
      {s.source === 'absher' ? <Badge tone="ok" icon="check" text={t.schools.fromAbsher} /> : <SourceBadge kind="general" />}
      {!ar ? <T content muted>{s.name}</T> : null}
      <Card style={{ gap: SPACE.sm }}>
        {rows.map(([k, v]) => (
          // A fixed third for the label (a content-sized box loses letters on Android, Nastaliq most of all); the value
          // takes the rest and sits at the reading end.
          <Row key={k} gap={SPACE.sm} style={{ alignItems: 'flex-start' }}>
            <View style={{ width: '33%' }}><T size={14} muted numberOfLines={2}>{k}</T></View>
            <View style={{ flex: 1 }}><T size={16} weight="semibold" style={{ textAlign: rtl ? 'left' : 'right' }}>{v}</T></View>
          </Row>
        ))}
      </Card>
      {/* Booking is done on Absher. Phones stack the two actions full width; from 600 pt they share a row. */}
      <Row gap={SPACE.sm} style={[{ alignItems: 'stretch' }, !wide && { flexDirection: 'column' }]}>
        <View style={wide ? { flex: 1 } : undefined}><Button title={t.ux.bookAbsher} icon="globe" onPress={async () => { const ok = await openAbsher(); setFailed((n) => (ok ? 0 : n + 1)); }} /></View>
        <View style={wide ? { flex: 1 } : undefined}><Button kind="secondary" title={t.schools.directions} icon="nav" onPress={async () => { const ok = await openInMaps(`${s.name} ${city}`); setFailed((n) => (ok ? 0 : n + 1)); }} /></View>
      </Row>
      {failed ? <Notice key={failed} tone="bad" text={t.schools.mapsFailed} /> : null}
      {/* Only what applies to this school: no distance (none is shown here), its own gender, a readable date. */}
      <T size={14} muted>{t.schools.detailNote(formatDate(SCHOOLS_CHECKED, t.common.months), s.source === 'public')}</T>
    </Screen>
  );
}
