import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, useDir } from '@/state/AppProvider';
import { MAX_CONTENT_WIDTH } from '@/theme/tokens';
import { useExam } from '@/state/ExamProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button, Dialog, IconButton, ProgressBar, Row, T } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { OptionButton, QuestionBody } from '@/components/Quiz';
import { answeredCount, formatClock, remainingSeconds, selectAnswer } from '@/features/quiz/engine';

export default function ExamScreen() {
  const { t, c } = useApp();
  const { exam, setExam, setExamDone } = useExam();
  const reduce = useReducedMotion();
  const d = useDir();
  const insets = useSafeAreaInsets();
  const winW = useWindowDimensions().width;
  const navigation = useNavigation();
  const [i, setI] = useState(0);
  const [grid, setGrid] = useState(false);
  const [ask, setAsk] = useState<null | 'submit' | 'leave'>(null);
  const allowLeave = useRef(false);
  const pendingAction = useRef<unknown>(null);
  const scroll = useRef<ScrollView>(null);

  const finish = useCallback(
    (timedOut: boolean) => {
      if (!exam) return;
      allowLeave.current = true;
      setExamDone({ session: exam, finishedAt: Math.min(Date.now(), exam.endsAt), timedOut });
      setExam(null);
      router.replace('/result');
    },
    [exam, setExam, setExamDone],
  );

  const onTimeUp = useCallback(() => finish(true), [finish]);

  // Confirm before the Android back button or a swipe throws the exam away.
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove' as never, (e: { preventDefault: () => void; data: { action: unknown } }) => {
      if (allowLeave.current || !exam) return;
      e.preventDefault();
      pendingAction.current = e.data.action;
      setAsk('leave');
    });
    return unsub;
  }, [navigation, exam]);

  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [i]);

  if (!exam) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
        <T center muted>{t.errors.generic}</T>
        <Button title={t.common.back} onPress={() => router.replace('/test')} />
      </View>
    );
  }

  const q = exam.questions[i];
  const n = exam.questions.length;
  const answered = answeredCount(exam);
  const unanswered = n - answered;
  const leave = () => {
    allowLeave.current = true;
    setExam(null);
    setAsk(null);
    if (pendingAction.current) navigation.dispatch(pendingAction.current as never);
    else router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <View style={[styles.top, { flexDirection: d.row }]}>
        <IconButton icon="close" label={t.test.leave} onPress={() => setAsk('leave')} />
        <View style={{ flex: 1, gap: 8 }}>
          <T size={14} muted>{t.test.qOf(i + 1, n)}</T>
          <ProgressBar value={answered / n} />
        </View>
        <ExamClock endsAt={exam.endsAt} onTimeUp={onTimeUp} />
      </View>

      <ScrollView ref={scroll} contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 24, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' }}>
        <QuestionBody q={q} />
        <View style={{ gap: 12, marginTop: 8 }}>
          {q.options.map((o, k) => (
            <OptionButton key={o.id} q={q} option={o} index={k} state={exam.answers[q.id] === o.id ? 'selected' : 'idle'} onPress={() => setExam(selectAnswer(exam, q.id, o.id))} />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.dock, { width: Math.min(winW - 24, MAX_CONTENT_WIDTH - 16), backgroundColor: c.glass, borderColor: c.glassBorder, marginBottom: Math.max(insets.bottom, 12) }]}>
        <Row gap={12}>
          <Button small kind="ghost" title={t.test.prev} disabled={i === 0} onPress={() => setI(i - 1)} style={{ flex: 1 }} />
          <Pressable accessibilityRole="button" accessibilityLabel={t.test.grid} onPress={() => setGrid(true)} style={[styles.gridBtn, { backgroundColor: c.fill }]}>
            <Icon name="grid" size={24} color={c.tx} />
          </Pressable>
          {i < n - 1 ? (
            <Button small title={t.test.next} onPress={() => setI(i + 1)} style={{ flex: 1 }} />
          ) : (
            <Button small kind="ok" title={t.test.submit} onPress={() => setAsk('submit')} style={{ flex: 1 }} />
          )}
        </Row>
      </View>

      <Modal visible={grid} transparent animationType={reduce ? 'none' : 'slide'} onRequestClose={() => setGrid(false)} statusBarTranslucent>
        <Pressable style={{ flex: 1, backgroundColor: c.scrim }} onPress={() => setGrid(false)} accessibilityRole="button" accessibilityLabel={t.common.close} />
        <View accessibilityViewIsModal style={[styles.sheet, { backgroundColor: c.card, paddingBottom: 16 + insets.bottom }]}>
          <T size={18} weight="bold">{t.test.grid}</T>
          <T size={14} muted>{t.test.answered(answered, n)}</T>
          <View style={[styles.gridWrap, { flexDirection: d.row }]}>
            {exam.questions.map((x, k) => {
              const done = exam.answers[x.id] !== undefined;
              return (
                <Pressable key={x.id} accessibilityRole="button" accessibilityLabel={`${t.test.qOf(k + 1, n)}${done ? ' ✓' : ''}`} onPress={() => { setI(k); setGrid(false); }} style={[styles.cell, { backgroundColor: done ? c.acSolid : c.fill, borderColor: k === i ? c.ac : 'transparent', borderWidth: k === i ? 3 : 2 }]}>
                  <T size={16} weight="semibold" center color={done ? c.onAc : c.tx}>{String(k + 1)}</T>
                </Pressable>
              );
            })}
          </View>
          <Button kind="ok" title={t.test.submit} onPress={() => { setGrid(false); setAsk('submit'); }} />
        </View>
      </Modal>

      <Dialog
        visible={ask === 'submit'}
        text={t.test.submitAsk(unanswered)}
        onClose={() => setAsk(null)}
        actions={
          <>
            <Button kind="ok" title={t.test.submit} onPress={() => { setAsk(null); finish(false); }} />
            <Button kind="ghost" title={t.test.keepGoing} onPress={() => setAsk(null)} />
          </>
        }
      />
      <Dialog
        visible={ask === 'leave'}
        text={t.test.leaveAsk}
        onClose={() => { pendingAction.current = null; setAsk(null); }}
        actions={
          <>
            <Button title={t.test.keepGoing} onPress={() => { pendingAction.current = null; setAsk(null); }} />
            <Button kind="ghost" title={t.test.leave} onPress={leave} />
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  timer: { alignItems: 'center', gap: 8, paddingHorizontal: 12, minHeight: 44, borderRadius: 999 },
  dock: { alignSelf: 'center', padding: 12, borderRadius: 24, borderWidth: 1 },
  gridBtn: { width: 48, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 12 },
  gridWrap: { flexWrap: 'wrap', gap: 8 },
  cell: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
});

/**
 * The countdown re-renders itself every second; the question, options and image above it do not.
 * It reads the stored end time, so it stays correct after the app was in the background.
 */
const ExamClock = React.memo(function ExamClock({ endsAt, onTimeUp }: { endsAt: number; onTimeUp: () => void }) {
  const { c } = useApp();
  const [left, setLeft] = useState(() => remainingSeconds(endsAt));
  useEffect(() => {
    const tick = () => {
      const r = remainingSeconds(endsAt);
      setLeft(r);
      if (r <= 0) onTimeUp();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt, onTimeUp]);
  const low = left < 300;
  return (
    <View accessibilityLabel={formatClock(left)} style={[styles.timer, { backgroundColor: low ? c.badbg : c.fill, flexDirection: 'row' }]}>
      <Icon name="clock" size={16} color={low ? c.bad : c.tx} />
      <T size={16} weight="semibold" color={low ? c.bad : c.tx} style={{ fontVariant: ['tabular-nums'], writingDirection: 'ltr' }}>{formatClock(left)}</T>
    </View>
  );
});
