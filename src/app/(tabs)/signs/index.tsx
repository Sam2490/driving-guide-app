import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, useDir } from '@/state/AppProvider';
import { Button, Chip, EmptyState, Row, SearchBox, T, TAB_BAR_SPACE } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { SignImage } from '@/components/Media';
import { SIGNS, SIGN_GROUPS } from '@/data/signs';
import { signName } from '@/data/localize';
import type { Sign } from '@/data/types';

export default function Signs() {
  const { t, c, lang } = useApp();
  const d = useDir();
  const insets = useSafeAreaInsets();
  const [group, setGroup] = useState<string>('');
  const [q, setQ] = useState('');
  const [practice, setPractice] = useState(false);
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const name = useCallback((s: Sign) => signName(s, lang), [lang]);
  const groupName = (g: string) => (lang === 'ar' ? g : t.signs.groups[g] ?? g);
  const { width } = useWindowDimensions();
  const cols = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const chips = useRef<ScrollView>(null);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return SIGNS.filter((x) => (!group || x.group === group) && (!s || `${x.nameAr} ${x.nameEn} ${signName(x, lang)}`.toLowerCase().includes(s)));
  }, [group, q, lang]);
  const allShown = list.length > 0 && list.every((x) => shown[x.id]);

  const header = (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      <T size={28} weight="bold" role="header">{t.signs.title}</T>
      <T muted>{t.signs.sub(SIGNS.length)}</T>
      <SearchBox value={q} onChange={setQ} placeholder={t.signs.search} />
      {/* One scrollable row of filters instead of 2–3 wrapped rows; in RTL it starts scrolled to the right. */}
      <ScrollView
        ref={chips}
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={() => d.rtl && chips.current?.scrollToEnd({ animated: false })}
        contentContainerStyle={{ gap: 8, flexDirection: d.row }}
        style={{ marginHorizontal: -20 }}
      >
        <View style={{ width: 12 }} />
        <Chip label={t.common.all} on={!group} onPress={() => setGroup('')} />
        {SIGN_GROUPS.map((g) => <Chip key={g} label={groupName(g)} on={group === g} onPress={() => setGroup(g)} />)}
        <View style={{ width: 12 }} />
      </ScrollView>
      <Row style={{ justifyContent: 'space-between' }}>
        <T size={14} muted>{t.signs.count(list.length)}</T>
        <Chip label={t.signs.practice} on={practice} onPress={() => { setPractice(!practice); setShown({}); }} />
      </Row>
      {practice ? (
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}><T size={14} muted>{t.signs.hint}</T></View>
          <Button small kind="ghost" title={allShown ? t.ux.hideAll : t.ux.revealAll} onPress={() => setShown(allShown ? {} : Object.fromEntries(list.map((x) => [x.id, true])))} />
        </Row>
      ) : null}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 12 }}>
      <FlatList
        key={cols}
        data={list}
        keyExtractor={(x) => x.id}
        numColumns={cols}
        style={{ width: '100%', maxWidth: 960, alignSelf: 'center' }}
        removeClippedSubviews
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
              {hidden ? (
                <Row gap={4} style={{ justifyContent: 'center' }}>
                  <Icon name="eye" size={16} color={c.tx2} />
                  <T size={14} muted center>{t.signs.reveal}</T>
                </Row>
              ) : (
                <T size={14} center content={lang === 'ar'} numberOfLines={3}>{name(item)}</T>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 12, gap: 8, minHeight: 170 },
  img: { height: 108, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
