import React, { useState } from 'react';
import { router } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import type { School } from '@/data/types';
import { openInMaps } from '@/services/maps';
import { cityName, regionName, schoolText } from '@/data/localize';
import { Button, Card, Chip, Notice, Row, T } from './ui';
import { Icon } from './Icon';

/** Reusable driving-school card: branch name, town, men/women, optional distance, details and directions. */
/** Memoised: typing in the school search re-renders the list, but unchanged cards are skipped. */
export const SchoolCard = React.memo(function SchoolCard({ school, distance }: { school: School; distance?: { km: number; city: string } }) {
  const { t, c, lang } = useApp();
  const [failed, setFailed] = useState(false);
  const ar = lang === 'ar';
  const city = school.cities[0];
  return (
    <Card style={{ gap: 8 }}>
      <T size={17} weight="semibold" content={ar}>{schoolText(school, lang).name}</T>
      {distance ? (
        <Row gap={6}>
          <Icon name="schools" size={16} color={c.ac} />
          <T size={14} weight="semibold" color={c.ac}>{t.schools.km(Math.max(1, Math.round(distance.km)))}</T>
          <T size={13} muted>{t.schools.toCity(cityName(distance.city, lang))}</T>
        </Row>
      ) : null}
      <Row gap={6} style={{ flexWrap: 'wrap' }}>
        <Chip label={cityName(city, lang)} />
        {regionName(school.region, lang) !== cityName(city, lang) ? <Chip label={regionName(school.region, lang)} /> : null}
        <Chip label={school.gender === 'men' ? t.schools.men : t.schools.women} />
      </Row>
      {school.source === 'public' ? <T size={12.5} muted>{t.schools.publicSource}</T> : null}
      <Row gap={10} style={{ marginTop: 4 }}>
        <Button small kind="ghost" title={t.schools.details} onPress={() => router.push({ pathname: '/schools/[id]', params: { id: school.id } })} style={{ flex: 1 }} />
        <Button small title={t.schools.directions} icon="nav" onPress={async () => setFailed(!(await openInMaps(`${school.name} ${city}`)))} style={{ flex: 1 }} />
      </Row>
      {failed ? <Notice tone="bad" text={t.schools.mapsFailed} /> : null}
    </Card>
  );
});
