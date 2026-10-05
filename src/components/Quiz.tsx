import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useApp, useDir } from '@/state/AppProvider';
import type { Question, QuestionOption } from '@/data/types';
import { optionText, questionText } from '@/data/localize';
import { Media, SignImage, sourceOf } from './Media';
import { T } from './ui';
import type { TypeSize } from '@/theme/tokens';
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
  return <T content={lang === 'ar'} size={16}>{optionText(q, option, lang)}</T>;
}

/** Large, touch-friendly answer row. State is shown by colour, border and an icon, never colour alone. */
export function OptionButton({ q, option, index, state, onPress, disabled }: { q: Question; option: QuestionOption; index: number; state: OptionState; onPress?: () => void; disabled?: boolean }) {
  const { c, t, lang } = useApp();
  const d = useDir();
  const letter = t.common.letters[index] ?? String(index + 1);
  const border = state === 'selected' ? c.ac : state === 'ok' ? c.ok : state === 'bad' ? c.bad : 'transparent';
  const bg = state === 'selected' ? c.ac + '24' : state === 'ok' ? c.okbg : state === 'bad' ? c.badbg : c.fill;
  const letterBg = state === 'selected' ? c.acSolid : state === 'ok' ? c.okSolid : state === 'bad' ? c.badSolid : c.card;
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
      style={({ pressed }) => [styles.opt, { flexDirection: d.row, backgroundColor: bg, borderColor: border, opacity: state === 'dim' ? 0.45 : pressed ? 0.85 : 1 }]}
    >
      <View style={[styles.letter, { backgroundColor: letterBg }]}>
        {state === 'ok' ? <Icon name="check" size={16} color={c.onAc} /> : state === 'bad' ? <Icon name="close" size={16} color={c.onAc} /> : <T size={14} weight="semibold" center color={state === 'selected' ? c.onAc : c.tx2} style={{ lineHeight: 20 }}>{letter}</T>}
      </View>
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
    <View style={{ gap: 16 }}>
      {q.image ? <Media image={q.image} height={q.image.kind === 'sign' ? 170 : 210} /> : null}
      <QuestionText q={q} />
    </View>
  );
}

const styles = StyleSheet.create({
  opt: { alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 2, paddingHorizontal: 16, paddingVertical: 12, minHeight: 56 },
  letter: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  optImg: { borderRadius: 8, padding: 4 },
});
