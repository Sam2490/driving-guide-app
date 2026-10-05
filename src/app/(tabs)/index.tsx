import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useApp, useDir } from '@/state/AppProvider';
import { Button, Card, IconButton, IconTile, LanguagePill, Row, Screen, Section, SourceBadge, T } from '@/components/ui';
import { useExam } from '@/state/ExamProvider';
import { QUESTIONS } from '@/data/questions';
import { DEFAULT_EXAM, startExam } from '@/features/quiz/engine';
import { Icon, type IconName } from '@/components/Icon';
import { TIPS, TIRE_RATINGS } from '@/data/tips';

const CARDS: { key: 'guide' | 'license' | 'signs' | 'schools' | 'test'; icon: IconName; href: Href }[] = [
  { key: 'test', icon: 'exam', href: '/test' },
  { key: 'guide', icon: 'book', href: '/guide' },
  { key: 'signs', icon: 'signs', href: '/signs' },
  { key: 'license', icon: 'license', href: '/guide/license' },
  { key: 'schools', icon: 'schools', href: '/schools' },
];

export default function Home() {
  const { t, c, lang } = useApp();
  const { exam, setExam, setExamDone } = useExam();
  const d = useDir();
  // The main button does what it says: it starts (or resumes) the mock exam.
  const start = () => {
    if (!exam) {
      setExamDone(null);
      setExam(startExam(QUESTIONS, DEFAULT_EXAM));
    }
    router.push('/exam');
  };
  return (
    <Screen
      title={t.home.title}
      compactTitle
      right={
        <Row gap={8}>
          <LanguagePill />
          <IconButton icon="info" label={t.home.about} onPress={() => router.push('/about')} />
        </Row>
      }
    >
      <Button title={exam ? t.test.resume : t.home.start} icon="exam" onPress={start} />
      <View style={[styles.grid, { flexDirection: d.row }]}>
        {CARDS.map(({ key, icon, href }, i) => {
          const [title, sub] = t.home.cards[key];
          const color = c.feature[key];
          return (
            <Card key={key} label={title} onPress={() => router.push(href)} style={[styles.feat, i === 0 && styles.featWide]}>
              {i === 0 ? (
                <Row>
                  <IconTile icon={icon} color={color} />
                  <View style={{ flex: 1 }}>
                    <T size={18} weight="semibold">{title}</T>
                    <T size={14} muted>{sub}</T>
                  </View>
                  <Icon name="go" size={18} color={c.tx2} flip={!d.rtl} />
                </Row>
              ) : (
                <>
                  <View style={{ alignSelf: d.start, marginBottom: 12 }}><IconTile icon={icon} color={color} /></View>
                  <T size={18} weight="semibold">{title}</T>
                  <T size={14} muted>{sub}</T>
                </>
              )}
            </Card>
          );
        })}
      </View>
      <Section title={t.home.quick}>
        <SourceBadge kind="official" />
        {TIPS[lang].map((tip) => (
          <Card key={tip.title}>
            <T size={18} weight="semibold" content={lang === 'ar'}>{tip.title}</T>
            {tip.lines.map((line) => (
              <Row key={line} gap={12} style={{ alignItems: 'flex-start', marginTop: 8 }}>
                <View style={[styles.dot, { backgroundColor: c.feature.guide }]} />
                <View style={{ flex: 1 }}><T size={16} muted content={lang === 'ar'}>{line}</T></View>
              </Row>
            ))}
          </Card>
        ))}
        <Card>
          <T size={18} weight="semibold">{t.home.tireT}</T>
          <T size={14} muted style={{ marginBottom: 12 }}>{t.home.tireP}</T>
          <View style={[styles.tires, { flexDirection: d.row }]}>
            {TIRE_RATINGS.map(([letter, kmh]) => (
              <View key={letter} style={[styles.tire, { backgroundColor: c.fill }]}>
                <T size={18} weight="bold" center>{letter}</T>
                <T size={14} muted center>{kmh}</T>
              </View>
            ))}
          </View>
        </Card>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexWrap: 'wrap', gap: 12, marginTop: 4 },
  feat: { flexBasis: '40%', flexGrow: 1, gap: 4, minHeight: 132 },
  featWide: { flexBasis: '100%', minHeight: 0 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 10 },
  tires: { flexWrap: 'wrap', gap: 8 },
  tire: { width: 64, borderRadius: 12, paddingVertical: 8 },
});
