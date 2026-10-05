import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useApp, useDir } from '@/state/AppProvider';
import { QUESTIONS } from '@/data/questions';
import { currentLevel, levelCount, LEVELS_PER_STAGE, rankFor, rankProgress, stageCount, EMPTY_PROGRESS } from '@/features/levels/levels';
import { Button, Card, Dialog, IconTile, Pips, ProgressBar, Row, T } from './ui';
import { Icon } from './Icon';

const TOTAL = levelCount(QUESTIONS.length);
const STAGES = stageCount(QUESTIONS.length);

/** The level challenge: rank card, then stages with their levels on a road line. */
export function Journey() {
  const { t, c, isDark, progress, setProgress } = useApp();
  // Text and icons on a filled stage colour: dark ink on the pastel dark-mode colours, white on the deeper light-mode ones.
  const onStage = isDark ? c.bg : c.onAc;
  const d = useDir();
  const L = t.levels;
  const cur = currentLevel(progress, TOTAL);
  const [open, setOpen] = useState<Record<number, boolean>>({ [Math.floor((cur - 1) / LEVELS_PER_STAGE)]: true });
  const [ask, setAsk] = useState(false);
  const r = rankFor(progress.xp);
  const doneCount = Object.keys(progress.done).length;

  return (
    <View style={{ gap: 12 }}>
      <T size={24} weight="bold">{L.title}</T>
      <T muted>{L.sub}</T>
      <Card style={{ gap: 12 }}>
        <Row>
          <IconTile icon="road" color={c.ac} />
          <View style={{ flex: 1 }}>
            <T size={14} muted>{L.rank}</T>
            <T size={20} weight="semibold">{L.ranks[r]}</T>
          </View>
          <View style={{ alignItems: 'center' }}>
            <T size={24} weight="bold" center>{String(progress.xp)}</T>
            <T size={12} muted center>{L.xp}</T>
          </View>
        </Row>
        <ProgressBar value={rankProgress(progress.xp)} />
        <Row gap={16}>
          <Row gap={8}><Icon name="flame" size={16} color={c.tx2} /><T size={14} muted>{`${progress.streak} ${L.streak}`}</T></Row>
          <Row gap={8}><Icon name="check" size={16} color={c.tx2} /><T size={14} muted>{`${doneCount}/${TOTAL} ${L.done}`}</T></Row>
        </Row>
      </Card>

      {Array.from({ length: STAGES }, (_, u) => {
        const levels = Array.from({ length: Math.min(LEVELS_PER_STAGE, TOTAL - u * LEVELS_PER_STAGE) }, (_, i) => u * LEVELS_PER_STAGE + i + 1);
        const n = levels.filter((l) => progress.done[l]).length;
        const color = c.stage[u % c.stage.length];
        const isOpen = !!open[u];
        return (
          <View key={u} style={[styles.stage, { backgroundColor: c.card, borderColor: isOpen ? color + '66' : c.ln }]}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: isOpen }} accessibilityLabel={`${L.stage} ${u + 1}, ${n}/${levels.length}`} onPress={() => setOpen({ ...open, [u]: !isOpen })} style={[styles.stageHead, { flexDirection: d.row }]}>
              <View style={[styles.stageIcon, { backgroundColor: isOpen ? color : color + '29' }]}>
                <Icon name={n === levels.length ? 'check' : 'road'} size={20} color={isOpen ? onStage : color} />
              </View>
              <View style={{ flex: 1 }}>
                <T size={18} weight="semibold">{`${L.stage} ${u + 1}`}</T>
                <T size={14} muted>{`${n}/${levels.length}`}</T>
              </View>
              <View style={{ transform: [{ rotate: isOpen ? '-90deg' : '0deg' }] }}><Icon name="go" size={18} color={c.tx2} flip={!d.rtl} /></View>
            </Pressable>
            {isOpen ? (
              <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                {levels.map((lv, i) => {
                  const stars = progress.done[lv];
                  const state = stars ? 'done' : lv === cur ? 'cur' : 'lock';
                  const first = i === 0;
                  const last = i === levels.length - 1;
                  const lineColor = (s: string) => (s === 'done' ? c.ok + 'b3' : c.ln);
                  const prevState = i > 0 && progress.done[levels[i - 1]] ? 'done' : 'x';
                  return (
                    <Pressable
                      key={lv}
                      disabled={state === 'lock'}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: state === 'lock' }}
                      accessibilityLabel={`${L.lvl} ${lv}${state === 'lock' ? ', ' + L.locked : ''}`}
                      onPress={() => router.push({ pathname: '/level/[n]', params: { n: String(lv) } })}
                      style={({ pressed }) => [styles.row, { flexDirection: d.row, backgroundColor: state === 'cur' ? color + '17' : pressed ? c.fill : 'transparent', opacity: state === 'lock' ? 0.6 : 1 }]}
                    >
                      <View style={styles.markerCol}>
                        <View style={[styles.lineTop, { backgroundColor: first ? 'transparent' : lineColor(prevState) }]} />
                        <View style={[styles.lineBottom, { backgroundColor: last ? 'transparent' : lineColor(state) }]} />
                        <View style={[styles.marker, state === 'done' ? { borderColor: c.ok, backgroundColor: c.card } : state === 'cur' ? { borderColor: color, backgroundColor: color } : { borderColor: c.ln, backgroundColor: c.card }]}>
                          {state === 'done' ? <Icon name="check" size={16} color={c.ok} /> : state === 'lock' ? <Icon name="lock" size={16} color={c.tx2} /> : <T size={16} weight="bold" center color={onStage}>{String(lv)}</T>}
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <T size={16} weight="semibold">{`${L.lvl} ${lv}`}</T>
                      </View>
                      {stars ? <Pips n={stars} max={3} color={c.ok} /> : null}
                      {state !== 'lock' ? <T size={14} weight="semibold" color={state === 'cur' ? color : c.tx2}>{state === 'cur' ? L.go : L.again}</T> : null}
                    </Pressable>
                  );
                })}
                {/* The unlock rule is said once per stage, not on every locked row. */}
                {levels.some((lv) => !progress.done[lv] && lv !== cur) ? (
                  <Row gap={8} style={{ paddingHorizontal: 8, paddingTop: 8 }}>
                    <Icon name="lock" size={16} color={c.tx2} />
                    <View style={{ flex: 1 }}><T size={14} muted>{L.locked}</T></View>
                  </Row>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
      {doneCount > 0 ? <Button kind="ghost" small title={L.reset} onPress={() => setAsk(true)} style={{ alignSelf: 'center', marginTop: 8 }} /> : null}
      <Dialog
        visible={ask}
        text={L.resetq}
        onClose={() => setAsk(false)}
        actions={
          <>
            <Button kind="danger" title={L.reset} onPress={() => { setProgress(EMPTY_PROGRESS); setAsk(false); }} />
            <Button kind="ghost" title={t.common.cancel} onPress={() => setAsk(false)} />
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  stageHead: { alignItems: 'center', gap: 16, padding: 16, minHeight: 64 },
  stageIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  row: { alignItems: 'center', gap: 16, paddingHorizontal: 8, minHeight: 58, borderRadius: 12 },
  markerCol: { width: 36, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  lineTop: { position: 'absolute', top: 0, height: '50%', width: 2 },
  lineBottom: { position: 'absolute', bottom: 0, height: '50%', width: 2 },
  marker: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
