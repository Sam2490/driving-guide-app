import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp, useDir } from '@/state/AppProvider';
import { MAX_CONTENT_WIDTH } from '@/theme/tokens';
import { Button, Card, Dialog, IconButton, Pips, Ring, Row, T } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { OptionButton, OptionContent, QuestionBody } from '@/components/Quiz';
import { QUESTIONS } from '@/data/questions';
import { answerRun, ATTEMPTS, completeLevel, isFailed, isUnlocked, levelCount, levelQuestions, startRun, type Run } from '@/features/levels/levels';

const TOTAL = levelCount(QUESTIONS.length);

export default function LevelScreen() {
  const params = useLocalSearchParams<{ n: string }>();
  const level = Math.max(1, Math.min(TOTAL, Number.parseInt(params.n ?? '1', 10) || 1));
  const { t, c, progress, setProgress } = useApp();
  const L = t.levels;
  const d = useDir();
  const insets = useSafeAreaInsets();
  const winW = useWindowDimensions().width;
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
      <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
        <Icon name="lock" size={36} color={c.tx2} />
        <T center muted>{L.locked}</T>
        <Button title={L.back} onPress={() => router.back()} />
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
    Haptics.notificationAsync(good ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
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
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 16 }}>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16, alignItems: 'stretch' }}>
          {win ? (
            <Ring value={run.correct / questions.length} color={c.ok} label={`${run.correct}/${questions.length}`} />
          ) : (
            <View style={[styles.bigIcon, { backgroundColor: c.badbg }]}><Icon name="flag" size={40} color={c.bad} /></View>
          )}
          <T size={28} weight="bold" center>{win ? L.fin : L.fail}</T>
          {!win ? <T muted center>{L.failsub}</T> : null}
          <Row gap={12} style={{ justifyContent: 'center' }}>
            {win && outcome ? (
              <Card style={styles.stat}><T size={20} weight="bold" center>{`+${outcome.earned}`}</T><T size={12} muted center>{L.gain}</T></Card>
            ) : null}
            <Card style={styles.stat}><T size={20} weight="bold" center>{`${Math.round((run.correct / Math.max(1, run.results.length)) * 100)}%`}</T><T size={12} muted center>{L.acc}</T></Card>
            {win && outcome ? (
              <Card style={[styles.stat, { alignItems: 'center' }]}><Pips n={outcome.stars} max={3} color={c.ac} /><T size={12} muted center>{`${L.lvl} ${level}`}</T></Card>
            ) : null}
          </Row>
          {win && outcome?.rankUp != null ? (
            <Card accent={c.ac} style={{ backgroundColor: c.ac + '1f' }}>
              <Row><Icon name="up" color={c.ac} /><View style={{ flex: 1 }}><T size={14} muted>{L.rankup}</T><T size={18} weight="bold">{L.ranks[outcome.rankUp]}</T></View></Row>
            </Card>
          ) : null}
          {win ? (level < TOTAL ? <Button title={L.next} onPress={() => restart(level + 1)} /> : null) : <Button title={L.retry} onPress={() => restart()} />}
          <Button kind="ghost" title={L.back} onPress={() => router.back()} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <View style={[styles.top, { flexDirection: d.row }]}>
        <IconButton icon="close" label={L.leave} onPress={() => (run.results.length ? setAsk(true) : router.back())} />
        <View style={[styles.segs, { flexDirection: d.row }]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: questions.length, now: run.results.length }}>
          {questions.map((_, k) => (
            <View key={k} style={[styles.seg, { backgroundColor: k < run.results.length ? (run.results[k] ? c.ok : c.bad) : k === run.index ? c.ac + '8c' : c.fill }]} />
          ))}
        </View>
        {/* Attempts: dots plus a visible count, so the meaning does not rely on colour alone. */}
        <View accessible accessibilityLabel={`${L.attempts}: ${run.attempts}`} style={{ alignItems: 'center', gap: 4 }}>
          <Pips n={run.attempts} max={ATTEMPTS} color={c.bad} />
          <T size={12} muted>{t.ux.attemptsLeft(run.attempts)}</T>
        </View>
      </View>
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 24, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T size={14} muted>{`${L.lvl} ${level} · ${run.index + 1}/${questions.length}`}</T>
          {run.combo >= 3 ? <Row gap={4}><Icon name="bolt" size={16} color={c.ac} filled /><T size={14} weight="semibold" color={c.ac}>{`${L.combo} ×${run.combo}`}</T></Row> : null}
        </Row>
        <QuestionBody q={q} />
        <View style={{ gap: 12, marginTop: 8 }}>
          {q.options.map((o, k) => {
            const state = checked ? (o.id === q.correctAnswerId ? 'ok' : o.id === sel ? 'bad' : 'dim') : sel === o.id ? 'selected' : 'idle';
            return <OptionButton key={o.id} q={q} option={o} index={k} state={state} disabled={!!checked} onPress={() => setSel(o.id)} />;
          })}
        </View>
      </ScrollView>
      <View style={[styles.dock, { width: Math.min(winW - 24, MAX_CONTENT_WIDTH - 16), backgroundColor: checked ? (checked.good ? c.okbg : c.badbg) : c.glass, borderColor: checked ? (checked.good ? c.ok : c.bad) : c.glassBorder, marginBottom: Math.max(insets.bottom, 12) }]}>
        {checked ? (
          <Row style={{ marginBottom: 12, alignItems: 'flex-start' }}>
            <Icon name={checked.good ? 'check' : 'close'} size={24} color={checked.good ? c.ok : c.bad} />
            <View style={{ flex: 1, gap: 4 }}>
              <T size={18} weight="bold" color={checked.good ? c.ok : c.bad}>{checked.good ? L.good : L.bad}</T>
              {checked.good ? <T size={14} muted>{`+${checked.gain} ${L.xp}`}</T> : (
                <View style={{ gap: 4 }}><T size={14} muted>{L.right}</T><OptionContent q={q} option={q.options.find((o) => o.id === q.correctAnswerId)!} size={56} /></View>
              )}
            </View>
          </Row>
        ) : null}
        <Button kind={checked?.good ? 'ok' : 'primary'} title={checked ? L.cont : L.check} disabled={!checked && !sel} onPress={checked ? cont : check} />
      </View>
      <Dialog
        visible={ask}
        text={L.quit}
        onClose={() => { pending.current = null; setAsk(false); }}
        actions={
          <>
            <Button title={L.stay} onPress={() => { pending.current = null; setAsk(false); }} />
            <Button kind="ghost" title={L.leave} onPress={leave} />
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  segs: { flex: 1, gap: 4 },
  seg: { flex: 1, height: 6, borderRadius: 3 },
  dock: { alignSelf: 'center', padding: 12, borderRadius: 24, borderWidth: 1 },
  stat: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, gap: 4 },
  bigIcon: { width: 76, height: 76, borderRadius: 24, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
});
