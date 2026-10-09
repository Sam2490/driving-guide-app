import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useApp, useDir } from '@/state/AppProvider';
import { useStudy } from '@/state/StudyProvider';
import { Badge, ProgressBar, Row, SnugText, SourceBadge, T } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { STEPS } from '@/data/steps';
import { STEP_FEES } from '@/data/stepFees';
import { RADIUS, SPACE } from '@/theme/tokens';

/**
 * Licence steps as a vertical stepper: numbered circles joined by a line (green through finished steps), a one-line
 * summary, fee badges, details on demand, and a checkbox per step that is remembered on the phone.
 */
export function StepsSection() {
  const { t, c, lang } = useApp();
  const { learn, toggleStep } = useStudy();
  const d = useDir();
  const steps = STEPS[lang];
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const n = learn.steps.filter((i) => i < steps.length).length;
  return (
    <View style={{ gap: SPACE.sm }}>
      <SourceBadge kind="general" />
      <T muted>{t.license.prog(n, steps.length)}</T>
      <ProgressBar value={n / steps.length} label={t.license.prog(n, steps.length)} />
      <View style={{ marginTop: SPACE.xs }}>
        {steps.map((s, i) => {
          const done = learn.steps.includes(i);
          const isOpen = !!open[i];
          const lastStep = i === steps.length - 1;
          const fees = STEP_FEES[i];
          return (
            <View key={s.title} style={[styles.step, { flexDirection: d.row }]}>
              <View style={styles.rail}>
                <View style={[styles.num, { backgroundColor: done ? c.acSolid : c.card, borderColor: done ? c.acSolid : c.lnStrong }]}>
                  {done ? <Icon name="check" size={18} color={c.onAc} /> : <T size={14} weight="bold" center maxScale={1.2}>{String(i + 1)}</T>}
                </View>
                {lastStep ? null : <View style={[styles.line, { backgroundColor: done ? c.acSolid : c.ln }]} />}
              </View>
              <View style={{ flex: 1, gap: SPACE.xxs, paddingBottom: lastStep ? 0 : SPACE.lg }}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: done }}
                  accessibilityLabel={`${t.license.step(i + 1)}: ${s.title}`}
                  onPress={() => toggleStep(i)}
                  style={[styles.head, { flexDirection: d.row }]}
                >
                  <View style={{ flex: 1 }}><T role="title" color={done ? c.tx2 : c.tx}>{s.title}</T></View>
                  <View style={[styles.box, { borderColor: done ? c.acSolid : c.lnStrong, backgroundColor: done ? c.acSolid : 'transparent' }]}>
                    {done ? <Icon name="check" size={16} color={c.onAc} /> : null}
                  </View>
                </Pressable>
                <T size={16} muted numberOfLines={isOpen ? undefined : 2}>{s.body}</T>
                <Row gap={SPACE.xs} style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                  {fees?.map((f) => <Badge key={f} tone="sand" text={t.rd.fee(f)} />)}
                  <Pressable accessibilityRole="button" accessibilityState={{ expanded: isOpen }} accessibilityLabel={`${isOpen ? t.rd.less : t.rd.more}: ${s.title}`} onPress={() => setOpen({ ...open, [i]: !isOpen })} hitSlop={8} style={[styles.more, { flexDirection: d.row }]}>
                    <SnugText size={14} weight="semibold" color={c.ac}>{isOpen ? t.rd.less : t.rd.more}</SnugText>
                    <View style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}><Icon name="down" size={16} color={c.ac} /></View>
                  </Pressable>
                </Row>
              </View>
            </View>
          );
        })}
      </View>
      <T size={14} muted>{t.license.note}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  step: { gap: SPACE.sm, alignItems: 'stretch' },
  rail: { width: 36, alignItems: 'center' },
  num: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  line: { flex: 1, width: 2, marginVertical: SPACE.xxs },
  head: { alignItems: 'flex-start', gap: SPACE.sm, minHeight: 44 },
  box: { width: 26, height: 26, borderRadius: RADIUS.sm, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  more: { alignItems: 'center', gap: 2, minHeight: 32 },
});
