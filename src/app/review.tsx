import React, { useState } from 'react';
import { router } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { useExam } from '@/state/ExamProvider';
import { useStudy } from '@/state/StudyProvider';
import { Button, EmptyState, Screen, Segmented } from '@/components/ui';
import { MistakeCard } from '@/components/Quiz';
import { mistakes } from '@/features/quiz/engine';

/** Mistakes from the exam just finished. They are also saved to the Practice tab's mistakes list. */
export default function Review() {
  const { t } = useApp();
  const { examDone } = useExam();
  const { mistakes: book } = useStudy();
  const [filter, setFilter] = useState(0);
  if (!examDone) {
    return (
      <Screen back tabSpace={false}>
        <EmptyState text={t.rd.noMistakes} icon="check" action={<Button title={t.rd.backToPractice} onPress={() => router.replace('/practice')} />} />
      </Screen>
    );
  }
  const { session } = examDone;
  const all = mistakes(session.questions, session.answers);
  // 0 = all mistakes, 1 = answered wrongly, 2 = left blank.
  const list = all.filter((q) => filter === 0 || (filter === 1) === (session.answers[q.id] !== undefined));
  const saved = Object.keys(book).length;
  return (
    <Screen
      back
      title={`${t.test.mistakesTitle} (${all.length})`}
      tabSpace={false}
      footer={saved ? <Button title={t.rd.practiseThese(saved)} icon="loop" onPress={() => router.push('/drill')} /> : undefined}
    >
      <Segmented options={t.ux.reviewFilter} value={filter} onChange={setFilter} />
      {list.length === 0 ? <EmptyState text={t.common.noResults} /> : null}
      {list.map((q) => (
        <MistakeCard key={q.id} q={q} answer={session.answers[q.id]} label={t.test.qOf(session.questions.indexOf(q) + 1, session.questions.length)} />
      ))}
    </Screen>
  );
}
