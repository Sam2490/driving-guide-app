import React from 'react';
import { StyleSheet } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AppProvider } from '@/state/AppProvider';
import type { Lang } from '@/data/types';
import { EmptyState, ltrNumbers, nastaliqPad, nastaliqPads, Segmented, SnugText, T } from './ui';

jest.mock('expo-font', () => ({ loadAsync: jest.fn(() => Promise.resolve()), isLoaded: () => true }));

const inLang = (lang: Lang, node: React.ReactElement) => render(<AppProvider initial={{ settings: { lang, theme: 'light' } }}>{node}</AppProvider>);

describe('Urdu text keeps room for Nastaliq overhangs (QA_1 U1: "کی" drawn as "لی")', () => {
  it('pads Urdu text on both sides, more at the line start (right), in proportion to its size', async () => {
    await inLang('ur', <T size={16}>کرنا، موبائل فون کا استعمال</T>);
    const style = StyleSheet.flatten(screen.getByText('کرنا، موبائل فون کا استعمال').props.style);
    // A line-initial ک reaches about 0.6 em past the start edge ("کرنا" read "لرنا" with 0.3 em, re-audit P1-1).
    expect(style.paddingRight).toBe(nastaliqPads(16).start);
    expect(style.paddingLeft).toBe(nastaliqPads(16).end);
    expect(nastaliqPads(16).start).toBeGreaterThanOrEqual(Math.ceil(16 * 0.6));
    expect(nastaliqPad(16)).toBe(nastaliqPads(16).start + nastaliqPads(16).end);
  });

  it("keeps a caller's wider side padding (CenteredLabel's icon slot) on both sides (review)", async () => {
    await inLang('ur', <T size={16} style={{ paddingHorizontal: 30 }}>دوبارہ کوشش کریں</T>);
    const style = StyleSheet.flatten(screen.getByText('دوبارہ کوشش کریں').props.style);
    expect(style.paddingRight).toBe(30);
    expect(style.paddingLeft).toBe(30);
  });

  it('leaves other languages and Latin runs inside Urdu unpadded', async () => {
    await inLang('ar', <T size={16}>منعطف</T>);
    const ar = StyleSheet.flatten(screen.getByText('منعطف').props.style);
    expect(ar.paddingHorizontal ?? ar.paddingRight ?? ar.paddingLeft).toBeUndefined();
  });

  it('adds the padding to the width SnugText measures, so the label does not wrap', async () => {
    await inLang('ur', <SnugText size={14}>2 دن مسلسل</SnugText>);
    const [probe, shown] = screen.getAllByText('2 دن مسلسل', { includeHiddenElements: true });
    await act(async () => {
      fireEvent(probe, 'textLayout', { nativeEvent: { lines: [{ width: 60 }] } });
    });
    // 60 drawn + 4 slack + padding on both sides.
    expect(StyleSheet.flatten(shown.props.style).width).toBe(60 + 4 + nastaliqPad(14));
  });
});

describe('Segmented counts (QA_1 U3: "Unanswere / d (15)")', () => {
  const RN = jest.requireActual('react-native');
  const withFontScale = (fontScale: number) => jest.spyOn(RN, 'useWindowDimensions').mockReturnValue({ width: 360, height: 800, scale: 3, fontScale });
  afterEach(() => jest.restoreAllMocks());

  it('puts each count on its own line and keeps the label on one line at normal text sizes', async () => {
    withFontScale(1);
    await inLang('en', <Segmented options={['All', 'Incorrect', 'Unanswered']} counts={[25, 10, 15]} value={0} onChange={() => {}} />);
    const label = screen.getByText('Unanswered');
    expect(label.props.numberOfLines).toBe(1);
    expect(screen.getByText('15')).toBeTruthy();
    expect(screen.queryByText(/Unanswered \(/)).toBeNull();
    expect(screen.getByRole('tab', { name: 'Unanswered, 15' })).toBeTruthy();
  });

  it('lets the label wrap between words at large text sizes instead of cutting it off', async () => {
    withFontScale(1.3);
    await inLang('en', <Segmented options={['All', 'Incorrect', 'Unanswered']} counts={[25, 10, 15]} value={0} onChange={() => {}} />);
    expect(screen.getByText('Unanswered').props.numberOfLines).toBe(2);
  });
});

describe('numbers in right-to-left text (QA_1 U4)', () => {
  it('isolates ranges, dates and percentages so they read left to right', () => {
    expect(ltrNumbers('غرامة 150–300 ريال')).toBe('غرامة ⁦150–300⁩ ريال');
    expect(ltrNumbers('100% أو %75')).toBe('⁦100%⁩ أو ⁦75%⁩');
    expect(ltrNumbers('(2026-10-03)')).toBe('(⁦2026-10-03⁩)');
    expect(ltrNumbers('20 متراً · 00:23')).toBe('20 متراً · 00:23');
  });

  it('applies only to Arabic and Urdu', async () => {
    await inLang('ar', <T>غرامة 150–300 ريال</T>);
    expect(screen.getByText('غرامة ⁦150–300⁩ ريال')).toBeTruthy();
    await inLang('en', <T>150–300 SAR</T>);
    expect(screen.getByText('150–300 SAR')).toBeTruthy();
  });
});

it('the empty-state action spans the column instead of wrapping in a narrow box (QA_1 U5)', async () => {
  await inLang('ar', <EmptyState text="لا توجد أخطاء" action={<T>ابدأ الاختبار</T>} />);
  const inner = StyleSheet.flatten(screen.getByTestId('empty-action').props.children.props.style);
  expect(inner.width).toBe('100%');
  expect(inner.maxWidth).toBe(320);
});

it('isolates guide-table ranges that carry a zero-width break, and a range followed by % (review)', () => {
  expect(ltrNumbers('5–​10')).toBe('⁦5–​10⁩');
  expect(ltrNumbers('10–20% أو أكثر')).toBe('⁦10–20%⁩ أو أكثر');
});
