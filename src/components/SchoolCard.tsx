import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useApp, useDir } from '@/state/AppProvider';
import type { School } from '@/data/types';
import { openInMaps } from '@/services/maps';
import { cityName, regionName, schoolText } from '@/data/localize';
import { RADIUS, SPACE } from '@/theme/tokens';
import { Badge, IconButton, Notice, Row, T } from './ui';

/**
 * Driving-school row: name, place and category, distance on the reading-end side when known. Tapping opens the
 * details; directions are a secondary icon button. Memoised: typing in the search skips unchanged rows.
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
  const gender = school.gender === 'men' ? t.schools.men : t.schools.women;
  // Screen readers hear the badges too, so same-name branches stay distinguishable (QA re-audit P3-4).
  const tags = school.source === 'public' ? `${gender}, ${t.schools.publicSource}` : gender;
  const km = distance ? t.schools.km(Math.max(1, Math.round(distance.km))) : null;
  return (
    <View style={[styles.wrap, { backgroundColor: c.card, borderColor: c.ln }]}>
      <Row gap={SPACE.sm} style={{ alignItems: 'center' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={km ? `${name}, ${tags}, ${km}, ${place}` : `${name}, ${tags}, ${place}`}
          onPress={() => router.push({ pathname: '/schools/[id]', params: { id: school.id } })}
          style={({ pressed }) => [styles.main, { flexDirection: d.row, opacity: pressed ? 0.7 : 1 }]}
        >
          <View style={{ flex: 1, gap: SPACE.xxs }}>
            {/* The Men/Women badge sits on the name line, so two branches with the same name read apart at a glance
                (QA re-audit P3-4). */}
            <Row gap={SPACE.xs} style={{ alignItems: 'flex-start' }}>
              <View style={{ flexShrink: 1 }}><T role="title" size={16} content={ar}>{name}</T></View>
              {/* Badge aligns itself to d.start, which is vertical in a row; pin it to the first line in both directions. */}
              <View style={{ alignSelf: 'flex-start' }}><Badge text={gender} /></View>
            </Row>
            <T size={14} muted>{distance ? t.schools.toCity(cityName(distance.city, lang)) : place}</T>
            {school.source === 'public' ? <View style={{ alignSelf: d.start }}><Badge tone="warn" text={t.schools.publicSource} /></View> : null}
          </View>
          {km ? <T size={16} weight="bold" color={c.ac}>{km}</T> : null}
        </Pressable>
        <IconButton icon="nav" label={t.schools.directions} onPress={async () => setFailed(!(await openInMaps(`${school.name} ${city}`)))} />
      </Row>
      {failed ? <Notice tone="bad" text={t.schools.mapsFailed} /> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { borderRadius: RADIUS.md, borderWidth: 1, padding: SPACE.sm, paddingHorizontal: SPACE.md, gap: SPACE.xs },
  main: { flex: 1, alignItems: 'center', gap: SPACE.sm, minHeight: 56 },
});
