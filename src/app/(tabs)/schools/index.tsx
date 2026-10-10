import React, { useEffect, useMemo, useState } from 'react';
import { AppState, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useApp, useDir } from '@/state/AppProvider';
import { BottomSheet, Button, Chip, EmptyState, Grid, IconTile, Notice, PickerSheet, Row, Screen, SearchBox, Skeleton, T, useListColumns } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { SchoolCard } from '@/components/SchoolCard';
import { SCHOOLS, SCHOOLS_CHECKED } from '@/data/schools';
import { CITIES } from '@/data/cities';
import { citiesIn, filterSchools, nearbySchools, regionsOf, type NearbySchool } from '@/features/schools/search';
import { getPositionOnce, type LocationResult } from '@/services/location';
import { cityName, formatDate, regionName, schoolText } from '@/data/localize';
import { RADIUS, SPACE } from '@/theme/tokens';

function Select({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  const { c, lang } = useApp();
  const d = useDir();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} onPress={onPress} style={({ pressed }) => [styles.select, { backgroundColor: pressed ? c.fill : c.card, borderColor: c.lnStrong, flexDirection: d.row }]}>
      <View style={{ flex: 1 }}>
        <T size={12} muted>{label}</T>
        <T size={16} weight="medium" content={lang === 'ar'} numberOfLines={1}>{value}</T>
      </View>
      <Icon name="down" size={16} color={c.tx2} />
    </Pressable>
  );
}

type Loc = { phase: 'idle' } | { phase: 'explain' } | { phase: 'locating' } | { phase: 'done'; list: NearbySchool[] } | { phase: 'error'; result: Exclude<LocationResult, { status: 'ok' }> };

/** Search first; "Near me" asks for location in a sheet that explains why, and the list works without it. */
export default function Schools() {
  const { t, lang } = useApp();
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [q, setQ] = useState('');
  const [picker, setPicker] = useState<null | 'region' | 'city'>(null);
  const [loc, setLoc] = useState<Loc>({ phase: 'idle' });
  const { cols, maxWidth } = useListColumns();

  // Search text for each school, built once per language instead of on every keystroke.
  const haystack = useMemo(
    () => new Map(SCHOOLS.map((x) => [x.id, `${x.name} ${schoolText(x, lang).name} ${x.cities.map((ct) => `${ct} ${cityName(ct, lang)}`).join(' ')}`.toLowerCase()])),
    [lang],
  );
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = filterSchools(SCHOOLS, CITIES, { region, city });
    return s ? base.filter((x) => haystack.get(x.id)!.includes(s)) : base;
  }, [region, city, q, haystack]);
  const regions = useMemo(() => regionsOf(CITIES), []);
  const cities = useMemo(() => citiesIn(CITIES, region || undefined).filter((x) => SCHOOLS.some((s) => s.cities.includes(x.name))), [region]);

  const locate = async () => {
    setLoc({ phase: 'locating' });
    const r = await getPositionOnce();
    if (r.status === 'ok') setLoc({ phase: 'done', list: nearbySchools(SCHOOLS, CITIES, r.lat, r.lng) });
    else setLoc({ phase: 'error', result: r });
  };
  const reset = () => setLoc({ phase: 'idle' });
  // Back from Settings (location switched on, or permission allowed there): try again without another tap.
  const waitingOnSettings = loc.phase === 'error' && loc.result.status !== 'unavailable';
  useEffect(() => {
    if (!waitingOnSettings) return;
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') locate();
    });
    return () => sub.remove();
  }, [waitingOnSettings]);
  const near = loc.phase === 'done' || loc.phase === 'locating';

  const errorText = (r: Exclude<LocationResult, { status: 'ok' }>) =>
    r.status === 'denied' ? (r.canAskAgain ? t.schools.denied : t.schools.deniedSettings) : r.status === 'services-off' ? t.schools.servicesOff : t.schools.unavailable;

  return (
    <Screen title={t.schools.title} large maxWidth={maxWidth}>
      <SearchBox value={q} onChange={(v) => { setQ(v); if (near) reset(); }} placeholder={t.schools.search} />
      <Row gap={SPACE.xs} style={{ flexWrap: 'wrap' }}>
        <Chip label={t.schools.findNearby} icon="locate" on={near} onPress={() => (near ? reset() : setLoc({ phase: 'explain' }))} />
        {!near ? <T size={14} muted>{t.schools.count(list.length)}</T> : null}
      </Row>

      {loc.phase === 'error' ? (
        <View style={{ gap: SPACE.sm }}>
          <Notice tone="bad" text={`${errorText(loc.result)} ${t.rd.searchInstead}`} />
          {/* No icon here: two half-width buttons must keep their labels on one line and the same height. */}
          <Row gap={SPACE.sm} style={{ alignItems: 'stretch' }}>
            {loc.result.status === 'denied' && !loc.result.canAskAgain ? (
              <Button small title={t.schools.openSettings} onPress={() => Linking.openSettings().catch(() => {})} style={{ flex: 1 }} />
            ) : (
              <Button small title={t.common.tryAgain} onPress={locate} style={{ flex: 1 }} />
            )}
            <Button small kind="secondary" title={t.schools.viewAll} onPress={reset} style={{ flex: 1 }} />
          </Row>
        </View>
      ) : null}

      {loc.phase === 'locating' ? (
        <View style={{ gap: SPACE.sm }}>
          <T muted>{t.schools.locating}</T>
          <Skeleton rows={4} height={88} />
        </View>
      ) : loc.phase === 'done' ? (
        <View style={{ gap: SPACE.sm }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T role="h3" header>{t.schools.nearbyTitle}</T>
            <Button small kind="tertiary" title={t.schools.viewAll} onPress={reset} />
          </Row>
          {/* Said once here, so equal distances for schools in one city read as intended (QA_1 #083, #219). */}
          <T size={14} muted>{t.schools.distNote}</T>
          <Grid cols={cols}>{loc.list.map((n) => <SchoolCard key={n.school.id} school={n.school} distance={{ km: n.km, city: n.city }} />)}</Grid>
        </View>
      ) : (
        <View style={{ gap: SPACE.sm }}>
          <Row gap={SPACE.sm}>
            <View style={{ flex: 1 }}><Select label={t.schools.region} value={region ? regionName(region, lang) : t.schools.allReg} onPress={() => setPicker('region')} /></View>
            <View style={{ flex: 1 }}><Select label={t.schools.city} value={city ? cityName(city, lang) : t.schools.allCity} onPress={() => setPicker('city')} /></View>
          </Row>
          {list.length === 0 ? <EmptyState text={t.common.noResults} action={<Button small kind="secondary" title={t.schools.viewAll} onPress={() => { setRegion(''); setCity(''); setQ(''); }} />} /> : null}
          <Grid cols={cols}>{list.map((s) => <SchoolCard key={s.id} school={s} />)}</Grid>
        </View>
      )}
      <T size={14} muted>{t.schools.note(formatDate(SCHOOLS_CHECKED, t.common.months))}</T>

      {/* Permission is explained before the system prompt, in a sheet with Allow / Not now. */}
      <BottomSheet visible={loc.phase === 'explain'} title={t.schools.permTitle} onClose={reset}>
        <View style={{ alignItems: 'center', paddingVertical: SPACE.xs }}><IconTile icon="locate" /></View>
        <T>{t.schools.permBody}</T>
        <Button title={t.schools.allow} icon="locate" onPress={locate} />
        <Button kind="secondary" title={t.schools.notNow} onPress={reset} />
      </BottomSheet>
      <PickerSheet
        visible={picker === 'region'}
        title={t.schools.region}
        value={region}
        items={[{ value: '', label: t.schools.allReg }, ...regions.map((r) => ({ value: r, label: regionName(r, lang) }))]}
        onPick={(v) => { setRegion(v); setCity(''); }}
        onClose={() => setPicker(null)}
      />
      <PickerSheet
        visible={picker === 'city'}
        title={t.schools.city}
        value={city}
        items={[{ value: '', label: t.schools.allCity }, ...cities.map((x) => ({ value: x.name, label: cityName(x.name, lang) }))]}
        onPick={setCity}
        onClose={() => setPicker(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ select: { alignItems: 'center', gap: SPACE.xs, borderRadius: RADIUS.md, borderWidth: 1, paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs, minHeight: 56 } });
