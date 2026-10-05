import React from 'react';
import { Text } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';
import { AppProvider, useApp } from './AppProvider';
import { storage } from '@/services/storage';

let finishUrdu: () => void = () => {};
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => new Promise<void>((r) => (finishUrdu = r))),
}));

function Probe({ onReady }: { onReady: (a: ReturnType<typeof useApp>) => void }) {
  const app = useApp();
  onReady(app);
  return <Text>{app.lang}</Text>;
}

describe('language switching', () => {
  it('applies only the latest choice when an earlier font load finishes later (audit N-03)', async () => {
    const save = jest.spyOn(storage, 'saveSettings').mockResolvedValue();
    let app!: ReturnType<typeof useApp>;
    await render(
      <AppProvider initial={{ settings: { lang: 'ar', theme: 'dark' } }}>
        <Probe onReady={(a) => (app = a)} />
      </AppProvider>,
    );
    await act(async () => app.setLang('ur')); // Urdu fonts still loading
    await act(async () => app.setLang('en')); // English needs no extra fonts
    expect(screen.getByText('en')).toBeTruthy();
    await act(async () => finishUrdu());
    expect(screen.getByText('en')).toBeTruthy();
    expect(save).toHaveBeenLastCalledWith({ lang: 'en', theme: 'dark' });
    expect(save).toHaveBeenCalledTimes(1);
    save.mockRestore();
  });
});
