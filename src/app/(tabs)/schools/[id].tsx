import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { Badge, Button, Card, EmptyState, Notice, Row, Screen, SourceBadge, T } from '@/components/ui';
import { SCHOOLS, SCHOOLS_CHECKED } from '@/data/schools';
import { openAbsher, openInMaps } from '@/services/maps';
import { cityName, regionName, schoolText } from '@/data/localize';
import { SPACE } from '@/theme/tokens';

export default function SchoolDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useApp();
  const ar = lang === 'ar';
  const [failed, setFailed] = useState(false);
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
          <Row key={k} style={{ justifyContent: 'space-between' }}>
            <T size={14} muted>{k}</T>
            <T size={16} weight="semibold">{v}</T>
          </Row>
        ))}
      </Card>
      {/* Two equal actions in one row: booking is done on Absher. */}
      <Row gap={SPACE.sm} style={{ alignItems: 'stretch' }}>
        <View style={{ flex: 1 }}><Button title={t.ux.bookAbsher} icon="globe" onPress={async () => setFailed(!(await openAbsher()))} /></View>
        <View style={{ flex: 1 }}><Button kind="secondary" title={t.schools.directions} icon="nav" onPress={async () => setFailed(!(await openInMaps(`${s.name} ${city}`)))} /></View>
      </Row>
      {failed ? <Notice tone="bad" text={t.schools.mapsFailed} /> : null}
      <T size={14} muted>{t.schools.note(SCHOOLS_CHECKED)}</T>
    </Screen>
  );
}
