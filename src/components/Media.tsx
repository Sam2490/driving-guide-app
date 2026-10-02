import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import type { ImageRef } from '@/data/types';
import { QUESTION_IMAGES } from '@/data/questionImages';
import { SIGN_IMAGES } from '@/data/signImages';

export function sourceOf(ref: ImageRef) {
  return ref.kind === 'sign' ? SIGN_IMAGES[ref.id] : QUESTION_IMAGES[ref.key];
}

/** Question or answer picture on a white panel (sign artwork and photos are designed for white). */
export function Media({ image, height = 200, label }: { image: ImageRef; height?: number; label?: string }) {
  const src = sourceOf(image);
  if (!src) return null;
  return (
    <View style={[styles.panel, { height: height + 16 }]} accessible accessibilityRole="image" accessibilityLabel={label}>
      <Image source={src} style={{ width: '100%', height }} contentFit="contain" transition={120} />
    </View>
  );
}

export function SignImage({ id, size, label }: { id: string; size: number; label?: string }) {
  const src = SIGN_IMAGES[id];
  if (!src) return null;
  return <Image source={src} style={{ width: size, height: size }} contentFit="contain" accessibilityLabel={label} accessible={!!label} />;
}

const styles = StyleSheet.create({
  panel: { backgroundColor: '#ffffff', borderRadius: 16, padding: 8, alignItems: 'center', justifyContent: 'center' },
});
