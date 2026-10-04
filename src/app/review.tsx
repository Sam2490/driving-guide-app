import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { useExam } from '@/state/ExamProvider';
import { Button, Card, Row, Screen, T } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { Media } from '@/components/Media';
import { OptionContent, QuestionText } from '@/components/Quiz';
import { mistakes } from '@/features/quiz/engine';

export default function Review() {
  const { t, c } = useApp();
  const { examDone } = useExam();
  if (!examDone) return <Screen back tabSpace={false}><Button title={t.common.back} onPress={() => router.replace('/test')} /></Screen>;
  const { session } = examDone;
  const list = mistakes(session.questions, session.answers);
  return (
    <Screen back title={`${t.test.mistakesTitle} (${list.length})`} tabSpace={false}>
      {list.map((q) => {
        const yours = q.options.find((o) => o.id === session.answers[q.id]);
        const right = q.options.find((o) => o.id === q.correctAnswerId)!;
        const n = session.questions.indexOf(q) + 1;
        return (
          <Card key={q.id} style={{ gap: 10 }}>
            <T size={13} muted>{t.test.qOf(n, session.questions.length)}</T>
            {q.image ? <Media image={q.image} height={130} /> : null}
            <QuestionText q={q} size={17} />
            <View style={{ backgroundColor: c.badbg, borderRadius: 12, padding: 10, gap: 6 }}>
              <Row gap={6}><Icon name="close" size={16} color={c.bad} /><T size={14} weight="semibold" color={c.bad}>{t.test.yours}</T></Row>
              {yours ? <OptionContent q={q} option={yours} size={64} /> : <T size={15} muted>{t.test.notAnswered}</T>}
            </View>
            <View style={{ backgroundColor: c.okbg, borderRadius: 12, padding: 10, gap: 6 }}>
              <Row gap={6}><Icon name="check" size={16} color={c.ok} /><T size={14} weight="semibold" color={c.ok}>{t.test.correct}</T></Row>
              <OptionContent q={q} option={right} size={64} />
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
