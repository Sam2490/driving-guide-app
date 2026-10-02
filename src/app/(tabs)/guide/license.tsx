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
        <Card key={s.title} label={`${t.license.step(i + 1)}: ${s.title}`} onPress={() => setDone({ ...done, [i]: !done[i] })} accent={done[i] ? c.ok : undefined}>
          <Row style={{ alignItems: 'flex-start' }}>
            <View style={[styles.num, { backgroundColor: done[i] ? c.ok : c.fill }]} accessibilityLabel={done[i] ? '✓' : String(i + 1)}>
              {done[i] ? <Icon name="check" size={18} color="#fff" /> : <T weight="semibold" center>{String(i + 1)}</T>}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <T size={17} weight="semibold">{s.title}</T>
              <T size={15} muted>{s.body}</T>
            </View>
          </Row>
        </Card>
      ))}
      <Button title={t.license.absher} icon="globe" onPress={async () => setErr(!(await openAbsher()))} />
      {err ? <Notice tone="bad" text={t.errors.generic} /> : null}
      <T size={13} muted>{t.license.note}</T>
    </Screen>
  );
}

const styles = StyleSheet.create({ num: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' } });
