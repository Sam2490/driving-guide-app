import React from 'react';
import { StyleSheet } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AppProvider } from '@/state/AppProvider';
import { Button } from './ui';

jest.mock('expo-font', () => ({ loadAsync: jest.fn(() => Promise.resolve()), isLoaded: () => true }));

test('a button label spans the full button and never gets a measured width (no clipped words on Android)', async () => {
  await render(
    <AppProvider initial={{ settings: { lang: 'ar', theme: 'light' } }}>
      <Button title="احجز عبر أبشر" icon="globe" onPress={() => {}} />
    </AppProvider>,
  );
  const label = screen.getByText('احجز عبر أبشر');
  const style = StyleSheet.flatten(label.props.style);
  expect(style.minWidth).toBeUndefined();
  expect(style.width).toBeUndefined();
  // Room for the icon is kept on both sides, so the text stays centred; two lines at most.
  expect(style.paddingHorizontal).toBe(28);
  expect(label.props.numberOfLines).toBe(2);
});

test('the icon sits beside the text as drawn: at the reading start, right of the text in Arabic', async () => {
  await render(
    <AppProvider initial={{ settings: { lang: 'ar', theme: 'light' } }}>
      <Button title="فتح أبشر" icon="globe" onPress={() => {}} />
    </AppProvider>,
  );
  const label = screen.getByText('فتح أبشر');
  const slot = () => StyleSheet.flatten(screen.getByTestId('button-icon').props.style);
  expect(slot().opacity).toBe(0); // hidden until the text reports its width
  await act(async () => {
    fireEvent(label, 'textLayout', { nativeEvent: { lines: [{ width: 30 }, { width: 45 }] } });
  });
  const s = slot();
  expect(s.opacity).toBe(1);
  // Half the widest line (22.5) plus the icon and its gap (28), measured from the centre.
  expect(s.right).toBe('50%');
  expect(s.marginRight).toBe(-50.5);
});
