import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, useDir } from '@/state/AppProvider';
import { MAX_CONTENT_WIDTH, RADIUS, SPACE } from '@/theme/tokens';
import { useExam } from '@/state/ExamProvider';
import { BottomSheet, Button, Dialog, EmptyState, IconButton, ProgressBar, Row, StickyBar, T } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { OptionButton, QuestionBody, QuestionSlide } from '@/components/Quiz';
import { answeredCount, formatClock, remainingSeconds, selectAnswer, toggleFlag } from '@/features/quiz/engine';

export default function ExamScreen() {
  const { t, c } = useApp();
  const { exam, setExam, setExamDone } = useExam();
  const d = useDir();
  const insets = useSafeAreaInsets();
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

  const onTimeUp = useCallback(() => {
    AccessibilityInfo.announceForAccessibility?.(t.test.timeUp);
    finish(true);
  }, [finish, t]);

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
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center', padding: SPACE.xl }}>
        <EmptyState icon="exam" text={t.errors.generic} action={<Button title={t.rd.backToPractice} onPress={() => router.replace('/practice')} />} />
      </View>
    );
  }

  const q = exam.questions[i];
  const n = exam.questions.length;
  const answered = answeredCount(exam);
  const unanswered = n - answered;
  const flags = exam.flags ?? [];
  const flagged = flags.includes(q.id);
  const leave = () => {
    allowLeave.current = true;
    setExam(null);
    setAsk(null);
    if (pendingAction.current) navigation.dispatch(pendingAction.current as never);
    else router.back();
  };
  const last = i === n - 1;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <View style={[styles.top, { flexDirection: d.row }]}>
        <IconButton icon="close" label={t.test.leave} onPress={() => setAsk('leave')} />
        {/* The counter opens the question grid. */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t.test.grid} accessibilityHint={t.test.answered(answered, n)} onPress={() => setGrid(true)} hitSlop={6} style={({ pressed }) => [styles.counter, { flexDirection: d.row, backgroundColor: pressed ? c.ln : c.fill }]}>
            <T size={16} weight="semibold" maxScale={1.3} style={{ writingDirection: 'ltr', fontVariant: ['tabular-nums'] }}>{t.rd.counter(i + 1, n)}</T>
            <Icon name="down" size={16} color={c.tx2} />
          </Pressable>
        </View>
        <ExamClock endsAt={exam.endsAt} onTimeUp={onTimeUp} />
      </View>
      <View style={styles.bar}><ProgressBar value={answered / n} height={4} label={t.test.answered(answered, n)} /></View>

      <ScrollView ref={scroll} contentContainerStyle={styles.body}>
        <QuestionSlide id={q.id}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T size={14} muted>{t.test.qOf(i + 1, n)}</T>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={flagged ? t.rd.unflag : t.rd.flag}
              accessibilityState={{ selected: flagged }}
              onPress={() => setExam(toggleFlag(exam, q.id))}
              hitSlop={8}
              style={[styles.flag, { flexDirection: d.row, backgroundColor: flagged ? c.warnbg : 'transparent' }]}
            >
              <Icon name="flag" size={16} color={flagged ? c.warn : c.tx2} filled={flagged} />
              <T size={14} weight="semibold" color={flagged ? c.warn : c.tx2}>{flagged ? t.rd.flagged : t.rd.flag}</T>
            </Pressable>
          </Row>
          <QuestionBody q={q} />
          <View accessibilityRole="radiogroup" style={{ gap: SPACE.sm, marginTop: SPACE.xs }}>
            {q.options.map((o, k) => (
              <OptionButton key={o.id} q={q} option={o} index={k} state={exam.answers[q.id] === o.id ? 'selected' : 'idle'} onPress={() => setExam(selectAnswer(exam, q.id, o.id))} />
            ))}
          </View>
        </QuestionSlide>
      </ScrollView>

      {/* Thumb-reach footer: Next is the wide primary action; Submit replaces it on the last question. */}
      <StickyBar>
        <Row gap={SPACE.sm}>
          <Button kind="secondary" dense title={t.test.prev} disabled={i === 0} onPress={() => setI(i - 1)} style={{ flex: 1 }} />
          {last ? (
            <Button dense title={t.test.submit} icon="check" onPress={() => setAsk('submit')} style={{ flex: 1.4 }} />
          ) : (
            <Button dense title={t.test.next} onPress={() => setI(i + 1)} style={{ flex: 1.4 }} />
          )}
        </Row>
      </StickyBar>

      <BottomSheet visible={grid} title={t.test.grid} onClose={() => setGrid(false)}>
        <T size={14} muted>{t.test.answered(answered, n)}</T>
        <View style={[styles.gridWrap, { flexDirection: d.row }]}>
          {exam.questions.map((x, k) => {
            const done = exam.answers[x.id] !== undefined;
            const flag = flags.includes(x.id);
            return (
              <Pressable
                key={x.id}
                accessibilityRole="button"
                accessibilityLabel={`${t.test.qOf(k + 1, n)}${done ? ' ✓' : ''}${flag ? ` · ${t.rd.flagged}` : ''}`}
                onPress={() => { setI(k); setGrid(false); }}
                style={[styles.cell, { backgroundColor: done ? c.acSolid : c.card, borderColor: k === i ? c.tx : done ? c.acSolid : c.lnStrong, borderWidth: k === i ? 3 : 1 }]}
              >
                <T size={16} weight="semibold" center color={done ? c.onAc : c.tx} maxScale={1.2}>{String(k + 1)}</T>
                {flag ? <View style={[styles.cellFlag, { backgroundColor: c.warn }]}><Icon name="flag" size={10} color={c.card} filled /></View> : null}
              </Pressable>
            );
          })}
        </View>
        <Button title={t.test.submit} icon="check" onPress={() => { setGrid(false); setAsk('submit'); }} />
      </BottomSheet>

      <Dialog
        visible={ask === 'submit'}
        text={answered ? t.test.submitAsk(unanswered) : t.rd.emptyExamAsk}
        onClose={() => setAsk(null)}
        actions={
          answered ? (
            <>
              <Button title={t.test.submit} onPress={() => { setAsk(null); finish(false); }} />
              <Button kind="secondary" title={t.test.keepGoing} onPress={() => setAsk(null)} />
            </>
          ) : (
            // Nothing answered: there is no result to keep, so the choice is to carry on or leave without a record.
            <>
              <Button title={t.test.keepGoing} onPress={() => setAsk(null)} />
              <Button kind="destructive" title={t.rd.endExam} onPress={leave} />
            </>
          )
        }
      />
      <Dialog
        visible={ask === 'leave'}
        text={t.test.leaveAsk}
        onClose={() => { pendingAction.current = null; setAsk(null); }}
        actions={
          <>
            <Button title={t.test.keepGoing} onPress={() => { pendingAction.current = null; setAsk(null); }} />
            <Button kind="destructive" title={t.rd.endExam} onPress={leave} />
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', gap: SPACE.sm, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.xs, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  bar: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', paddingHorizontal: SPACE.lg },
  body: { padding: SPACE.lg, paddingBottom: SPACE.xl, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  counter: { alignItems: 'center', gap: SPACE.xxs, minHeight: 44, paddingHorizontal: SPACE.md, borderRadius: RADIUS.pill },
  timer: { alignItems: 'center', gap: SPACE.xs, paddingHorizontal: SPACE.sm, minHeight: 44, borderRadius: RADIUS.pill },
  flag: { alignItems: 'center', gap: SPACE.xxs, minHeight: 36, paddingHorizontal: SPACE.sm, borderRadius: RADIUS.pill },
  gridWrap: { flexWrap: 'wrap', gap: SPACE.xs },
  cell: { width: 52, minHeight: 52, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  cellFlag: { position: 'absolute', top: 3, right: 3, width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
});

/**
 * The countdown re-renders itself every second; the question, options and image do not. It reads the stored end
 * time, so it stays correct after the app was in the background. Under 5 minutes it turns amber, and screen readers
 * hear the time left at 5 minutes and 1 minute.
 */
const ExamClock = React.memo(function ExamClock({ endsAt, onTimeUp }: { endsAt: number; onTimeUp: () => void }) {
  const { c, t } = useApp();
  const [left, setLeft] = useState(() => remainingSeconds(endsAt));
  const said = useRef<Set<number>>(new Set());
  useEffect(() => {
    const tick = () => {
      const r = remainingSeconds(endsAt);
      setLeft(r);
      for (const m of [5, 1]) {
        if (r <= m * 60 && r > m * 60 - 5 && !said.current.has(m)) {
          said.current.add(m);
          AccessibilityInfo.announceForAccessibility?.(t.rd.timeWarn(m));
        }
      }
      if (r <= 0) onTimeUp();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt, onTimeUp, t]);
  const low = left < 300;
  return (
    <View accessibilityLabel={formatClock(left)} style={[styles.timer, { backgroundColor: low ? c.warnbg : c.fill, flexDirection: 'row' }]}>
      <Icon name="clock" size={16} color={low ? c.warn : c.tx} />
      <T size={16} weight="semibold" color={low ? c.warn : c.tx} maxScale={1.3} style={{ fontVariant: ['tabular-nums'], writingDirection: 'ltr' }}>{formatClock(left)}</T>
    </View>
  );
});
