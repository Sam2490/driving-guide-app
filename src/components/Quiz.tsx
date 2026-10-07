import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useApp, useDir } from '@/state/AppProvider';
import type { Question, QuestionOption } from '@/data/types';
import { optionText, questionText } from '@/data/localize';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MOTION, RADIUS, SPACE, type TypeSize } from '@/theme/tokens';
import { Media, SignImage, sourceOf } from './Media';
import { Card, Row, T } from './ui';
import { Icon } from './Icon';

export type OptionState = 'idle' | 'selected' | 'ok' | 'bad' | 'dim';

/** An answer's text in the chosen language, or its picture. */
export function OptionContent({ q, option, size = 84 }: { q: Question; option: QuestionOption; size?: number }) {
  const { lang, c } = useApp();
  const d = useDir();
  if (option.image) {
    const src = sourceOf(option.image);
    return (
      <View style={[styles.optImg, { alignSelf: d.start, backgroundColor: c.paper }]}>
        {option.image.kind === 'sign' ? <SignImage id={option.image.id} size={size} /> : src ? <Image source={src} style={{ width: size * 1.4, height: size }} contentFit="contain" /> : null}
      </View>
    );
  }
  return <T content={lang === 'ar'} size={17}>{optionText(q, option, lang)}</T>;
}

/**
 * Tall answer row (min 56). State shows by border, tint and an icon, never by colour alone. Selecting gives a
 * light haptic and a 120 ms highlight; a revealed correct answer pops its check (skipped with reduced motion).
 */
export function OptionButton({ q, option, index, state, onPress, disabled }: { q: Question; option: QuestionOption; index: number; state: OptionState; onPress?: () => void; disabled?: boolean }) {
  const { c, t, lang } = useApp();
  const d = useDir();
  const reduce = useReducedMotion();
  const pop = React.useState(() => new Animated.Value(1))[0];
  React.useEffect(() => {
    if (reduce || (state !== 'ok' && state !== 'selected')) return;
    pop.setValue(0.8);
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  }, [state, reduce, pop]);
  const letter = t.common.letters[index] ?? String(index + 1);
  const border = state === 'selected' ? c.acSolid : state === 'ok' ? c.ok : state === 'bad' ? c.bad : c.ln;
  const bg = state === 'selected' ? c.acSoft : state === 'ok' ? c.okbg : state === 'bad' ? c.badbg : c.card;
  const letterBg = state === 'selected' ? c.acSolid : state === 'ok' ? c.okSolid : state === 'bad' ? c.badSolid : c.fill;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: state === 'selected' || state === 'ok', disabled }}
      accessibilityLabel={`${letter}. ${optionText(q, option, lang) ?? ''}`}
      disabled={disabled}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => [styles.opt, { flexDirection: d.row, backgroundColor: pressed && state === 'idle' ? c.fill : bg, borderColor: border, borderWidth: state === 'idle' || state === 'dim' ? 1 : 2, opacity: state === 'dim' ? 0.5 : 1 }]}
    >
      <Animated.View style={[styles.letter, { backgroundColor: letterBg, transform: [{ scale: pop }] }]}>
        {state === 'ok' ? <Icon name="check" size={16} color={c.onAc} /> : state === 'bad' ? <Icon name="close" size={16} color={c.onAc} /> : <T size={14} weight="semibold" center color={state === 'selected' ? c.onAc : c.tx2} maxScale={1.2} style={{ lineHeight: 20 }}>{letter}</T>}
      </Animated.View>
      <View style={{ flex: 1 }}><OptionContent q={q} option={option} /></View>
    </Pressable>
  );
}

export function QuestionText({ q, size = 20 }: { q: Question; size?: TypeSize }) {
  const { lang } = useApp();
  return <T content={lang === 'ar'} size={size} weight="semibold">{questionText(q, lang)}</T>;
}

export function QuestionBody({ q }: { q: Question }) {
  return (
    <View style={{ gap: SPACE.md }}>
      {q.image ? <Media image={q.image} height={q.image.kind === 'sign' ? 170 : 210} /> : null}
      <QuestionText q={q} />
    </View>
  );
}

/** Slides the question in from the reading direction when it changes (fade only with reduced motion). */
export function QuestionSlide({ id, children }: { id: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const d = useDir();
  const x = React.useState(() => new Animated.Value(0))[0];
  const o = React.useState(() => new Animated.Value(1))[0];
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    x.setValue(reduce ? 0 : d.rtl ? -24 : 24);
    o.setValue(0.4);
    Animated.parallel([
      Animated.timing(x, { toValue: 0, duration: MOTION.quick, useNativeDriver: true }),
      Animated.timing(o, { toValue: 1, duration: MOTION.quick, useNativeDriver: true }),
    ]).start();
  }, [id, reduce, d.rtl, x, o]);
  return <Animated.View style={{ gap: SPACE.sm, opacity: o, transform: [{ translateX: x }] }}>{children}</Animated.View>;
}

/** A missed question with "your answer" (red marker) and the correct one (green marker + check). */
export function MistakeCard({ q, answer, label, hideYours }: { q: Question; answer?: string; label?: string; hideYours?: boolean }) {
  const { t, c } = useApp();
  const d = useDir();
  // The coloured marker sits on the reading-start edge.
  const side = d.rtl ? { borderRightWidth: 4 } : { borderLeftWidth: 4 };
  const yours = q.options.find((o) => o.id === answer);
  const right = q.options.find((o) => o.id === q.correctAnswerId)!;
  return (
    <Card style={{ gap: SPACE.sm }}>
      {label ? <T size={14} muted>{label}</T> : null}
      {q.image ? <Media image={q.image} height={130} /> : null}
      <QuestionText q={q} size={18} />
      {hideYours ? null : (
        <View style={[styles.answer, side, { backgroundColor: c.badbg, borderColor: c.bad }]}>
          <Row gap={SPACE.xs}><Icon name="close" size={16} color={c.bad} /><T size={14} weight="semibold" color={c.bad}>{t.test.yours}</T></Row>
          {yours ? <OptionContent q={q} option={yours} size={64} /> : <T size={16} muted>{t.test.notAnswered}</T>}
        </View>
      )}
      <View style={[styles.answer, side, { backgroundColor: c.okbg, borderColor: c.ok }]}>
        <Row gap={SPACE.xs}><Icon name="check" size={16} color={c.ok} /><T size={14} weight="semibold" color={c.ok}>{t.test.correct}</T></Row>
        <OptionContent q={q} option={right} size={64} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  opt: { alignItems: 'center', gap: SPACE.sm, borderRadius: RADIUS.md, paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm, minHeight: 56 },
  letter: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  optImg: { borderRadius: RADIUS.sm, padding: SPACE.xxs },
  answer: { borderRadius: RADIUS.md, padding: SPACE.sm, gap: SPACE.xs },
});
