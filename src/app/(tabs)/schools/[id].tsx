import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { Button, Card, EmptyState, Notice, Row, Screen, SourceBadge, T } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { SCHOOLS, SCHOOLS_CHECKED } from '@/data/schools';
import { CITIES } from '@/data/cities';
import { openInMaps } from '@/services/maps';
import { cityName, regionName, schoolText } from '@/data/localize';

export default function SchoolDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, c, lang } = useApp();
  const ar = lang === 'ar';
  const [failed, setFailed] = useState(false);
  const s = SCHOOLS.find((x) => x.id === id);
  if (!s) return <Screen back><EmptyState text={t.common.noResults} /></Screen>;
  const tx = schoolText(s, lang);
  return (
    <Screen back title={tx.name} contentTitle={ar}>
      <SourceBadge kind="general" />
      <Card><T content={ar} muted>{tx.description}</T></Card>
      <T size={18} weight="bold">{t.schools.branches}</T>
      {s.cities.map((ct) => {
        const region = CITIES.find((x) => x.name === ct)?.region;
        return (
          <Card key={ct}>
            <Row>
              <Icon name="schools" color={c.ac} />
              <Row gap={4} style={{ flex: 1, flexWrap: 'wrap' }}>
                <T size={16} weight="semibold" content={ar}>{cityName(ct, lang)}</T>
                {region && region !== ct ? <T size={13} muted content={ar}>{`· ${regionName(region, lang)}`}</T> : null}
              </Row>
              <Button small title={t.schools.directions} icon="nav" onPress={async () => setFailed(!(await openInMaps(`${s.name} ${ct}`)))} />
            </Row>
          </Card>
        );
      })}
      {failed ? <Notice tone="bad" text={t.schools.mapsFailed} /> : null}
      <T size={13} muted>{t.schools.note}</T>
      <T size={12} muted>{t.schools.checked(SCHOOLS_CHECKED)}</T>
    </Screen>
  );
}
