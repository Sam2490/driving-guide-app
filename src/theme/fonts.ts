import * as Font from 'expo-font';
import type { Lang } from '@/data/types';

/** Arabic (content and UI) and Inter (English UI, numbers) are needed by everyone and load before the first screen. */
export const FONT_FILES = {
  IBMPlexSansArabic_400Regular: require('@expo-google-fonts/ibm-plex-sans-arabic/400Regular/IBMPlexSansArabic_400Regular.ttf'),
  IBMPlexSansArabic_500Medium: require('@expo-google-fonts/ibm-plex-sans-arabic/500Medium/IBMPlexSansArabic_500Medium.ttf'),
  IBMPlexSansArabic_600SemiBold: require('@expo-google-fonts/ibm-plex-sans-arabic/600SemiBold/IBMPlexSansArabic_600SemiBold.ttf'),
  IBMPlexSansArabic_700Bold: require('@expo-google-fonts/ibm-plex-sans-arabic/700Bold/IBMPlexSansArabic_700Bold.ttf'),
  Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
  Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
  Inter_600SemiBold: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
  Inter_700Bold: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
};

/**
 * Script fonts for Hindi, Bengali and Urdu (about 2.8 MB together) load only when that language is in use,
 * so most readers start the app without parsing them.
 */
const LANGUAGE_FONTS: Partial<Record<Lang, Record<string, number>>> = {
  hi: {
    NotoSansDevanagari_400Regular: require('@expo-google-fonts/noto-sans-devanagari/400Regular/NotoSansDevanagari_400Regular.ttf'),
  NotoSansDevanagari_500Medium: require('@expo-google-fonts/noto-sans-devanagari/500Medium/NotoSansDevanagari_500Medium.ttf'),
  NotoSansDevanagari_600SemiBold: require('@expo-google-fonts/noto-sans-devanagari/600SemiBold/NotoSansDevanagari_600SemiBold.ttf'),
  NotoSansDevanagari_700Bold: require('@expo-google-fonts/noto-sans-devanagari/700Bold/NotoSansDevanagari_700Bold.ttf'),
  },
  bn: {
    NotoSansBengali_400Regular: require('@expo-google-fonts/noto-sans-bengali/400Regular/NotoSansBengali_400Regular.ttf'),
  NotoSansBengali_500Medium: require('@expo-google-fonts/noto-sans-bengali/500Medium/NotoSansBengali_500Medium.ttf'),
  NotoSansBengali_600SemiBold: require('@expo-google-fonts/noto-sans-bengali/600SemiBold/NotoSansBengali_600SemiBold.ttf'),
  NotoSansBengali_700Bold: require('@expo-google-fonts/noto-sans-bengali/700Bold/NotoSansBengali_700Bold.ttf'),
  },
  ur: {
    NotoNastaliqUrdu_400Regular: require('@expo-google-fonts/noto-nastaliq-urdu/400Regular/NotoNastaliqUrdu_400Regular.ttf'),
  NotoNastaliqUrdu_600SemiBold: require('@expo-google-fonts/noto-nastaliq-urdu/600SemiBold/NotoNastaliqUrdu_600SemiBold.ttf'),
  },
};

/** Loads the script fonts a language needs (no-op for Arabic and English, and for fonts already loaded). */
export async function loadFontsFor(lang: Lang): Promise<void> {
  const fonts = LANGUAGE_FONTS[lang];
  if (!fonts) return;
  try {
    await Font.loadAsync(fonts);
  } catch {
    // Text falls back to the system font for that script; the app stays usable.
  }
}

export type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

const ARABIC = { regular: 'IBMPlexSansArabic_400Regular', medium: 'IBMPlexSansArabic_500Medium', semibold: 'IBMPlexSansArabic_600SemiBold', bold: 'IBMPlexSansArabic_700Bold' };
export const LATIN_FONT: Record<Weight, string> = { regular: 'Inter_400Regular', medium: 'Inter_500Medium', semibold: 'Inter_600SemiBold', bold: 'Inter_700Bold' };
const DEVANAGARI = { regular: 'NotoSansDevanagari_400Regular', medium: 'NotoSansDevanagari_500Medium', semibold: 'NotoSansDevanagari_600SemiBold', bold: 'NotoSansDevanagari_700Bold' };
const BENGALI = { regular: 'NotoSansBengali_400Regular', medium: 'NotoSansBengali_500Medium', semibold: 'NotoSansBengali_600SemiBold', bold: 'NotoSansBengali_700Bold' };
const URDU = { regular: 'NotoNastaliqUrdu_400Regular', medium: 'NotoNastaliqUrdu_400Regular', semibold: 'NotoNastaliqUrdu_600SemiBold', bold: 'NotoNastaliqUrdu_600SemiBold' };

/**
 * UI text follows the chosen language; `content` text (questions, guide, school names) is Arabic
 * and always uses IBM Plex Sans Arabic.
 */
export function fontFor(lang: Lang, weight: Weight, content = false): string {
  if (content || lang === 'ar') return ARABIC[weight];
  if (lang === 'ur') return URDU[weight];
  if (lang === 'hi') return DEVANAGARI[weight];
  if (lang === 'bn') return BENGALI[weight];
  return LATIN_FONT[weight];
}

/** Nastaliq needs extra line height so tall letters are not clipped. */
export function lineHeightFor(lang: Lang, size: number, content = false): number {
  if (!content && lang === 'ur') return Math.round(size * 2.1);
  if (!content && (lang === 'hi' || lang === 'bn')) return Math.round(size * 1.7);
  return Math.round(size * 1.55);
}
