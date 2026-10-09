import React from 'react';
import { StyleSheet } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AppProvider } from '@/state/AppProvider';
import type { Lang } from '@/data/types';
import { EmptyState, ltrNumbers, nastaliqPad, Segmented, SnugText, T } from './ui';

jest.mock('expo-font', () => ({ loadAsync: jest.fn(() => Promise.resolve()), isLoaded: () => true }));

const inLang = (lang: Lang, node: React.ReactElement) => render(<AppProvider initial={{ settings: { lang, theme: 'light' } }}>{node}</AppProvider>);

describe('Urdu text keeps room for Nastaliq overhangs (QA_1 U1: "کی" drawn as "لی")', () => {
  it('pads Urdu text on both sides, in proportion to its size', async () => {
    await inLang('ur', <T size={16}>کی سائیڈ پر</T>);
    const style = StyleSheet.flatten(screen.getByText('کی سائیڈ پر').props.style);
    expect(style.paddingHorizontal).toBe(nastaliqPad(16));
    expect(nastaliqPad(16)).toBeGreaterThanOrEqual(4);
  });

  it('leaves other languages and Latin runs inside Urdu unpadded', async () => {
    await inLang('ar', <T size={16}>منعطف</T>);
    expect(StyleSheet.flatten(screen.getByText('منعطف').props.style).paddingHorizontal).toBeUndefined();
  });

  it('adds the padding to the width SnugText measures, so the label does not wrap', async () => {
    await inLang('ur', <SnugText size={14}>2 دن مسلسل</SnugText>);
    const [probe, shown] = screen.getAllByText('2 دن مسلسل', { includeHiddenElements: true });
    await act(async () => {
      fireEvent(probe, 'textLayout', { nativeEvent: { lines: [{ width: 60 }] } });
    });
    // 60 drawn + 4 slack + padding on both sides.
    expect(StyleSheet.flatten(shown.props.style).width).toBe(60 + 4 + 2 * nastaliqPad(14));
  });
});

describe('Segmented counts (QA_1 U3: "Unanswere / d (15)")', () => {
  it('puts each count on its own line and keeps the label on one line', async () => {
    await inLang('en', <Segmented options={['All', 'Incorrect', 'Unanswered']} counts={[25, 10, 15]} value={0} onChange={() => {}} />);
    const label = screen.getByText('Unanswered');
    expect(label.props.numberOfLines).toBe(1);
    expect(screen.getByText('15')).toBeTruthy();
    expect(screen.queryByText(/Unanswered \(/)).toBeNull();
    expect(screen.getByRole('tab', { name: 'Unanswered, 15' })).toBeTruthy();
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
