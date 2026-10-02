import type { Lang } from '@/data/types';

export const FONT_FILES = {
  IBMPlexSansArabic_400Regular: require('@expo-google-fonts/ibm-plex-sans-arabic/400Regular/IBMPlexSansArabic_400Regular.ttf'),
  IBMPlexSansArabic_500Medium: require('@expo-google-fonts/ibm-plex-sans-arabic/500Medium/IBMPlexSansArabic_500Medium.ttf'),
  IBMPlexSansArabic_600SemiBold: require('@expo-google-fonts/ibm-plex-sans-arabic/600SemiBold/IBMPlexSansArabic_600SemiBold.ttf'),
  IBMPlexSansArabic_700Bold: require('@expo-google-fonts/ibm-plex-sans-arabic/700Bold/IBMPlexSansArabic_700Bold.ttf'),
  Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
  Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
  Inter_600SemiBold: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
  Inter_700Bold: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
  NotoNastaliqUrdu_400Regular: require('@expo-google-fonts/noto-nastaliq-urdu/400Regular/NotoNastaliqUrdu_400Regular.ttf'),
  NotoNastaliqUrdu_600SemiBold: require('@expo-google-fonts/noto-nastaliq-urdu/600SemiBold/NotoNastaliqUrdu_600SemiBold.ttf'),
};

export type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

const ARABIC = { regular: 'IBMPlexSansArabic_400Regular', medium: 'IBMPlexSansArabic_500Medium', semibold: 'IBMPlexSansArabic_600SemiBold', bold: 'IBMPlexSansArabic_700Bold' };
export const LATIN_FONT: Record<Weight, string> = { regular: 'Inter_400Regular', medium: 'Inter_500Medium', semibold: 'Inter_600SemiBold', bold: 'Inter_700Bold' };
const URDU = { regular: 'NotoNastaliqUrdu_400Regular', medium: 'NotoNastaliqUrdu_400Regular', semibold: 'NotoNastaliqUrdu_600SemiBold', bold: 'NotoNastaliqUrdu_600SemiBold' };

/**
 * UI text follows the chosen language; `content` text (questions, guide, school names) is Arabic
 * and always uses IBM Plex Sans Arabic.
 */
export function fontFor(lang: Lang, weight: Weight, content = false): string {
  if (content || lang === 'ar') return ARABIC[weight];
  return lang === 'ur' ? URDU[weight] : LATIN_FONT[weight];
}

/** Nastaliq needs extra line height so tall letters are not clipped. */
export function lineHeightFor(lang: Lang, size: number, content = false): number {
  if (!content && lang === 'ur') return Math.round(size * 2.1);
  return Math.round(size * 1.55);
}
