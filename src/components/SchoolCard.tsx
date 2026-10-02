import React, { useState } from 'react';
import { router } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import type { School } from '@/data/types';
import { openInMaps } from '@/services/maps';
import { cityName, schoolText } from '@/data/localize';
import { Button, Card, Chip, Notice, Row, T } from './ui';
import { Icon } from './Icon';

/** Reusable driving-school card: name, cities, optional distance, details and directions. */
export function SchoolCard({ school, distance }: { school: School; distance?: { km: number; city: string } }) {
  const { t, c, lang } = useApp();
  const tx = schoolText(school, lang);
  const ar = lang === 'ar';
  const [failed, setFailed] = useState(false);
  const target = distance?.city ?? school.cities[0];
  return (
    <Card style={{ gap: 8 }}>
      <T size={17} weight="semibold" content={ar}>{tx.name}</T>
      {distance ? (
        <Row gap={6}>
          <Icon name="schools" size={16} color={c.ac} />
          <T size={14} weight="semibold" color={c.ac}>{t.schools.km(Math.max(1, Math.round(distance.km)))}</T>
          <T size={13} muted>{t.schools.toCity(cityName(distance.city, lang))}</T>
        </Row>
      ) : null}
      <T size={14} muted content={ar}>{tx.description}</T>
      <Row gap={6} style={{ flexWrap: 'wrap' }}>
        {school.cities.map((ct) => <Chip key={ct} label={cityName(ct, lang)} />)}
      </Row>
      <Row gap={10} style={{ marginTop: 4 }}>
        <Button small kind="ghost" title={t.schools.details} onPress={() => router.push({ pathname: '/schools/[id]', params: { id: school.id } })} style={{ flex: 1 }} />
        <Button small title={t.schools.directions} icon="nav" onPress={async () => setFailed(!(await openInMaps(`${school.name} ${target}`)))} style={{ flex: 1 }} />
      </Row>
      {failed ? <Notice tone="bad" text={t.schools.mapsFailed} /> : null}
    </Card>
  );
}
