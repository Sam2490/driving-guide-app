import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, useDir } from '@/state/AppProvider';
import { Button, Notice, Segmented, StickyBar, T, TAB_BAR_SPACE, URDU_SCROLL_TOP } from '@/components/ui';
import { SignsSection } from '@/components/learn/SignsSection';
import { GuideSection } from '@/components/learn/GuideSection';
import { StepsSection } from '@/components/learn/StepsSection';
import { SignDetailBody, TopicBody } from '@/components/learn/Details';
import { openAbsher } from '@/services/maps';
import { SIGNS } from '@/data/signs';
import { GUIDE_TOPICS } from '@/data/licenseGuide';
import { BREAKPOINTS, LAYOUT, MAX_CONTENT_WIDTH, SPACE } from '@/theme/tokens';

const SECTIONS = ['signs', 'guide', 'steps'] as const;
type SectionKey = (typeof SECTIONS)[number];

/**
 * Learn: everything to study in one tab — Signs, Guide and licence Steps. On medium widths and up (600 pt+),
 * Signs and Guide show the list on the reading-start side and the selected item beside it.
 */
export default function Learn() {
  const { t, c, lang } = useApp();
  const d = useDir();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ section?: string; group?: string; practice?: string }>();
  // A link (Home's "Licence steps", "More tips", "Practise this group") picks the section and sign filter; the
  // learner's own choice wins until a new link arrives.
  const linkKey = `${params.section ?? ''}|${params.group ?? ''}|${params.practice ?? ''}`;
  const fromLink = { section: SECTIONS.find((s) => s === params.section) ?? 'signs', filter: { group: params.group ?? '', practice: params.practice === '1' } };
  const [own, setOwn] = useState<{ key: string; section: SectionKey; filter: { group: string; practice: boolean } } | null>(null);
  const current = own && own.key === linkKey ? own : { key: linkKey, ...fromLink };
  const section = current.section;
  const signFilter = current.filter;
  const setSection = (s: SectionKey) => setOwn({ ...current, section: s });
  const { width } = useWindowDimensions();
  const twoPane = width >= BREAKPOINTS.medium && section !== 'steps';
  const [sign, setSign] = useState<string>(SIGNS[0].id);
  const [topic, setTopic] = useState<string>(GUIDE_TOPICS[0].id);
  const [absherFailed, setAbsherFailed] = useState(false);
  const listWidth = twoPane ? Math.min(460, width * 0.45) : width;
  const cols = Math.max(1, Math.min(4, Math.floor((Math.min(listWidth, 960) - 2 * LAYOUT.gutter + LAYOUT.list) / 160)));

  const header = (
    <View style={{ gap: SPACE.sm, paddingTop: SPACE.sm }}>
      <T role="h1" header>{t.rd.learnTitle}</T>
      <Segmented options={t.rd.sections} value={SECTIONS.indexOf(section)} onChange={(i) => setSection(SECTIONS[i])} />
    </View>
  );
  const openSign = (id: string) => (twoPane ? setSign(id) : router.push({ pathname: '/learn/signs/[id]', params: { id } }));
  const openTopic = (id: string) => (twoPane ? setTopic(id) : router.push({ pathname: '/learn/guide/[topic]', params: { topic: id } }));
  const practise = (group: string) => setOwn({ ...current, section: 'signs', filter: { group, practice: true } });

  const list =
    section === 'signs' ? (
      <SignsSection key={`${signFilter.group}|${signFilter.practice}`} header={header} cols={cols} onOpen={openSign} selected={twoPane ? sign : undefined} group={signFilter.group} practice={signFilter.practice} />
    ) : (
      <ScrollView contentContainerStyle={[styles.column, lang === 'ur' && { paddingTop: URDU_SCROLL_TOP }, { paddingBottom: TAB_BAR_SPACE }]} keyboardShouldPersistTaps="handled">
        {header}
        {section === 'guide' ? <GuideSection onOpen={openTopic} selected={twoPane ? topic : undefined} /> : <StepsSection />}
      </ScrollView>
    );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <View style={{ flex: 1, flexDirection: twoPane ? d.row : 'column' }}>
        <View style={twoPane ? { width: listWidth } : { flex: 1, width: '100%', maxWidth: section === 'signs' ? 960 : MAX_CONTENT_WIDTH, alignSelf: 'center' }}>{list}</View>
        {twoPane ? (
          <ScrollView style={[styles.pane, { borderColor: c.ln }, d.rtl ? { borderRightWidth: 1 } : { borderLeftWidth: 1 }]} contentContainerStyle={[styles.column, { paddingTop: SPACE.xl, paddingBottom: TAB_BAR_SPACE }]}>
            {section === 'signs' ? (
              <SignDetailBody id={sign} onOpen={setSign} onPractise={practise} showTitle />
            ) : (
              <TopicBody id={topic} onNav={setTopic} showTitle />
            )}
          </ScrollView>
        ) : null}
      </View>
      {section === 'steps' ? (
        <StickyBar inset={false}>
          {absherFailed ? <Notice tone="bad" text={t.errors.generic} /> : null}
          <Button title={t.license.absher} icon="globe" onPress={async () => setAbsherFailed(!(await openAbsher()))} />
        </StickyBar>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  column: { paddingHorizontal: LAYOUT.gutter, gap: LAYOUT.list, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  pane: { flex: 1 },
});
