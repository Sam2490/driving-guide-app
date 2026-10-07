import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useApp, useDir } from '@/state/AppProvider';
import { Button, Chip, EmptyState, Row, SearchBox, T, TAB_BAR_SPACE } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { SignImage } from '@/components/Media';
import { SIGNS, SIGN_GROUPS } from '@/data/signs';
import { signName } from '@/data/localize';
import type { Sign } from '@/data/types';
import { LAYOUT, RADIUS, SPACE } from '@/theme/tokens';

/** The signs grid: search, one scrolling row of group chips, practice mode, and tiles that open a sign. */
export function SignsSection({ header, cols, onOpen, selected, group: initialGroup = '', practice: initialPractice = false }: { header: React.ReactNode; cols: number; onOpen: (id: string) => void; selected?: string; group?: string; practice?: boolean }) {
  const { t, c, lang } = useApp();
  const d = useDir();
  const [group, setGroup] = useState<string>(initialGroup);
  const [q, setQ] = useState('');
  const [practice, setPractice] = useState(initialPractice);
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const name = useCallback((s: Sign) => signName(s, lang), [lang]);
  const groupName = (g: string) => (lang === 'ar' ? g : t.signs.groups[g] ?? g);
  const chips = useRef<ScrollView>(null);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return SIGNS.filter((x) => (!group || x.group === group) && (!s || `${x.nameAr} ${x.nameEn} ${signName(x, lang)}`.toLowerCase().includes(s)));
  }, [group, q, lang]);
  const allShown = list.length > 0 && list.every((x) => shown[x.id]);

  const top = (
    <View style={{ gap: LAYOUT.list, paddingBottom: LAYOUT.list }}>
      {header}
      <T muted>{t.signs.sub(SIGNS.length)}</T>
      <SearchBox value={q} onChange={setQ} placeholder={t.signs.search} />
      {/* One scrollable row of filters; in RTL it starts scrolled to the right. */}
      <ScrollView
        ref={chips}
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={() => d.rtl && chips.current?.scrollToEnd({ animated: false })}
        contentContainerStyle={{ gap: SPACE.xs, flexDirection: d.row, paddingVertical: SPACE.xxs }}
        style={{ marginHorizontal: -LAYOUT.gutter }}
      >
        <View style={{ width: LAYOUT.gutter - SPACE.xs }} />
        <Chip label={t.common.all} on={!group} onPress={() => setGroup('')} />
        {SIGN_GROUPS.map((g) => <Chip key={g} label={groupName(g)} on={group === g} onPress={() => setGroup(g)} />)}
        <View style={{ width: LAYOUT.gutter - SPACE.xs }} />
      </ScrollView>
      <Row style={{ justifyContent: 'space-between' }}>
        <T size={14} muted>{t.signs.count(list.length)}</T>
        <Chip label={t.signs.practice} icon="eye" on={practice} onPress={() => { setPractice(!practice); setShown({}); }} />
      </Row>
      {practice ? (
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}><T size={14} muted>{t.signs.hint}</T></View>
          <Button small kind="tertiary" title={allShown ? t.ux.hideAll : t.ux.revealAll} onPress={() => setShown(allShown ? {} : Object.fromEntries(list.map((x) => [x.id, true])))} />
        </Row>
      ) : null}
    </View>
  );

  return (
    <FlatList
      key={cols}
      data={list}
      keyExtractor={(x) => x.id}
      numColumns={cols}
      removeClippedSubviews
      ListHeaderComponent={top}
      ListEmptyComponent={<EmptyState text={t.common.noResults} action={q ? <Button small kind="secondary" title={t.common.all} onPress={() => { setQ(''); setGroup(''); }} /> : undefined} />}
      columnWrapperStyle={cols > 1 ? { gap: LAYOUT.list, flexDirection: d.row } : undefined}
      contentContainerStyle={{ paddingHorizontal: LAYOUT.gutter, gap: LAYOUT.list, paddingBottom: TAB_BAR_SPACE }}
      initialNumToRender={10}
      windowSize={7}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => {
        const hidden = practice && !shown[item.id];
        const on = selected === item.id;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? t.signs.reveal : name(item)}
            accessibilityState={on ? { selected: true } : undefined}
            onPress={() => (practice ? setShown((s) => ({ ...s, [item.id]: !s[item.id] })) : onOpen(item.id))}
            style={({ pressed }) => [styles.tile, { backgroundColor: pressed ? c.fill : c.card, borderColor: on ? c.acSolid : c.ln, borderWidth: on ? 2 : 1 }]}
          >
            <View style={[styles.img, { backgroundColor: c.paper }]}><SignImage id={item.id} size={92} /></View>
            {hidden ? (
              <Row gap={SPACE.xxs} style={{ justifyContent: 'center' }}>
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
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, borderRadius: RADIUS.lg, padding: SPACE.sm, gap: SPACE.xs, minHeight: 170 },
  img: { height: 108, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
});
