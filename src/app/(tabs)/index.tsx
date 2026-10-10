import React, { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useApp, useDir } from '@/state/AppProvider';
import { useExam } from '@/state/ExamProvider';
import { useStudy } from '@/state/StudyProvider';
import { Button, Card, IconButton, LanguagePill, ListRow, Ring, Row, Screen, Section, T } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { QUESTIONS } from '@/data/questions';
import { STEPS } from '@/data/steps';
import { TIPS } from '@/data/tips';
import { answeredCount, DEFAULT_EXAM, startExam } from '@/features/quiz/engine';
import { currentLevel, levelCount } from '@/features/levels/levels';
import { READINESS_WINDOW } from '@/features/progress/progress';
import { BREAKPOINTS, SPACE } from '@/theme/tokens';

const TOTAL_LEVELS = levelCount(QUESTIONS.length);

/** Home answers "how close am I to passing?" and offers the next useful step. The tabs do the routing. */
export default function Home() {
  const { t, c, lang, progress } = useApp();
  const { exam, setExam, setExamDone, ready } = useExam();
  const { mistakes, learn } = useStudy();
  const wide = useWindowDimensions().width >= BREAKPOINTS.medium;
  const d = useDir();
  const start = () => {
    if (!exam) {
      setExamDone(null);
      setExam(startExam(QUESTIONS, DEFAULT_EXAM));
    }
    router.push('/exam');
  };
  const missed = Object.keys(mistakes).length;
  const level = currentLevel(progress, TOTAL_LEVELS);
  const steps = STEPS[lang].length;
  const tips = TIPS[lang];
  const [day] = useState(() => Math.floor(Date.now() / 86_400_000));
  const tip = tips[day % tips.length];
  const none = ready.level === 'none';

  const readiness = (
    <Card style={{ gap: SPACE.md, flex: wide ? 1 : undefined }}>
      <Row gap={SPACE.md} style={{ alignItems: 'center' }}>
        {none ? null : <Ring value={ready.percent / 100} size={96} label={`${ready.percent}%`} a11y={t.rd.readyA11y(ready.percent, ready.passed, ready.counted)} color={ready.level === 'practise' ? c.warn : c.meter} />}
        <View style={{ flex: 1, gap: SPACE.xxs }}>
          <T size={14} weight="semibold" muted header>{t.rd.readyTitle}</T>
          <T role="h3">{t.rd.readyLevels[ready.level]}</T>
          <T size={14} muted>{none ? t.rd.readyEmpty : t.rd.readySub(ready.passed, ready.counted)}</T>
        </View>
      </Row>
      {/* What the number is, and what it is not (an official verdict or a promise). */}
      {none ? null : <T size={12} muted>{t.rd.readyHow(READINESS_WINDOW)}</T>}
      <Button title={exam ? t.test.resume : t.home.start} icon={exam ? 'loop' : 'exam'} onPress={start} />
      {/* The exam in progress is resumed here only (no second "continue" row below), with its count under the button. */}
      {exam ? <T size={14} muted center style={{ marginTop: -SPACE.xs }}>{t.test.answered(answeredCount(exam), exam.questions.length)}</T> : null}
    </Card>
  );

  return (
    <Screen
      title={t.home.title}
      large
      right={
        <Row gap={SPACE.xs}>
          <LanguagePill />
          <IconButton icon="gear" label={t.home.settings} onPress={() => router.push('/settings')} />
        </Row>
      }
    >
      {/* Medium widths and up: readiness and "continue" side by side. */}
      <View style={{ flexDirection: wide ? d.row : 'column', gap: SPACE.md, alignItems: wide ? 'flex-start' : 'stretch' }}>
      {readiness}
      <View style={{ flex: wide ? 1 : undefined, marginTop: wide ? -SPACE.md : 0 }}>
      <Section title={t.rd.continueT}>
        <ListRow icon="road" title={t.rd.levelRow(level)} sub={t.rd.levelSub} onPress={() => router.push({ pathname: '/level/[n]', params: { n: String(level) } })} />
        {missed ? (
          <ListRow icon="loop" title={t.rd.mistakesRow(missed)} sub={t.rd.mistakesSub} tileBg={c.badbg} tileColor={c.bad} onPress={() => router.push('/practice/mistakes')} />
        ) : null}
        <ListRow icon="license" title={t.rd.stepsRow(learn.steps.length, steps)} onPress={() => router.push({ pathname: '/learn', params: { section: 'steps' } })} />
      </Section>
      </View>
      </View>

      {tip ? (
        <Section title={t.rd.tipT}>
          <Card style={{ gap: SPACE.xs }}>
            <Row gap={SPACE.xs}>
              <Icon name="bulb" size={20} color={c.info} />
              <View style={{ flex: 1 }}><T role="title" content={lang === 'ar'}>{tip.title}</T></View>
            </Row>
            {tip.lines.slice(0, 2).map((line) => (
              <Row key={line} gap={SPACE.sm} style={{ alignItems: 'flex-start' }}>
                <View style={[styles.dot, { backgroundColor: c.info }]} />
                <View style={{ flex: 1 }}><T size={16} muted content={lang === 'ar'}>{line}</T></View>
              </Row>
            ))}
            <View style={{ alignItems: d.start }}>
              <Button kind="tertiary" small title={t.rd.tipMore} onPress={() => router.push({ pathname: '/learn', params: { section: 'guide' } })} />
            </View>
          </Card>
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 10 },
});
