import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/state/AppProvider';
import type { Question, QuestionOption } from '@/data/types';
import { Media, SignImage, sourceOf } from './Media';
import { Image } from 'expo-image';
import { T } from './ui';
import { Icon } from './Icon';

export type OptionState = 'idle' | 'selected' | 'ok' | 'bad' | 'dim';

export function OptionContent({ option, size = 84 }: { option: QuestionOption; size?: number }) {
  if (option.image) {
    const src = sourceOf(option.image);
    return (
      <View style={styles.optImg}>
        {option.image.kind === 'sign' ? <SignImage id={option.image.id} size={size} /> : src ? <Image source={src} style={{ width: size * 1.4, height: size }} contentFit="contain" /> : null}
      </View>
    );
  }
  return <T content size={16.5}>{option.text}</T>;
}

/** Large, touch-friendly answer row. State is shown by colour, border and an icon, never colour alone. */
export function OptionButton({ option, letter, state, onPress, disabled }: { option: QuestionOption; letter: string; state: OptionState; onPress?: () => void; disabled?: boolean }) {
  const { c } = useApp();
  const border = state === 'selected' ? c.ac : state === 'ok' ? c.ok : state === 'bad' ? c.bad : 'transparent';
  const bg = state === 'selected' ? c.ac + '24' : state === 'ok' ? c.okbg : state === 'bad' ? c.badbg : c.fill;
  const letterBg = state === 'selected' ? c.ac : state === 'ok' ? c.ok : state === 'bad' ? c.bad : c.card;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: state === 'selected' || state === 'ok', disabled }}
      accessibilityLabel={`${letter}. ${option.text ?? ''}`}
      disabled={disabled}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => [styles.opt, { flexDirection: 'row-reverse', backgroundColor: bg, borderColor: border, opacity: state === 'dim' ? 0.45 : pressed ? 0.85 : 1 }]}
    >
      <View style={[styles.letter, { backgroundColor: letterBg }]}>
        {state === 'ok' ? <Icon name="check" size={16} color="#fff" /> : state === 'bad' ? <Icon name="close" size={16} color="#fff" /> : <T size={14} weight="semibold" center color={state === 'selected' ? '#fff' : c.tx2} content>{letter}</T>}
      </View>
      <View style={{ flex: 1 }}><OptionContent option={option} /></View>
    </Pressable>
  );
}

export function QuestionBody({ q }: { q: Question }) {
  return (
    <View style={{ gap: 14 }}>
      {q.image ? <Media image={q.image} height={q.image.kind === 'sign' ? 170 : 210} /> : null}
      <T content size={20} weight="semibold">{q.question}</T>
    </View>
  );
}

/** Arabic option letters; content is Arabic in every language, so letters follow the content. */
export const AR_LETTERS = ['أ', 'ب', 'ج', 'د'];

const styles = StyleSheet.create({
  opt: { alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 2, paddingHorizontal: 14, paddingVertical: 12, minHeight: 56 },
  letter: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  optImg: { backgroundColor: '#fff', borderRadius: 10, padding: 4, alignSelf: 'flex-end' },
});
