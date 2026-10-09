import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useApp, useDir } from '@/state/AppProvider';
import { useExam } from '@/state/ExamProvider';
import { useStudy } from '@/state/StudyProvider';
import { Button, Card, IconTile, ListRow, Row, Screen, Section, SnugText, T } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { LevelPath, RankCard } from '@/components/Journey';
import { QUESTIONS } from '@/data/questions';
import { answeredCount, DEFAULT_EXAM, startExam } from '@/features/quiz/engine';
import { BREAKPOINTS, SPACE } from '@/theme/tokens';

/** Practice: the mock exam on top, saved mistakes, then the level path. One scroll, no hidden modes. */
export default function Practice() {
  const { t, c } = useApp();
  const d = useDir();
  const { exam, setExam, setExamDone, history } = useExam();
  const { mistakes } = useStudy();
  const wide = useWindowDimensions().width >= BREAKPOINTS.medium;
  const last = history[0];
  const best = history.reduce<typeof last | undefined>((b, h) => (!b || h.correct / h.total > b.correct / b.total ? h : b), undefined);
  const missed = Object.keys(mistakes).length;
  const begin = () => {
    setExamDone(null);
    setExam(startExam(QUESTIONS, DEFAULT_EXAM));
    router.push('/exam');
  };
  const examCard = (
    <Card style={{ gap: SPACE.sm, flex: wide ? 1 : undefined }}>
      <Row>
        <IconTile icon="exam" />
        <View style={{ flex: 1 }}>
          <T role="h3">{t.test.exTitle}</T>
          <T size={14} muted>{t.test.exSub(DEFAULT_EXAM.count, DEFAULT_EXAM.minutes, DEFAULT_EXAM.passMark)}</T>
        </View>
      </Row>
      {t.test.rules.map((r) => (
        <Row key={r} gap={SPACE.xs} style={{ alignItems: 'flex-start' }}>
          <Icon name="check" size={16} color={c.ok} />
          <View style={{ flex: 1 }}><T size={16} muted>{r}</T></View>
        </Row>
      ))}
      {exam ? (
        <>
          {/* The count sits under the button: inside the label it wrapped and left one word or number alone. */}
          <View style={{ gap: SPACE.xxs }}>
            <Button title={t.test.resume} label={`${t.test.resume} · ${t.test.answered(answeredCount(exam), exam.questions.length)}`} icon="loop" onPress={() => router.push('/exam')} />
            <T size={14} muted center>{t.test.answered(answeredCount(exam), exam.questions.length)}</T>
          </View>
          <Button kind="secondary" title={t.test.again} onPress={begin} />
        </>
      ) : (
        <Button title={t.test.start} icon="clock" onPress={begin} />
      )}
      {last && best ? (
        <View style={{ gap: 2, alignItems: d.start }}>
          <Row gap={SPACE.xs} style={{ flexShrink: 1 }}>
            <Icon name={last.passed ? 'check' : 'close'} size={16} color={last.passed ? c.ok : c.bad} />
            <SnugText size={14} weight="semibold">{t.ux.lastResult(last.correct, last.total, last.passed)}</SnugText>
          </Row>
          <SnugText size={14} muted>{t.ux.best(best.correct, best.total)}</SnugText>
        </View>
      ) : null}
    </Card>
  );
  return (
    <Screen title={t.rd.practiceTitle} large>
      <View style={{ flexDirection: wide ? d.row : 'column', gap: SPACE.sm, alignItems: 'stretch' }}>
        {examCard}
        {wide ? <View style={{ flex: 1 }}><RankCard /></View> : null}
      </View>
      <ListRow
        icon="loop"
        title={missed ? t.rd.mistakesRow(missed) : t.rd.noMistakes}
        sub={missed ? t.rd.mistakesSub : undefined}
        tileBg={missed ? c.badbg : undefined}
        tileColor={missed ? c.bad : undefined}
        onPress={() => router.push('/practice/mistakes')}
      />
      <Section title={t.rd.pathTitle}>
        {wide ? null : <RankCard />}
        <LevelPath />
      </Section>
      <T size={14} muted>{t.test.disclaimer}</T>
    </Screen>
  );
}
