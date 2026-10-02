import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useApp, useDir } from '@/state/AppProvider';
import { Button, Dialog, EmptyState, Notice, PickerSheet, Row, Screen, SearchBox, SourceBadge, T } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { SchoolCard } from '@/components/SchoolCard';
import { SCHOOLS, SCHOOLS_CHECKED } from '@/data/schools';
import { CITIES } from '@/data/cities';
import { citiesIn, filterSchools, nearbySchools, regionsOf, type NearbySchool } from '@/features/schools/search';
import { getPositionOnce, type LocationResult } from '@/services/location';
import { cityName, regionName, schoolText } from '@/data/localize';

function Select({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  const { c, lang } = useApp();
  const d = useDir();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} onPress={onPress} style={[styles.select, { backgroundColor: c.fill, borderColor: c.ln, flexDirection: d.row }]}>
      <View style={{ flex: 1 }}>
        <T size={12} muted>{label}</T>
        <T size={15} weight="medium" content={lang === 'ar'} numberOfLines={1}>{value}</T>
      </View>
      <View style={{ transform: [{ rotate: '-90deg' }] }}><Icon name="go" size={16} color={c.tx2} /></View>
    </Pressable>
  );
}

type Loc = { phase: 'idle' } | { phase: 'explain' } | { phase: 'locating' } | { phase: 'done'; list: NearbySchool[] } | { phase: 'error'; result: Exclude<LocationResult, { status: 'ok' }> };

export default function Schools() {
  const { t, c, lang } = useApp();
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [q, setQ] = useState('');
  const [picker, setPicker] = useState<null | 'region' | 'city'>(null);
  const [loc, setLoc] = useState<Loc>({ phase: 'idle' });

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = filterSchools(SCHOOLS, CITIES, { region, city });
    if (!s) return base;
    return base.filter((x) => {
      const tx = schoolText(x, lang);
      return `${x.name} ${x.description} ${tx.name} ${tx.description} ${x.cities.map((ct) => `${ct} ${cityName(ct, lang)}`).join(' ')}`.toLowerCase().includes(s);
    });
  }, [region, city, q, lang]);
  const regions = regionsOf(CITIES);
  const cities = citiesIn(CITIES, region || undefined).filter((x) => SCHOOLS.some((s) => s.cities.includes(x.name)));

  const locate = async () => {
    setLoc({ phase: 'locating' });
    const r = await getPositionOnce();
    if (r.status === 'ok') setLoc({ phase: 'done', list: nearbySchools(SCHOOLS, CITIES, r.lat, r.lng) });
    else setLoc({ phase: 'error', result: r });
  };
  const reset = () => setLoc({ phase: 'idle' });

  const errorText = (r: Exclude<LocationResult, { status: 'ok' }>) =>
    r.status === 'denied' ? (r.canAskAgain ? t.schools.denied : t.schools.deniedSettings) : r.status === 'services-off' ? t.schools.servicesOff : t.schools.unavailable;

  return (
    <Screen title={t.schools.title}>
      <Button title={t.schools.findNearby} icon="locate" onPress={() => setLoc({ phase: 'explain' })} />
      {loc.phase === 'locating' ? (
        <Row style={{ justifyContent: 'center', paddingVertical: 8 }}><ActivityIndicator color={c.ac} /><T muted>{t.schools.locating}</T></Row>
      ) : null}
      {loc.phase === 'error' ? (
        <View style={{ gap: 10 }}>
          <Notice tone="bad" text={errorText(loc.result)} />
          <Row gap={10}>
            {loc.result.status === 'denied' && !loc.result.canAskAgain ? (
              <Button small title={t.schools.openSettings} onPress={() => Linking.openSettings().catch(() => {})} style={{ flex: 1 }} />
            ) : (
              <Button small title={t.common.tryAgain} onPress={locate} style={{ flex: 1 }} />
            )}
            <Button small kind="ghost" title={t.schools.viewAll} onPress={reset} style={{ flex: 1 }} />
          </Row>
        </View>
      ) : null}

      {loc.phase === 'done' ? (
        <View style={{ gap: 12 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T size={20} weight="bold">{t.schools.nearbyTitle}</T>
            <Button small kind="ghost" title={t.schools.viewAll} onPress={reset} />
          </Row>
          {loc.list.map((n) => <SchoolCard key={n.school.id} school={n.school} distance={{ km: n.km, city: n.city }} />)}
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <Row gap={10}>
            <View style={{ flex: 1 }}><Select label={t.schools.region} value={region ? regionName(region, lang) : t.schools.allReg} onPress={() => setPicker('region')} /></View>
            <View style={{ flex: 1 }}><Select label={t.schools.city} value={city ? cityName(city, lang) : t.schools.allCity} onPress={() => setPicker('city')} /></View>
          </Row>
          <SearchBox value={q} onChange={setQ} placeholder={t.schools.search} />
          <T size={14} muted>{t.schools.count(list.length)}</T>
          {list.length === 0 ? <EmptyState text={t.common.noResults} action={<Button small kind="ghost" title={t.schools.viewAll} onPress={() => { setRegion(''); setCity(''); setQ(''); }} />} /> : null}
          {list.map((s) => <SchoolCard key={s.id} school={s} />)}
        </View>
      )}
      <SourceBadge kind="general" />
      <T size={13} muted>{t.schools.note}</T>
      <T size={12} muted>{t.schools.checked(SCHOOLS_CHECKED)}</T>

      <Dialog
        visible={loc.phase === 'explain'}
        title={t.schools.permTitle}
        text={t.schools.permBody}
        onClose={reset}
        actions={
          <>
            <Button title={t.schools.allow} icon="locate" onPress={locate} />
            <Button kind="ghost" title={t.schools.notNow} onPress={reset} />
          </>
        }
      />
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

const styles = StyleSheet.create({ select: { alignItems: 'center', gap: 8, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, minHeight: 56 } });
