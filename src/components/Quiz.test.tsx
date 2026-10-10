import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AppProvider } from '@/state/AppProvider';
import type { Lang } from '@/data/types';
import { QUESTIONS } from '@/data/questions';
import { OptionButton, OptionContent, QuestionBody } from './Quiz';
import { Dialog, ProgressBar, Segmented } from './ui';

jest.mock('expo-font', () => ({ loadAsync: jest.fn(() => Promise.resolve()), isLoaded: () => true }));

const inLang = (lang: Lang, node: React.ReactElement) => render(<AppProvider initial={{ settings: { lang, theme: 'light' } }}>{node}</AppProvider>);

const pictureQuestion = QUESTIONS.find((q) => q.options.every((o) => o.image && !o.text))!;
const textQuestion = QUESTIONS.find((q) => q.options.every((o) => o.text) && q.options.length === 4)!;
const signQuestion = QUESTIONS.find((q) => q.image?.kind === 'sign')!;

describe('screen-reader names and states in the quiz (accessibility review)', () => {
  it('a picture-only answer is named as one, not just its letter (A11Y-02)', async () => {
    expect(pictureQuestion).toBeTruthy();
    await inLang('en', <OptionButton q={pictureQuestion} option={pictureQuestion.options[0]} index={0} state="idle" />);
    expect(screen.getByRole('radio').props.accessibilityLabel).toBe('A. Picture answer');
  });

  it('after Check, the right answer and a wrong pick say so, and only the pick is selected (A11Y-05)', async () => {
    const [right, wrong] = [textQuestion.options.find((o) => o.id === textQuestion.correctAnswerId)!, textQuestion.options.find((o) => o.id !== textQuestion.correctAnswerId)!];
    await inLang(
      'en',
      <>
        <OptionButton q={textQuestion} option={right} index={0} state="ok" picked={false} />
        <OptionButton q={textQuestion} option={wrong} index={1} state="bad" picked />
      </>,
    );
    const [ok, bad] = screen.getAllByRole('radio');
    expect(ok.props.accessibilityLabel).toMatch(/, Correct answer$/);
    expect(ok.props.accessibilityState.selected).toBe(false);
    expect(bad.props.accessibilityLabel).toMatch(/, Incorrect$/);
    expect(bad.props.accessibilityState.selected).toBe(true);
  });

  it('a question picture has a neutral name that does not give the answer away (A11Y-01)', async () => {
    await inLang('en', <QuestionBody q={signQuestion} />);
    expect(screen.getByLabelText('Picture of a traffic sign')).toBeTruthy();
  });

  it('a picture answer shown on its own (correct-answer strip) is named', async () => {
    await inLang('ar', <OptionContent q={pictureQuestion} option={pictureQuestion.options[0]} labelled />);
    expect(screen.getByLabelText('إجابة مصوّرة')).toBeTruthy();
  });
});

describe('shared components (accessibility review)', () => {
  it('a dialog keeps its text and buttons reachable: the close scrim is a sibling, not a parent (A11Y-03)', async () => {
    await inLang('en', <Dialog visible text="End the exam?" onClose={() => {}} actions={null} />);
    type Node = { props?: Record<string, unknown>; children?: (Node | string)[] | null };
    const find = (n: Node | Node[] | null, pred: (x: Node) => boolean): Node | undefined => {
      if (!n) return undefined;
      if (Array.isArray(n)) return n.map((x) => find(x, pred)).find(Boolean);
      if (pred(n)) return n;
      return (n.children ?? []).filter((x): x is Node => typeof x !== 'string').map((x) => find(x, pred)).find(Boolean);
    };
    const tree = screen.toJSON() as unknown as Node;
    const scrim = find(tree, (x) => x.props?.accessibilityLabel === 'Close');
    expect(scrim).toBeTruthy();
    // The scrim button holds nothing; the message sits in the modal view next to it.
    expect(scrim!.children ?? []).toHaveLength(0);
    const modal = find(tree, (x) => x.props?.accessibilityViewIsModal === true);
    expect(find(modal ?? null, (x) => (x.children ?? []).includes('End the exam?'))).toBeTruthy();
  });

  it('progress bars are accessibility elements on iOS too (A11Y-10)', async () => {
    await inLang('en', <ProgressBar value={0.5} label="3 / 30" />);
    expect(screen.getByRole('progressbar').props.accessible).toBe(true);
  });

  it('segment labels stay on one line and shrink instead of breaking a word (two-pane Learn at 600 pt)', async () => {
    const RN = jest.requireActual<typeof import('react-native')>('react-native');
    jest.spyOn(RN, 'useWindowDimensions').mockReturnValue({ width: 600, height: 900, scale: 2, fontScale: 1 });
    await inLang('ar', <Segmented options={['العلامات', 'الدليل', 'الخطوات']} value={0} onChange={() => {}} />);
    expect(screen.getByText('العلامات').props.numberOfLines).toBe(1);
    jest.restoreAllMocks();
  });
});
