import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { useExam } from '@/state/ExamProvider';
import { Button, Card, Notice, Row, Screen, Segmented, T } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { Journey } from '@/components/Journey';
import { QUESTIONS } from '@/data/questions';
import { answeredCount, DEFAULT_EXAM, startExam } from '@/features/quiz/engine';

export default function TestHome() {
  const { t, c } = useApp();
  const { exam, setExam, setExamDone } = useExam();
  const [mode, setMode] = useState(0);
  const begin = () => {
    setExamDone(null);
    setExam(startExam(QUESTIONS, DEFAULT_EXAM));
    router.push('/exam');
  };
  return (
    <Screen title={t.test.title}>
      <Segmented options={t.test.modes} value={mode} onChange={setMode} />
      {mode === 0 ? (
        <View style={{ gap: 12 }}>
          <Card style={{ gap: 10 }}>
            <Row>
              <View style={{ width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: c.ac + '24' }}><Icon name="exam" color={c.ac} /></View>
              <View style={{ flex: 1 }}>
                <T size={20} weight="bold">{t.test.exTitle}</T>
                <T size={14} muted>{t.test.exSub(DEFAULT_EXAM.count, DEFAULT_EXAM.minutes, DEFAULT_EXAM.passMark)}</T>
              </View>
            </Row>
            {t.test.rules.map((r) => (
              <Row key={r} gap={8} style={{ alignItems: 'flex-start' }}>
                <Icon name="check" size={16} color={c.ok} />
                <View style={{ flex: 1 }}><T size={14} muted>{r}</T></View>
              </Row>
            ))}
          </Card>
          {exam ? (
            <>
              <Button title={`${t.test.resume} · ${t.test.answered(answeredCount(exam), exam.questions.length)}`} onPress={() => router.push('/exam')} />
              <Button kind="ghost" title={t.test.again} onPress={begin} />
            </>
          ) : (
            <Button title={t.test.start} icon="clock" onPress={begin} />
          )}
          <Notice text={t.test.disclaimer} />
        </View>
      ) : (
        <Journey />
      )}
    </Screen>
  );
}
