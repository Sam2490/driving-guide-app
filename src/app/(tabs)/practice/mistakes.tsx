import React, { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { useStudy } from '@/state/StudyProvider';
import { Badge, Button, Dialog, EmptyState, Screen, T } from '@/components/ui';
import { MistakeCard } from '@/components/Quiz';
import { QUESTIONS } from '@/data/questions';
import { MASTERED_AFTER, mistakeIds } from '@/features/progress/progress';
import { SPACE } from '@/theme/tokens';

const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

/** Saved mistakes from exams, levels and practice. Each leaves the list after two correct answers in a row. */
export default function Mistakes() {
  const { t } = useApp();
  const { mistakes, clearMistakes } = useStudy();
  const [ask, setAsk] = useState(false);
  const ids = useMemo(() => mistakeIds(mistakes), [mistakes]);
  const shown = ids.slice(0, 50);
  return (
    <Screen
      back
      title={t.rd.savedMistakes(ids.length)}
      footer={ids.length ? <Button title={t.rd.practiseThese(ids.length)} icon="loop" onPress={() => router.push('/drill')} /> : undefined}
    >
      {ids.length === 0 ? (
        <EmptyState icon="check" text={t.rd.noMistakes} action={<Button title={t.test.start} onPress={() => router.replace('/practice')} />} />
      ) : (
        <>
          <T muted>{t.rd.mistakesSub}</T>
          {shown.map((id) => {
            const q = BY_ID.get(id);
            if (!q) return null;
            return (
              <React.Fragment key={id}>
                {mistakes[id] > 0 ? <Badge tone="ok" icon="check" text={`${mistakes[id]}/${MASTERED_AFTER}`} /> : null}
                <MistakeCard q={q} hideYours />
              </React.Fragment>
            );
          })}
          <Button kind="tertiary" title={t.rd.clearMistakes} icon="trash" onPress={() => setAsk(true)} style={{ marginTop: SPACE.md }} />
        </>
      )}
      <Dialog
        visible={ask}
        text={t.rd.clearAsk}
        onClose={() => setAsk(false)}
        actions={
          <>
            <Button kind="secondary" title={t.common.cancel} onPress={() => setAsk(false)} />
            <Button kind="destructive" title={t.rd.clearMistakes} onPress={() => { clearMistakes(); setAsk(false); }} />
          </>
        }
      />
    </Screen>
  );
}
