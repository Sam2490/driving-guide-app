import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp, useDir } from '@/state/AppProvider';
import * as Font from 'expo-font';
import { fontFor, lineHeightFor, loadFontsFor } from '@/theme/fonts';
import { LANGUAGES } from '@/i18n';
import type { Lang } from '@/data/types';
import { RADIUS, SPACE, TYPE } from '@/theme/tokens';
import { Icon } from './Icon';

/** The five languages, each in its own script with its English name, as a radio list. */
export function LanguageList({ value, onPick, pending }: { value: Lang; onPick: (l: Lang) => void; pending?: Lang | null }) {
  const { c } = useApp();
  const d = useDir();
  // A name drawn in a script font that is still loading is measured with the fallback font and then clipped
  // ("বাং" for "বাংলা"). Names use the system font until their own font is ready, and the row is re-created
  // (new key) once it is, so it is measured again.
  const [, setReady] = React.useState(0);
  React.useEffect(() => {
    let alive = true;
    // Every name is drawn in its own script font, so all five are loaded here (not only the current language's);
    // otherwise unloaded names fall back to the system font and the rows look uneven.
    for (const l of LANGUAGES) loadFontsFor(l.id).then(() => alive && setReady((n) => n + 1));
    return () => {
      alive = false;
    };
  }, []);
  return (
    <View accessibilityRole="radiogroup" style={{ gap: SPACE.xxs }}>
      {LANGUAGES.map((l) => {
        const on = l.id === value;
        const family = fontFor(l.id, on ? 'semibold' : 'regular');
        const loaded = Font.isLoaded(family);
        return (
          <Pressable
            key={`${l.id}-${loaded ? 'font' : 'system'}`}
            accessibilityRole="radio"
            accessibilityState={{ selected: on, busy: pending === l.id }}
            accessibilityLabel={l.id === 'en' ? l.name : `${l.name}, ${l.english}`}
            // iOS reads each language's own name with that language's voice.
            accessibilityLanguage={l.id}
            onPress={() => onPick(l.id)}
            style={({ pressed }) => [styles.row, { flexDirection: d.row, backgroundColor: on ? c.acSoft : 'transparent', borderColor: on ? c.acSolid : 'transparent', opacity: pressed ? 0.85 : 1 }]}
          >
            <View style={{ flex: 1, flexDirection: d.row, alignItems: 'baseline', gap: SPACE.xs, flexWrap: 'wrap' }}>
              <Text style={{ fontFamily: loaded ? family : undefined, fontWeight: loaded ? undefined : on ? '600' : '400', fontSize: TYPE.bodyLg, lineHeight: lineHeightFor(l.id, TYPE.bodyLg), color: on ? c.onAcSoft : c.tx }}>{l.name}</Text>
              {l.id !== 'en' ? <Text style={{ fontFamily: fontFor('en', 'regular'), fontSize: TYPE.label, color: c.tx2 }}>{l.english}</Text> : null}
            </View>
            {pending === l.id ? <ActivityIndicator color={c.ac} /> : on ? <Icon name="check" size={20} color={c.onAcSoft} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({ row: { alignItems: 'center', minHeight: 56, paddingHorizontal: SPACE.md, borderRadius: RADIUS.md, borderWidth: 1, gap: SPACE.sm } });
