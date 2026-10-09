import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp, useDir } from '@/state/AppProvider';
import { useStudy } from '@/state/StudyProvider';
import { MAX_CONTENT_WIDTH, RADIUS, SPACE } from '@/theme/tokens';
import { Badge, Button, Dialog, EmptyState, IconButton, Notice, Pips, Row, StickyBar, Stars, T } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { ResultLayout } from '@/components/ResultLayout';
import { OptionButton, OptionContent, QuestionBody, QuestionSlide } from '@/components/Quiz';
import { QUESTIONS } from '@/data/questions';
import { answerRun, ATTEMPTS, completeLevel, isFailed, isUnlocked, levelCount, levelQuestions, startRun, type Run } from '@/features/levels/levels';

const TOTAL = levelCount(QUESTIONS.length);

export default function LevelScreen() {
  const params = useLocalSearchParams<{ n: string }>();
  const level = Math.max(1, Math.min(TOTAL, Number.parseInt(params.n ?? '1', 10) || 1));
  const { t, c, progress, setProgress } = useApp();
  const { addMisses, addCorrect } = useStudy();
  const L = t.levels;
  const d = useDir();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [attempt, setAttempt] = useState(0);
  const questions = useMemo(() => levelQuestions(QUESTIONS, level), [level, attempt]); // eslint-disable-line react-hooks/exhaustive-deps
  const [run, setRun] = useState<Run>(() => startRun(level));
  const [sel, setSel] = useState<string | null>(null);
  const [checked, setChecked] = useState<null | { good: boolean; gain: number }>(null);
  const [stage, setStage] = useState<'play' | 'win' | 'lose'>('play');
  const [outcome, setOutcome] = useState<null | { earned: number; stars: number; rankUp: number | null }>(null);
  const [ask, setAsk] = useState(false);
  const pending = useRef<unknown>(null);
  const allow = useRef(false);
  const scroll = useRef<ScrollView>(null);
  const q = questions[run.index];

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove' as never, (e: { preventDefault: () => void; data: { action: unknown } }) => {
      if (allow.current || stage !== 'play' || run.results.length === 0) return;
      e.preventDefault();
      pending.current = e.data.action;
      setAsk(true);
    });
    return unsub;
  }, [navigation, stage, run.results.length]);

  if (!isUnlocked(progress, level, TOTAL)) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center', padding: SPACE.xl }}>
        <EmptyState icon="lock" text={L.locked} action={<Button title={L.back} onPress={() => router.back()} />} />
      </View>
    );
  }

  const restart = (lv = level) => {
    if (lv !== level) {
      router.replace({ pathname: '/level/[n]', params: { n: String(lv) } });
      return;
    }
    setAttempt((a) => a + 1);
    setRun(startRun(level));
    setSel(null);
    setChecked(null);
    setStage('play');
    setOutcome(null);
  };

  const check = () => {
    if (!sel) return;
    const good = sel === q.correctAnswerId;
    const { run: next, gain } = answerRun(run, good);
    Haptics.notificationAsync(good ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
    if (good) addCorrect([q.id]);
    else addMisses([q.id]);
    setRun(next);
    setChecked({ good, gain });
  };

  const cont = () => {
    if (isFailed(run)) {
      setStage('lose');
      return;
    }
    if (run.index + 1 >= questions.length) {
      const res = completeLevel(progress, run, questions.length);
      setProgress(res.progress);
      setOutcome(res);
      setStage('win');
      return;
    }
    setRun({ ...run, index: run.index + 1 });
    setSel(null);
    setChecked(null);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  const leave = () => {
    setAsk(false);
    allow.current = true;
    const a = pending.current;
    pending.current = null;
    if (a) navigation.dispatch(a as never);
    else router.back();
  };

  if (stage !== 'play') {
    const win = stage === 'win';
    const acc = Math.round((run.correct / Math.max(1, run.results.length)) * 100);
    return (
      <ResultLayout
        title={`${L.lvl} ${level}`}
        onBack={() => router.back()}
        passed={win}
        verdict={win ? L.fin : L.fail}
        verdictSub={win ? undefined : run.results.length < questions.length ? L.failOut(run.results.length, questions.length) : L.failsub}
        ring={{ value: run.correct / questions.length, label: String(run.correct), sub: t.rd.ofTotal(questions.length), a11y: t.test.score(run.correct, questions.length) }}
        tiles={
          win && outcome
            ? [
                { label: L.gain, value: `+${outcome.earned}`, color: c.sand },
                { label: L.acc, value: `${acc}%` },
                { label: `${L.lvl} ${level}`, node: <Stars n={outcome.stars} size={20} label={t.rd.stars(outcome.stars)} /> },
              ]
            : [
                { label: t.test.correctN, value: String(run.correct), color: c.ok },
                { label: t.test.wrongN, value: String(run.results.length - run.correct), color: c.bad },
                { label: L.acc, value: `${acc}%` },
              ]
        }
        actions={
          <>
            {win ? (level < TOTAL ? <Button title={L.next} onPress={() => restart(level + 1)} /> : null) : <Button title={L.retry} icon="loop" onPress={() => restart()} />}
            <Button kind="secondary" title={L.back} onPress={() => router.back()} />
          </>
        }
      >
        {win && outcome?.rankUp != null ? <Notice tone="ok" title={L.rankup} text={L.ranks[outcome.rankUp]} /> : null}
      </ResultLayout>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <View style={[styles.top, { flexDirection: d.row }]}>
        <IconButton icon="close" label={L.leave} onPress={() => (run.results.length ? setAsk(true) : router.back())} />
        <View style={[styles.segs, { flexDirection: d.row }]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: questions.length, now: run.results.length }}>
          {questions.map((_, k) => (
            <View key={k} style={[styles.seg, { backgroundColor: k < run.results.length ? (run.results[k] ? c.ok : c.bad) : k === run.index ? c.acSolid : c.fill, opacity: k === run.index && k >= run.results.length ? 0.45 : 1 }]} />
          ))}
        </View>
        {/* Attempts: dots plus a visible count, so the meaning does not rely on colour alone. */}
        {/* Stretched to a fixed minimum width so the count's box is never content-sized (it wrapped in Hindi). */}
        <View accessible accessibilityLabel={`${L.attempts}: ${run.attempts}`} style={{ alignItems: 'stretch', minWidth: 72, gap: SPACE.xxs }}>
          <View style={{ alignItems: 'center' }}><Pips n={run.attempts} max={ATTEMPTS} color={c.bad} /></View>
          <T size={12} muted center maxScale={1.3}>{t.ux.attemptsLeft(run.attempts)}</T>
        </View>
      </View>
      <ScrollView ref={scroll} contentContainerStyle={styles.body}>
        <QuestionSlide id={q.id}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T size={14} muted>{`${L.lvl} ${level} · ${run.index + 1}/${questions.length}`}</T>
            {run.combo >= 3 ? <Badge tone="sand" icon="bolt" text={`${L.combo} ×${run.combo}`} /> : null}
          </Row>
          <QuestionBody q={q} />
          <View accessibilityRole="radiogroup" style={{ gap: SPACE.sm, marginTop: SPACE.xs }}>
            {q.options.map((o, k) => {
              const state = checked ? (o.id === q.correctAnswerId ? 'ok' : o.id === sel ? 'bad' : 'dim') : sel === o.id ? 'selected' : 'idle';
              return <OptionButton key={o.id} q={q} option={o} index={k} state={state} disabled={!!checked} onPress={() => setSel(o.id)} />;
            })}
          </View>
        </QuestionSlide>
      </ScrollView>
      {/* The feedback strip rises in the sticky footer, with the correct answer when the choice was wrong. */}
      <StickyBar tone={checked ? (checked.good ? 'ok' : 'bad') : undefined}>
        {checked ? (
          <Row style={{ alignItems: 'flex-start' }} gap={SPACE.sm}>
            <Icon name={checked.good ? 'check' : 'close'} size={24} color={checked.good ? c.ok : c.bad} />
            <View style={{ flex: 1, gap: SPACE.xxs }} accessibilityLiveRegion="polite">
              <T role="title" color={checked.good ? c.ok : c.bad}>{checked.good ? L.good : L.bad}</T>
              {checked.good ? <T size={14} color={c.sand} weight="semibold">{L.plus(checked.gain)}</T> : (
                <View style={{ gap: SPACE.xxs }}><T size={14} muted>{L.right}</T><OptionContent q={q} option={q.options.find((o) => o.id === q.correctAnswerId)!} size={56} /></View>
              )}
            </View>
          </Row>
        ) : null}
        <Button title={checked ? L.cont : L.check} disabled={!checked && !sel} onPress={checked ? cont : check} />
      </StickyBar>
      <Dialog
        visible={ask}
        text={L.quit}
        onClose={() => { pending.current = null; setAsk(false); }}
        actions={
          <>
            <Button title={L.stay} onPress={() => { pending.current = null; setAsk(false); }} />
            <Button kind="destructive" title={L.leave} onPress={leave} />
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', gap: SPACE.sm, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.sm, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  segs: { flex: 1, gap: SPACE.xxs },
  seg: { flex: 1, height: 6, borderRadius: RADIUS.pill },
  body: { padding: SPACE.lg, paddingBottom: SPACE.xl, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
});
