import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useApp, useDir } from '@/state/AppProvider';
import type { School } from '@/data/types';
import { openInMaps } from '@/services/maps';
import { cityName, regionName, schoolText } from '@/data/localize';
import { Card, Chip, IconButton, Notice, Row, T } from './ui';
import { Icon } from './Icon';

/**
 * Driving-school card. Tapping the card opens the details; directions are a secondary icon button, so the
 * screen keeps one primary action ("Find nearby"). Memoised: typing in the search skips unchanged cards.
 */
export const SchoolCard = React.memo(function SchoolCard({ school, distance }: { school: School; distance?: { km: number; city: string } }) {
  const { t, c, lang } = useApp();
  const d = useDir();
  const [failed, setFailed] = useState(false);
  const ar = lang === 'ar';
  const city = school.cities[0];
  const name = schoolText(school, lang).name;
  const town = cityName(city, lang);
  const region = regionName(school.region, lang);
  const place = region !== town ? `${town} · ${region}` : town;
  return (
    <Card label={`${name}, ${place}`} onPress={() => router.push({ pathname: '/schools/[id]', params: { id: school.id } })} style={{ gap: 8 }}>
      <Row gap={12} style={{ alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 4 }}>
          <T size={18} weight="semibold" content={ar}>{name}</T>
          {distance ? (
            <Row gap={8}>
              <Icon name="schools" size={16} color={c.ac} />
              <T size={14} weight="semibold" color={c.ac}>{t.schools.km(Math.max(1, Math.round(distance.km)))}</T>
              <T size={14} muted>{t.schools.toCity(cityName(distance.city, lang))}</T>
            </Row>
          ) : (
            <Row gap={8}>
              <Icon name="schools" size={16} color={c.tx2} />
              <View style={{ flex: 1 }}><T size={14} muted>{place}</T></View>
            </Row>
          )}
        </View>
        <IconButton icon="nav" label={t.schools.directions} onPress={async () => setFailed(!(await openInMaps(`${school.name} ${city}`)))} />
      </Row>
      <Row gap={8} style={{ flexWrap: 'wrap', alignSelf: d.start }}>
        <Chip label={school.gender === 'men' ? t.schools.men : t.schools.women} />
        {distance ? <Chip label={place} /> : null}
      </Row>
      {school.source === 'public' ? <T size={12} muted>{t.schools.publicSource}</T> : null}
      {failed ? <Notice tone="bad" text={t.schools.mapsFailed} /> : null}
    </Card>
  );
});
