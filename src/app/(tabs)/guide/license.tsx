import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useApp } from '@/state/AppProvider';
import { Button, Card, Notice, ProgressBar, Row, Screen, SourceBadge, T } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { STEPS } from '@/data/steps';
import { openAbsher } from '@/services/maps';

export default function License() {
  const { t, c, lang } = useApp();
  const steps = STEPS[lang];
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [err, setErr] = useState(false);
  const n = Object.values(done).filter(Boolean).length;
  return (
    <Screen back title={t.license.title}>
      <SourceBadge kind="general" />
      <T muted>{t.license.prog(n, steps.length)}</T>
      <ProgressBar value={n / steps.length} />
      {steps.map((s, i) => (
        <Card key={s.title} label={`${t.license.step(i + 1)}: ${s.title}`} onPress={() => setDone({ ...done, [i]: !done[i] })} accent={done[i] ? c.ok : undefined} checked={!!done[i]}>
          <Row style={{ alignItems: 'flex-start' }}>
            <View style={[styles.num, { backgroundColor: done[i] ? c.okSolid : c.fill }]} accessibilityLabel={done[i] ? '✓' : String(i + 1)}>
              {done[i] ? <Icon name="check" size={18} color={c.onAc} /> : <T weight="semibold" center>{String(i + 1)}</T>}
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <T size={18} weight="semibold">{s.title}</T>
              <T size={16} muted>{s.body}</T>
            </View>
            {/* A visible checkbox says that tapping the step ticks it. */}
            <View style={[styles.box, { borderColor: done[i] ? c.okSolid : c.tx2, backgroundColor: done[i] ? c.okSolid : 'transparent' }]}>
              {done[i] ? <Icon name="check" size={16} color={c.onAc} /> : null}
            </View>
          </Row>
        </Card>
      ))}
      <Button title={t.license.absher} icon="globe" onPress={async () => setErr(!(await openAbsher()))} />
      {err ? <Notice tone="bad" text={t.errors.generic} /> : null}
      <T size={14} muted>{t.license.note}</T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  num: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  box: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
});
