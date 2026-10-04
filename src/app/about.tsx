import React from 'react';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { Button, Card, IconButton, Row, Screen, Section, T } from '@/components/ui';
import { openPrivacyPolicy } from '@/services/maps';
import { Icon } from '@/components/Icon';

export default function About() {
  const { t, c } = useApp();
  const A = t.about;
  const list = (items: string[]) =>
    items.map((x) => (
      <Row key={x} gap={8} style={{ alignItems: 'flex-start' }}>
        <Icon name="check" size={16} color={c.tx2} />
        <T size={14} muted style={{ flex: 1 }}>{x}</T>
      </Row>
    ));
  return (
    <Screen title={A.title} tabSpace={false} right={<IconButton icon="close" label={t.common.close} onPress={() => router.back()} />}>
      <Card><T>{A.intro}</T></Card>
      <Section title={A.privacyT}>
        <Card style={{ gap: 12 }}>
          <T size={14} muted>{A.privacy}</T>
          <Button small kind="ghost" icon="globe" title={A.privacyLink} onPress={() => openPrivacyPolicy()} />
        </Card>
      </Section>
      <Section title={A.sourcesT}><Card style={{ gap: 8 }}>{list(A.sources)}</Card></Section>
      <Section title={A.creditsT}><Card style={{ gap: 8 }}>{list(A.credits)}</Card></Section>
      <T size={13} muted center>{A.version(Constants.expoConfig?.version ?? '1.0.0')}</T>
    </Screen>
  );
}
