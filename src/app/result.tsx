import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp, useDir } from '@/state/AppProvider';
import { useExam } from '@/state/ExamProvider';
import { Button, Card, Notice, Ring, Row, Screen, T } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { QUESTIONS } from '@/data/questions';
import { DEFAULT_EXAM, formatClock, scoreExam, startExam } from '@/features/quiz/engine';

export default function Result() {
  const { t, c } = useApp();
  const { examDone, setExam, setExamDone } = useExam();
  const d = useDir();
  React.useEffect(() => {
    if (examDone) {
      const r = scoreExam(examDone.session.questions, examDone.session.answers, examDone.session.config.passMark);
      Haptics.notificationAsync(r.passed ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  }, [examDone]);
  if (!examDone) {
    return <Screen back tabSpace={false}><Button title={t.test.start} onPress={() => router.replace('/test')} /></Screen>;
  }
  const { session, finishedAt, timedOut } = examDone;
  const r = scoreExam(session.questions, session.answers, session.config.passMark);
  const used = Math.round((finishedAt - session.startedAt) / 1000);
  const again = () => {
    setExamDone(null);
    setExam(startExam(QUESTIONS, DEFAULT_EXAM));
    router.replace('/exam');
  };
  const tone = r.passed ? c.ok : c.bad;
  // Verdict first, then one score (inside the ring), then the breakdown.
  return (
    <Screen back title={t.ux.resultTitle} onBack={() => router.replace('/test')} tabSpace={false}>
      {timedOut ? <Notice tone="bad" text={t.test.timeUp} /> : null}
      <View style={[styles.verdict, { backgroundColor: r.passed ? c.okbg : c.badbg, borderColor: tone }]} accessibilityRole="summary">
        <Row gap={8} style={{ justifyContent: 'center' }}>
          <Icon name={r.passed ? 'check' : 'close'} size={24} color={tone} />
          <T size={28} weight="bold" color={tone}>{r.passed ? t.test.pass : t.test.fail}</T>
        </Row>
        <T size={14} center color={tone}>{t.test.passMark(r.passMark)}</T>
      </View>
      <Ring value={r.percent / 100} size={170} color={tone} label={t.test.score(r.correct, r.total)} />
      <Row gap={12}>
        {[
          [t.test.correctN, r.correct, c.ok],
          [t.test.wrongN, r.wrong, c.bad],
          [t.test.blankN, r.unanswered, c.tx2],
        ].map(([label, v, col]) => (
          <Card key={String(label)} style={styles.stat}>
            <T size={24} weight="bold" center color={String(col)}>{String(v)}</T>
            <T size={12} muted center>{String(label)}</T>
          </Card>
        ))}
      </Row>
      <T muted center>{t.test.timeUsed(formatClock(used))}</T>
      {r.correct === r.total ? <T center color={c.ok}>{t.test.perfect}</T> : <Button title={t.test.review} icon="eye" onPress={() => router.push('/review')} />}
      <Button kind={r.correct === r.total ? 'primary' : 'ghost'} title={t.test.again} icon="loop" onPress={again} />
      <View style={{ alignItems: d.start }}><T size={14} muted>{t.test.disclaimer}</T></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  verdict: { borderRadius: 16, borderWidth: 1, paddingVertical: 16, paddingHorizontal: 16, gap: 4 },
  stat: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, gap: 4 },
});
