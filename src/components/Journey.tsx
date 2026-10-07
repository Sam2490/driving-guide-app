import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useApp, useDir } from '@/state/AppProvider';
import { QUESTIONS } from '@/data/questions';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { currentLevel, levelCount, LEVELS_PER_STAGE, rankFor, rankProgress, stageCount } from '@/features/levels/levels';
import { RADIUS, SPACE } from '@/theme/tokens';
import { Card, IconTile, ProgressBar, Row, Stars, T } from './ui';
import { Icon } from './Icon';

const TOTAL = levelCount(QUESTIONS.length);
const STAGES = stageCount(QUESTIONS.length);

/** Rank, XP (sand) and progress to the next rank. */
export function RankCard() {
  const { t, c, progress } = useApp();
  const L = t.levels;
  const r = rankFor(progress.xp);
  const doneCount = Object.keys(progress.done).length;
  return (
    <Card style={{ gap: SPACE.sm }}>
      <Row>
        <IconTile icon="road" />
        <View style={{ flex: 1 }}>
          <T size={14} muted>{L.rank}</T>
          <T role="title">{L.ranks[r]}</T>
        </View>
        <View style={{ alignItems: 'center' }}>
          <T role="h2" size={24} center color={c.sand} maxScale={1.3}>{String(progress.xp)}</T>
          <T size={12} muted center>{L.xp}</T>
        </View>
      </Row>
      <ProgressBar value={rankProgress(progress.xp)} color={c.sand} label={L.rank} />
      <Row gap={SPACE.md}>
        <Row gap={SPACE.xs}><Icon name="flame" size={16} color={c.tx2} /><T size={14} muted>{`${progress.streak} ${L.streak}`}</T></Row>
        <Row gap={SPACE.xs}><Icon name="check" size={16} color={c.tx2} /><T size={14} muted>{`${doneCount}/${TOTAL} ${L.done}`}</T></Row>
      </Row>
    </Card>
  );
}

/** The current level's badge pulses once when the path opens (not with reduced motion). */
function Pulse({ children, on }: { children: React.ReactNode; on: boolean }) {
  const reduce = useReducedMotion();
  const s = useState(() => new Animated.Value(1))[0];
  useEffect(() => {
    if (!on || reduce) return;
    Animated.sequence([Animated.timing(s, { toValue: 1.15, duration: 180, useNativeDriver: true }), Animated.spring(s, { toValue: 1, useNativeDriver: true })]).start();
  }, [on, reduce, s]);
  return <Animated.View style={{ transform: [{ scale: s }] }}>{children}</Animated.View>;
}

/** The level path: stages (open the current one) with numbered levels joined by a road line. Brand green only. */
export function LevelPath() {
  const { t, c, progress } = useApp();
  const d = useDir();
  const L = t.levels;
  const cur = currentLevel(progress, TOTAL);
  const [open, setOpen] = useState<Record<number, boolean>>({ [Math.floor((cur - 1) / LEVELS_PER_STAGE)]: true });

  return (
    <View style={{ gap: SPACE.sm }}>
      {Array.from({ length: STAGES }, (_, u) => {
        const levels = Array.from({ length: Math.min(LEVELS_PER_STAGE, TOTAL - u * LEVELS_PER_STAGE) }, (_, i) => u * LEVELS_PER_STAGE + i + 1);
        const n = levels.filter((l) => progress.done[l]).length;
        const isOpen = !!open[u];
        const complete = n === levels.length;
        return (
          <View key={u} style={[styles.stage, { backgroundColor: c.card, borderColor: c.ln }]}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: isOpen }} accessibilityLabel={`${L.stage} ${u + 1}, ${n}/${levels.length}`} onPress={() => setOpen({ ...open, [u]: !isOpen })} style={({ pressed }) => [styles.stageHead, { flexDirection: d.row, backgroundColor: pressed ? c.fill : 'transparent' }]}>
              <View style={[styles.stageIcon, { backgroundColor: complete ? c.acSolid : c.acSoft }]}>
                <Icon name={complete ? 'check' : 'road'} size={20} color={complete ? c.onAc : c.onAcSoft} />
              </View>
              <View style={{ flex: 1 }}>
                <T role="title">{`${L.stage} ${u + 1}`}</T>
                <T size={14} muted>{`${n}/${levels.length}`}</T>
              </View>
              <View style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}><Icon name="down" size={20} color={c.tx2} /></View>
            </Pressable>
            {isOpen ? (
              <View style={{ paddingHorizontal: SPACE.sm, paddingBottom: SPACE.sm }}>
                {levels.map((lv, i) => {
                  const stars = progress.done[lv];
                  const state = stars ? 'done' : lv === cur ? 'cur' : 'lock';
                  const prevDone = i > 0 && !!progress.done[levels[i - 1]];
                  return (
                    <Pressable
                      key={lv}
                      disabled={state === 'lock'}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: state === 'lock' }}
                      accessibilityLabel={`${L.lvl} ${lv}${stars ? `, ${t.rd.stars(stars)}` : ''}${state === 'lock' ? ', ' + L.locked : ''}`}
                      onPress={() => router.push({ pathname: '/level/[n]', params: { n: String(lv) } })}
                      style={({ pressed }) => [styles.row, { flexDirection: d.row, backgroundColor: state === 'cur' ? c.acSoft : pressed ? c.fill : 'transparent' }]}
                    >
                      <View style={styles.markerCol}>
                        <View style={[styles.lineTop, { backgroundColor: i === 0 ? 'transparent' : prevDone ? c.acSolid : c.ln }]} />
                        <View style={[styles.lineBottom, { backgroundColor: i === levels.length - 1 ? 'transparent' : state === 'done' ? c.acSolid : c.ln }]} />
                        <Pulse on={state === 'cur'}>
                          <View style={[styles.marker, state === 'done' ? { borderColor: c.acSolid, backgroundColor: c.acSolid } : state === 'cur' ? { borderColor: c.acSolid, backgroundColor: c.card } : { borderColor: c.lnStrong, backgroundColor: c.card }]}>
                            {state === 'done' ? <Icon name="check" size={16} color={c.onAc} /> : state === 'lock' ? <Icon name="lock" size={16} color={c.tx2} /> : <T size={14} weight="bold" center color={c.ac} maxScale={1.2}>{String(lv)}</T>}
                          </View>
                        </Pulse>
                      </View>
                      <View style={{ flex: 1 }}>
                        <T size={16} weight="semibold" color={state === 'lock' ? c.tx2 : c.tx}>{`${L.lvl} ${lv}`}</T>
                      </View>
                      {stars ? <Stars n={stars} label={t.rd.stars(stars)} /> : null}
                      {state !== 'lock' ? <T size={14} weight="semibold" color={state === 'cur' ? c.ac : c.tx2}>{state === 'cur' ? L.go : L.again}</T> : null}
                    </Pressable>
                  );
                })}
                {/* The unlock rule is said once per stage, not on every locked row. */}
                {levels.some((lv) => !progress.done[lv] && lv !== cur) ? (
                  <Row gap={SPACE.xs} style={{ paddingHorizontal: SPACE.xs, paddingTop: SPACE.xs }}>
                    <Icon name="lock" size={16} color={c.tx2} />
                    <View style={{ flex: 1 }}><T size={14} muted>{L.locked}</T></View>
                  </Row>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },
  stageHead: { alignItems: 'center', gap: SPACE.md, padding: SPACE.md, minHeight: 64 },
  stageIcon: { width: 40, height: 40, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  row: { alignItems: 'center', gap: SPACE.md, paddingHorizontal: SPACE.xs, minHeight: 58, borderRadius: RADIUS.md },
  markerCol: { width: 36, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  lineTop: { position: 'absolute', top: 0, height: '50%', width: 2 },
  lineBottom: { position: 'absolute', bottom: 0, height: '50%', width: 2 },
  marker: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
