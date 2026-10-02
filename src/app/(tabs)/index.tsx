import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useApp, useDir } from '@/state/AppProvider';
import { Button, Card, IconButton, Row, Screen, Section, SourceBadge, T } from '@/components/ui';
import { Icon, type IconName } from '@/components/Icon';
import { FEATURE } from '@/theme/colors';
import { TIPS, TIRE_RATINGS } from '@/data/tips';

const CARDS: { key: 'guide' | 'license' | 'signs' | 'schools' | 'test'; icon: IconName; href: Href }[] = [
  { key: 'test', icon: 'exam', href: '/test' },
  { key: 'guide', icon: 'book', href: '/guide' },
  { key: 'signs', icon: 'signs', href: '/signs' },
  { key: 'license', icon: 'license', href: '/guide/license' },
  { key: 'schools', icon: 'schools', href: '/schools' },
];

export default function Home() {
  const { t, c, lang } = useApp();
  const d = useDir();
  return (
    <Screen
      title={t.home.title}
      right={
        <Row gap={8}>
          <IconButton icon="info" label={t.home.about} onPress={() => router.push('/about')} />
          <IconButton icon="gear" label={t.home.settings} onPress={() => router.push('/settings')} />
        </Row>
      }
    >
      <Button title={t.home.start} icon="exam" onPress={() => router.push('/test')} />
      <View style={[styles.grid, { flexDirection: d.row }]}>
        {CARDS.map(({ key, icon, href }, i) => {
          const [title, sub] = t.home.cards[key];
          const color = FEATURE[key === 'license' ? 'license' : key];
          return (
            <Card key={key} label={title} onPress={() => router.push(href)} style={[styles.feat, i === 0 && styles.featWide]}>
              {i === 0 ? (
                <Row>
                  <View style={[styles.chp, { backgroundColor: color + '29', marginBottom: 0 }]}><Icon name={icon} size={24} color={color} /></View>
                  <View style={{ flex: 1 }}>
                    <T size={17} weight="semibold">{title}</T>
                    <T size={13} muted>{sub}</T>
                  </View>
                  <Icon name="go" size={18} color={c.tx2} flip={!d.rtl} />
                </Row>
              ) : (
                <>
                  <View style={[styles.chp, { backgroundColor: color + '29', alignSelf: d.start }]}><Icon name={icon} size={24} color={color} /></View>
                  <T size={17} weight="semibold">{title}</T>
                  <T size={13} muted>{sub}</T>
                </>
              )}
            </Card>
          );
        })}
      </View>
      <Section title={t.home.quick}>
        <SourceBadge kind="official" />
        {TIPS[lang].map((tip) => (
          <Card key={tip.title}>
            <T size={17} weight="semibold" content={lang === 'ar'}>{tip.title}</T>
            {tip.lines.map((line) => (
              <Row key={line} gap={10} style={{ alignItems: 'flex-start', marginTop: 6 }}>
                <View style={[styles.dot, { backgroundColor: FEATURE.guide }]} />
                <View style={{ flex: 1 }}><T size={15} muted content={lang === 'ar'}>{line}</T></View>
              </Row>
            ))}
          </Card>
        ))}
        <Card>
          <T size={17} weight="semibold">{t.home.tireT}</T>
          <T size={14} muted style={{ marginBottom: 10 }}>{t.home.tireP}</T>
          <View style={[styles.tires, { flexDirection: d.row }]}>
            {TIRE_RATINGS.map(([letter, kmh]) => (
              <View key={letter} style={[styles.tire, { backgroundColor: c.fill }]}>
                <T size={18} weight="bold" center>{letter}</T>
                <T size={13} muted center>{kmh}</T>
              </View>
            ))}
          </View>
        </Card>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexWrap: 'wrap', gap: 12, marginTop: 4 },
  feat: { width: '47.8%', flexGrow: 1, gap: 2, minHeight: 132 },
  featWide: { width: '100%', minHeight: 0 },
  chp: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 10 },
  tires: { flexWrap: 'wrap', gap: 8 },
  tire: { width: 64, borderRadius: 12, paddingVertical: 6 },
});
