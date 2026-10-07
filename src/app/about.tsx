import React from 'react';
import { View } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { Card, IconButton, ListRow, Row, Screen, Section, T } from '@/components/ui';
import { openPrivacyPolicy } from '@/services/maps';
import { Icon } from '@/components/Icon';
import { SPACE } from '@/theme/tokens';

export default function About() {
  const { t, c } = useApp();
  const A = t.about;
  const list = (items: string[]) =>
    items.map((x, i) => (
      <View key={x} style={{ paddingTop: i ? SPACE.sm : 0, borderTopWidth: i ? 1 : 0, borderTopColor: c.ln }}>
        <Row gap={SPACE.xs} style={{ alignItems: 'flex-start' }}>
          <Icon name="check" size={16} color={c.tx2} />
          <T size={16} muted style={{ flex: 1 }}>{x}</T>
        </Row>
      </View>
    ));
  return (
    <Screen title={A.title} tabSpace={false} right={<IconButton icon="close" label={t.common.close} onPress={() => router.back()} />}>
      <Row gap={SPACE.sm}>
        <View style={{ flex: 1 }}><T role="h3">{t.appName}</T></View>
        <T size={14} muted>{A.version(Constants.expoConfig?.version ?? '1.0.0')}</T>
      </Row>
      <Card><T>{A.intro}</T></Card>
      <Section title={A.privacyT}>
        <Card style={{ gap: SPACE.sm }}><T size={16} muted>{A.privacy}</T></Card>
        <ListRow icon="globe" title={A.privacyLink} onPress={() => openPrivacyPolicy()} />
      </Section>
      <Section title={A.sourcesT}><Card style={{ gap: SPACE.sm }}>{list(A.sources)}</Card></Section>
      <Section title={A.creditsT}><Card style={{ gap: SPACE.sm }}>{list(A.credits)}</Card></Section>
    </Screen>
  );
}
