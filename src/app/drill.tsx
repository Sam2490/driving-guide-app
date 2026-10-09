import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp, useDir } from '@/state/AppProvider';
import { useStudy } from '@/state/StudyProvider';
import { MAX_CONTENT_WIDTH, SPACE } from '@/theme/tokens';
import { Button, EmptyState, IconButton, ProgressBar, Row, StickyBar, T } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { ResultLayout } from '@/components/ResultLayout';
import { OptionButton, OptionContent, QuestionBody, QuestionSlide } from '@/components/Quiz';
import { QUESTIONS } from '@/data/questions';
import { prepareQuestion } from '@/features/quiz/engine';
import { mistakeIds } from '@/features/progress/progress';

const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));
const ROUND = 10;

/** Practise saved mistakes with instant feedback. Right twice in a row (across rounds) takes a question off the list. */
export default function Drill() {
  const { t, c } = useApp();
  const { mistakes, addMisses, addCorrect } = useStudy();
  const d = useDir();
  const insets = useSafeAreaInsets();
  const [round, setRound] = useState(0);
  // From an exam review, only that exam's wrong answers (still saved) are practised; otherwise every saved mistake.
  const { ids } = useLocalSearchParams<{ ids?: string }>();
  const only = ids ? ids.split(',') : null;
  const pool = () => (only ? mistakeIds(mistakes).filter((id) => only.includes(id)) : mistakeIds(mistakes));
  // The round is fixed when it starts, so answering does not reshuffle the questions under the learner.
  const questions = useMemo(
    () => pool().slice(0, ROUND).map((id) => BY_ID.get(id)).filter((q) => q !== undefined).map((q) => prepareQuestion(q)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round],
  );
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [right, setRight] = useState(0);
  const [done, setDone] = useState(false);
  const scroll = useRef<ScrollView>(null);

  if (questions.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center', padding: SPACE.xl, paddingTop: insets.top }}>
        <EmptyState icon="check" text={t.rd.noMistakes} action={<Button title={t.rd.backToPractice} onPress={() => router.back()} />} />
      </View>
    );
  }

  const left = only ? pool().length : Object.keys(mistakes).length;
  if (done) {
    const mastered = questions.filter((q) => !(q.id in mistakes)).length;
    // Right once so far: one more correct answer in a later round clears it.
    const halfway = questions.filter((q) => mistakes[q.id] === 1).length;
    return (
      <ResultLayout
        title={t.rd.drillTitle}
        onBack={() => router.back()}
        passed={right * 2 >= questions.length}
        verdict={t.rd.drillDone}
        verdictSub={t.rd.drillSub(mastered, left, halfway)}
        footnote={t.rd.drillRule}
        ring={{ value: right / questions.length, label: String(right), sub: t.rd.ofTotal(questions.length), a11y: t.test.score(right, questions.length) }}
        tiles={[
          { label: t.test.correctN, value: String(right), color: c.ok },
          { label: t.test.wrongN, value: String(questions.length - right), color: c.bad },
          { label: t.rd.drillLeft, value: String(left) },
        ]}
        actions={
          <>
            {left ? <Button title={t.rd.practiseThese(left)} icon="loop" onPress={() => { setRound((r) => r + 1); setI(0); setSel(null); setChecked(null); setRight(0); setDone(false); }} /> : null}
            <Button kind="secondary" title={t.rd.backToPractice} onPress={() => router.back()} />
          </>
        }
      />
    );
  }

  const q = questions[i];
  const check = () => {
    if (!sel) return;
    const good = sel === q.correctAnswerId;
    Haptics.notificationAsync(good ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
    if (good) {
      addCorrect([q.id]);
      setRight((r) => r + 1);
    } else addMisses([q.id]);
    setChecked(good);
  };
  const next = () => {
    if (i + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setI(i + 1);
    setSel(null);
    setChecked(null);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <View style={[styles.top, { flexDirection: d.row }]}>
        <IconButton icon="close" label={t.common.close} onPress={() => router.back()} />
        <View style={{ flex: 1, gap: SPACE.xxs }}>
          <T size={14} muted>{`${t.rd.drillTitle} · ${t.rd.counter(i + 1, questions.length)}`}</T>
          <ProgressBar value={(i + (checked === null ? 0 : 1)) / questions.length} height={4} />
        </View>
      </View>
      <ScrollView ref={scroll} contentContainerStyle={styles.body}>
        <QuestionSlide id={q.id}>
          <QuestionBody q={q} />
          <View accessibilityRole="radiogroup" style={{ gap: SPACE.sm, marginTop: SPACE.xs }}>
            {q.options.map((o, k) => {
              const state = checked !== null ? (o.id === q.correctAnswerId ? 'ok' : o.id === sel ? 'bad' : 'dim') : sel === o.id ? 'selected' : 'idle';
              return <OptionButton key={o.id} q={q} option={o} index={k} state={state} disabled={checked !== null} onPress={() => setSel(o.id)} />;
            })}
          </View>
        </QuestionSlide>
      </ScrollView>
      <StickyBar tone={checked === null ? undefined : checked ? 'ok' : 'bad'}>
        {checked !== null ? (
          <Row style={{ alignItems: 'flex-start' }} gap={SPACE.sm}>
            <Icon name={checked ? 'check' : 'close'} size={24} color={checked ? c.ok : c.bad} />
            <View style={{ flex: 1, gap: SPACE.xxs }} accessibilityLiveRegion="polite">
              <T role="title" color={checked ? c.ok : c.bad}>{checked ? t.levels.good : t.levels.bad}</T>
              {checked ? null : <OptionContent q={q} option={q.options.find((o) => o.id === q.correctAnswerId)!} size={56} />}
            </View>
          </Row>
        ) : null}
        <Button title={checked !== null ? t.levels.cont : t.levels.check} disabled={checked === null && !sel} onPress={checked !== null ? next : check} />
      </StickyBar>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', gap: SPACE.sm, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.sm, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  body: { padding: SPACE.lg, paddingBottom: SPACE.xl, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
});
