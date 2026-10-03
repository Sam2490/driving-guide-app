import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { Button, Card, EmptyState, Notice, Row, Screen, SourceBadge, T } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { SCHOOLS, SCHOOLS_CHECKED } from '@/data/schools';
import { openInMaps } from '@/services/maps';
import { cityName, regionName, schoolText } from '@/data/localize';

export default function SchoolDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, c, lang } = useApp();
  const ar = lang === 'ar';
  const [failed, setFailed] = useState(false);
  const s = SCHOOLS.find((x) => x.id === id);
  if (!s) return <Screen back><EmptyState text={t.common.noResults} /></Screen>;
  const city = s.cities[0];
  const rows: [string, string][] = [
    [t.schools.city, cityName(city, lang)],
    [t.schools.region, regionName(s.region, lang)],
    ['', s.gender === 'men' ? t.schools.men : t.schools.women],
  ];
  return (
    <Screen back title={schoolText(s, lang).name} contentTitle={ar}>
      {s.source === 'absher' ? (
        <Row gap={6}><Icon name="check" size={16} color={c.ok} /><T size={13} color={c.ok}>{t.schools.fromAbsher}</T></Row>
      ) : (
        <SourceBadge kind="general" />
      )}
      {!ar ? <Card><T content muted>{s.name}</T></Card> : null}
      <Card style={{ gap: 8 }}>
        {rows.map(([k, v]) => (
          <Row key={k + v} style={{ justifyContent: 'space-between' }}>
            {k ? <T size={14} muted>{k}</T> : null}
            <T size={16} weight="semibold">{v}</T>
          </Row>
        ))}
      </Card>
      <Button title={t.schools.directions} icon="nav" onPress={async () => setFailed(!(await openInMaps(`${s.name} ${city}`)))} />
      {failed ? <Notice tone="bad" text={t.schools.mapsFailed} /> : null}
      <T size={13} muted>{t.schools.note(SCHOOLS_CHECKED)}</T>
    </Screen>
  );
}
