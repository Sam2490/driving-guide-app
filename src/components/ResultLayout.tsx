import React, { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { useApp } from '@/state/AppProvider';
import { RADIUS, SPACE } from '@/theme/tokens';
import { Icon } from './Icon';
import { Ring, Row, Screen, StatTile, T } from './ui';

export type ResultTile = { label: string; value?: string; color?: string; node?: React.ReactNode };

/**
 * One result layout for the mock exam, levels and mistakes practice: verdict first, then the score fitted inside
 * the ring, three equal tiles, and the next step. The verdict and score are announced once on arrival.
 */
export function ResultLayout({ title, onBack, passed, verdict, verdictSub, ring, tiles, children, actions, footnote }: {
  title: string;
  onBack: () => void;
  passed: boolean;
  verdict: string;
  verdictSub?: string;
  ring: { value: number; label: string; sub?: string; a11y: string };
  tiles: ResultTile[];
  children?: React.ReactNode;
  actions: React.ReactNode;
  footnote?: string;
}) {
  const { c } = useApp();
  const tone = passed ? c.ok : c.bad;
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility?.(`${verdict}. ${ring.a11y}`);
    // Once per result screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Screen back title={title} onBack={onBack} tabSpace={false}>
      <View style={[styles.verdict, { backgroundColor: passed ? c.okbg : c.badbg }]} accessibilityRole="summary">
        <Row gap={SPACE.xs} style={{ justifyContent: 'center' }}>
          <Icon name={passed ? 'check' : 'close'} size={24} color={tone} />
          <T role="h1" color={tone} center maxScale={1.4}>{verdict}</T>
        </Row>
        {verdictSub ? <T size={14} center color={tone}>{verdictSub}</T> : null}
      </View>
      <Ring value={ring.value} size={164} color={tone} label={ring.label} sub={ring.sub} a11y={ring.a11y} animate />
      <Row gap={SPACE.sm} style={{ alignItems: 'stretch' }}>
        {tiles.map((x) => (
          <StatTile key={x.label} value={x.value} label={x.label} color={x.color}>{x.node}</StatTile>
        ))}
      </Row>
      {children}
      <View style={{ gap: SPACE.sm, marginTop: SPACE.xs }}>{actions}</View>
      {footnote ? <T size={14} muted>{footnote}</T> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  verdict: { borderRadius: RADIUS.lg, paddingVertical: SPACE.md, paddingHorizontal: SPACE.md, gap: SPACE.xxs },
});
