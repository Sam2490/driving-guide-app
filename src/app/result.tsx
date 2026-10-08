import React from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/state/AppProvider';
import { useExam } from '@/state/ExamProvider';
import { Badge, Button, EmptyState, Notice, Row, Screen, T } from '@/components/ui';
import { ResultLayout } from '@/components/ResultLayout';
import { QUESTIONS } from '@/data/questions';
import { DEFAULT_EXAM, formatClock, scoreExam, startExam } from '@/features/quiz/engine';
import { readinessChange } from '@/features/progress/progress';

export default function Result() {
  const { t, c } = useApp();
  const { examDone, setExam, setExamDone, history, ready } = useExam();
  React.useEffect(() => {
    if (examDone) {
      const r = scoreExam(examDone.session.questions, examDone.session.answers, examDone.session.config.passMark);
      Haptics.notificationAsync(r.passed ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
  }, [examDone]);
  if (!examDone) {
    return (
      <Screen back tabSpace={false} onBack={() => router.replace('/practice')}>
        <EmptyState icon="exam" text={t.rd.readyEmpty} action={<Button title={t.test.start} onPress={() => router.replace('/practice')} />} />
      </Screen>
    );
  }
  const { session, finishedAt, timedOut } = examDone;
  const r = scoreExam(session.questions, session.answers, session.config.passMark);
  const used = Math.round((finishedAt - session.startedAt) / 1000);
  const delta = history[0]?.at === finishedAt ? readinessChange(history) : null;
  const again = () => {
    setExamDone(null);
    setExam(startExam(QUESTIONS, DEFAULT_EXAM));
    router.replace('/exam');
  };
  const perfect = r.correct === r.total;
  return (
    <ResultLayout
      title={t.ux.resultTitle}
      onBack={() => router.replace('/practice')}
      passed={r.passed}
      verdict={r.passed ? t.test.pass : t.test.fail}
      verdictSub={t.test.passMark(r.passMark)}
      ring={{ value: r.correct / r.total, label: String(r.correct), sub: t.rd.ofTotal(r.total), a11y: t.test.score(r.correct, r.total) }}
      tiles={[
        { label: t.test.correctN, value: String(r.correct), color: c.ok },
        { label: t.test.wrongN, value: String(r.wrong), color: c.bad },
        { label: t.test.blankN, value: String(r.unanswered), color: c.tx2 },
      ]}
      actions={
        <>
          {perfect ? <T center color={c.ok}>{t.test.perfect}</T> : <Button title={t.test.review} icon="eye" onPress={() => router.push('/review')} />}
          <Button kind={perfect ? 'primary' : 'secondary'} title={t.test.again} icon="loop" onPress={again} />
        </>
      }
      footnote={t.test.disclaimer}
    >
      {timedOut ? <Notice tone="warn" text={t.test.timeUp} /> : null}
      <Row style={{ justifyContent: 'center', flexWrap: 'wrap' }} gap={8}>
        <T muted center>{t.test.timeUsed(formatClock(used))}</T>
        {delta !== null && delta !== 0 ? <Badge tone={delta > 0 ? 'ok' : 'bad'} text={t.rd.readyDelta(ready.percent - delta, ready.percent)} /> : null}
      </Row>
    </ResultLayout>
  );
}
