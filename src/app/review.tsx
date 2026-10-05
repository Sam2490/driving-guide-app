import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { useExam } from '@/state/ExamProvider';
import { Button, Card, EmptyState, Row, Screen, Segmented, T } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { Media } from '@/components/Media';
import { OptionContent, QuestionText } from '@/components/Quiz';
import { mistakes } from '@/features/quiz/engine';

export default function Review() {
  const { t, c } = useApp();
  const { examDone } = useExam();
  const [filter, setFilter] = useState(0);
  if (!examDone) return <Screen back tabSpace={false}><Button title={t.common.back} onPress={() => router.replace('/test')} /></Screen>;
  const { session } = examDone;
  const all = mistakes(session.questions, session.answers);
  // 0 = all mistakes, 1 = answered wrongly, 2 = left blank.
  const list = all.filter((q) => filter === 0 || (filter === 1) === (session.answers[q.id] !== undefined));
  return (
    <Screen back title={`${t.test.mistakesTitle} (${all.length})`} tabSpace={false}>
      <Segmented options={t.ux.reviewFilter} value={filter} onChange={setFilter} />
      {list.length === 0 ? <EmptyState text={t.common.noResults} /> : null}
      {list.map((q) => {
        const yours = q.options.find((o) => o.id === session.answers[q.id]);
        const right = q.options.find((o) => o.id === q.correctAnswerId)!;
        const n = session.questions.indexOf(q) + 1;
        return (
          <Card key={q.id} style={{ gap: 12 }}>
            <T size={14} muted>{t.test.qOf(n, session.questions.length)}</T>
            {q.image ? <Media image={q.image} height={130} /> : null}
            <QuestionText q={q} size={18} />
            <View style={{ backgroundColor: c.badbg, borderRadius: 12, padding: 12, gap: 8 }}>
              <Row gap={8}><Icon name="close" size={16} color={c.bad} /><T size={14} weight="semibold" color={c.bad}>{t.test.yours}</T></Row>
              {yours ? <OptionContent q={q} option={yours} size={64} /> : <T size={16} muted>{t.test.notAnswered}</T>}
            </View>
            <View style={{ backgroundColor: c.okbg, borderRadius: 12, padding: 12, gap: 8 }}>
              <Row gap={8}><Icon name="check" size={16} color={c.ok} /><T size={14} weight="semibold" color={c.ok}>{t.test.correct}</T></Row>
              <OptionContent q={q} option={right} size={64} />
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
