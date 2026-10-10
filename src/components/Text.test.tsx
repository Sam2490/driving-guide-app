import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AppProvider } from '@/state/AppProvider';
import type { Lang } from '@/data/types';
import { EmptyState, ltrNumbers, nastaliqPad, nastaliqPads, Segmented, SnugText, T } from './ui';
import { nastaliqHeadroom } from './learn/table';

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

  it('gives Urdu text headroom for tall strokes without moving it in the layout (build 32: "کیٹیگری" read "لیٹیگری")', async () => {
    await inLang('ur', <T size={14} weight="semibold" style={{ marginTop: 4 }}>کیٹیگری</T>);
    const text = screen.getByText('کیٹیگری');
    const style = StyleSheet.flatten(text.props.style);
    const lh = style.lineHeight as number;
    // Measured as drawn: text and line height grow with the system font scale (the test window reports its own).
    const k = Dimensions.get('window').fontScale || 1;
    const room = nastaliqHeadroom(14 * k, lh * k);
    // React Native splits the missing leading evenly; above the first baseline the line keeps ascent + ceil(L/2).
    const above = 1.904 * 14 * k + Math.ceil((lh * k - 2.5 * 14 * k) / 2);
    // Shaped with HarfBuzz, the semibold word's ink tops out at 2.104 em.
    expect(above).toBeLessThan(2.104 * 14 * k);
    expect(above + room.top).toBeGreaterThanOrEqual(2.104 * 14 * k);
    expect(style.paddingTop).toBe(room.top);
    expect(style.marginTop).toBe(4 - room.top);
    expect((style.paddingBottom as number) + (style.marginBottom as number)).toBe(0);
    // The headroom overlaps the element above, so it must not take its taps.
    expect(text.props.pointerEvents).toBe('none');
  });

  it('grows the headroom with the system font scale', () => {
    expect(nastaliqHeadroom(14 * 2, 29 * 2).top).toBeGreaterThan(nastaliqHeadroom(14, 29).top);
  });

  it("keeps a caller's percentage padding instead of overwriting it", async () => {
    await inLang('ur', <T size={16} style={{ paddingTop: '10%' }}>سڑک</T>);
    const style = StyleSheet.flatten(screen.getByText('سڑک').props.style);
    expect(style.paddingTop).toBe('10%');
    expect(style.marginTop).toBeUndefined();
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
