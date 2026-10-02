import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, useDir } from '@/state/AppProvider';
import { Chip, EmptyState, Row, SearchBox, T, TAB_BAR_SPACE } from '@/components/ui';
import { SignImage } from '@/components/Media';
import { SIGNS, SIGN_GROUPS } from '@/data/signs';
import type { Sign } from '@/data/types';

export default function Signs() {
  const { t, c, lang } = useApp();
  const d = useDir();
  const insets = useSafeAreaInsets();
  const [group, setGroup] = useState<string>('');
  const [q, setQ] = useState('');
  const [practice, setPractice] = useState(false);
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const name = useCallback((s: Sign) => (lang === 'ar' ? s.nameAr : s.nameEn), [lang]);
  const groupName = (g: string) => (lang === 'ar' ? g : t.signs.groups[g] ?? g);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return SIGNS.filter((x) => (!group || x.group === group) && (!s || `${x.nameAr} ${x.nameEn}`.toLowerCase().includes(s)));
  }, [group, q]);

  const header = (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      <T size={28} weight="bold" role="header">{t.signs.title}</T>
      <T muted>{t.signs.sub(SIGNS.length)}</T>
      <SearchBox value={q} onChange={setQ} placeholder={t.signs.search} />
      <View style={{ gap: 8, flexDirection: d.row, flexWrap: 'wrap' }}>
        <Chip label={t.common.all} on={!group} onPress={() => setGroup('')} />
        {SIGN_GROUPS.map((g) => <Chip key={g} label={groupName(g)} on={group === g} onPress={() => setGroup(g)} />)}
      </View>
      <Row style={{ justifyContent: 'space-between' }}>
        <T size={14} muted>{t.signs.count(list.length)}</T>
        <Chip label={t.signs.practice} on={practice} onPress={() => { setPractice(!practice); setShown({}); }} />
      </Row>
      {practice ? <T size={13} muted>{t.signs.hint}</T> : null}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 10 }}>
      <FlatList
        data={list}
        keyExtractor={(x) => x.id}
        numColumns={2}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyState text={t.common.noResults} />}
        columnWrapperStyle={{ gap: 12, flexDirection: d.row }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: TAB_BAR_SPACE + insets.bottom }}
        initialNumToRender={10}
        windowSize={7}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const hidden = practice && !shown[item.id];
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={hidden ? t.signs.reveal : name(item)}
              onPress={() => (practice ? setShown((s) => ({ ...s, [item.id]: !s[item.id] })) : router.push({ pathname: '/signs/[id]', params: { id: item.id } }))}
              style={({ pressed }) => [styles.tile, { backgroundColor: c.card, borderColor: c.ln, opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={[styles.img, { backgroundColor: c.fill }]}><SignImage id={item.id} size={92} /></View>
              <T size={13.5} center content={lang === 'ar'} latin={lang === 'ur' && !hidden} color={hidden ? c.ac : c.tx} numberOfLines={3}>{hidden ? t.signs.reveal : name(item)}</T>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, borderRadius: 18, borderWidth: 1, padding: 10, gap: 8, minHeight: 170 },
  img: { height: 108, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
