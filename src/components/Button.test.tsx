import React from 'react';
import { StyleSheet } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AppProvider } from '@/state/AppProvider';
import { Button } from './ui';

jest.mock('expo-font', () => ({ loadAsync: jest.fn(() => Promise.resolve()), isLoaded: () => true }));

test('a button label that Android wraps is widened so it stays on one line beside its icon', async () => {
  await render(
    <AppProvider initial={{ settings: { lang: 'ar', theme: 'light' } }}>
      <Button title="ابدأ الاختبار" icon="clock" onPress={() => {}} />
    </AppProvider>,
  );
  const label = screen.getByText('ابدأ الاختبار');
  let row = label.parent;
  while (row && !row.props.onLayout) row = row.parent;
  await act(async () => {
    fireEvent(row!, 'layout', { nativeEvent: { layout: { width: 300, height: 30, x: 0, y: 0 } } });
    fireEvent(label, 'textLayout', { nativeEvent: { lines: [{ width: 30 }, { width: 45 }] } });
  });
  // 30 + 45 + half the font size (room for the space), within the 300 - 28 px left beside the icon.
  expect(StyleSheet.flatten(screen.getByText('ابدأ الاختبار').props.style).minWidth).toBe(84);
});
