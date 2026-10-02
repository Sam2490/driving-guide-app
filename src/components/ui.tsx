import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { useApp, useDir } from '@/state/AppProvider';
import { LATIN_FONT, type Weight } from '@/theme/fonts';
import { Icon, type IconName } from './Icon';

export const TAB_BAR_SPACE = 104;

type TProps = {
  children: React.ReactNode;
  size?: number;
  weight?: Weight;
  color?: string;
  muted?: boolean;
  content?: boolean;
  /** Latin text (e.g. English sign names) shown inside Arabic or Urdu screens. */
  latin?: boolean;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  role?: 'header';
};

/** Text that picks the right font, line height and alignment for the current language. */
export function T({ children, size = 16, weight = 'regular', color, muted, content, latin, center, style, numberOfLines, role }: TProps) {
  const { c, font, lh } = useApp();
  const d = useDir();
  return (
    <Text
      accessibilityRole={role}
      numberOfLines={numberOfLines}
      style={[{ fontFamily: latin ? LATIN_FONT[weight] : font(weight, content), fontSize: size, lineHeight: latin ? Math.round(size * 1.45) : lh(size, content), color: color ?? (muted ? c.tx2 : c.tx), textAlign: center ? 'center' : content ? 'right' : d.align, writingDirection: content ? 'rtl' : d.writing }, style]}
    >
      {children}
    </Text>
  );
}

export function Row({ children, style, gap = 12 }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  const d = useDir();
  return <View style={[{ flexDirection: d.row, alignItems: 'center', gap }, style]}>{children}</View>;
}

type ScreenProps = {
  title?: string;
  /** Title is Arabic content (school or topic name). */
  contentTitle?: boolean;
  back?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
  tabSpace?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Safe-area screen with an optional header and a back button that points the right way. */
export function Screen({ title, contentTitle, back, onBack, right, children, scroll = true, tabSpace = true, contentStyle }: ScreenProps) {
  const { c, t } = useApp();
  const insets = useSafeAreaInsets();
  const d = useDir();
  const header = (title || back || right) && (
    <View style={[styles.header, { flexDirection: d.row }]}>
      {back ? (
        <IconButton icon="go" flip={!d.rtl ? false : true} label={t.common.back} onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))} />
      ) : null}
      <View style={{ flex: 1 }}>{title ? <T size={back ? 19 : 28} weight="bold" role="header" numberOfLines={2} content={contentTitle}>{title}</T> : null}</View>
      {right}
    </View>
  );
  const pad = { paddingBottom: (tabSpace ? TAB_BAR_SPACE : 24) + insets.bottom };
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      {header}
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, pad, contentStyle]} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      ) : (
        <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
      )}
    </View>
  );
}

export function IconButton({ icon, label, onPress, flip, size = 22 }: { icon: IconName; label: string; onPress: () => void; flip?: boolean; size?: number }) {
  const { c } = useApp();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={8} style={({ pressed }) => [styles.iconBtn, { backgroundColor: c.fill, borderColor: c.ln, opacity: pressed ? 0.7 : 1 }]}>
      <Icon name={icon} size={size} color={c.tx} flip={flip} />
    </Pressable>
  );
}

export function Card({ children, style, onPress, label, accent }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; label?: string; accent?: string }) {
  const { c } = useApp();
  const base = [styles.card, { backgroundColor: c.card, borderColor: accent ?? c.ln }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [...base, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
}

type BtnProps = { title: string; onPress: () => void; kind?: 'primary' | 'ghost' | 'danger' | 'ok'; icon?: IconName; disabled?: boolean; style?: StyleProp<ViewStyle>; small?: boolean };

export function Button({ title, onPress, kind = 'primary', icon, disabled, style, small }: BtnProps) {
  const { c } = useApp();
  const bg = kind === 'primary' ? c.ac : kind === 'danger' ? c.bad : kind === 'ok' ? c.ok : c.fill;
  const fg = kind === 'ghost' ? c.ac : c.onAc;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.btn, small && styles.btnSmall, { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 }, style]}
    >
      <Row gap={8} style={{ justifyContent: 'center' }}>
        {icon ? <Icon name={icon} size={20} color={fg} /> : null}
        <T size={small ? 15 : 17} weight="semibold" color={fg} center>{title}</T>
      </Row>
    </Pressable>
  );
}

export function Chip({ label, on, onPress }: { label: string; on?: boolean; onPress?: () => void }) {
  const { c } = useApp();
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!on }} onPress={onPress} disabled={!onPress} style={[styles.chip, { backgroundColor: on ? c.ac : c.fill }]}>
      <T size={14} weight={on ? 'semibold' : 'regular'} color={on ? c.onAc : c.tx}>{label}</T>
    </Pressable>
  );
}

export function Segmented({ options, value, onChange }: { options: string[]; value: number; onChange: (i: number) => void }) {
  const { c, isDark } = useApp();
  const d = useDir();
  return (
    <View accessibilityRole="tablist" style={[styles.seg, { backgroundColor: c.fill, borderColor: c.ln, flexDirection: d.row }]}>
      {options.map((o, i) => (
        <Pressable key={o} accessibilityRole="tab" accessibilityState={{ selected: value === i }} onPress={() => onChange(i)} style={[styles.segBtn, value === i && { backgroundColor: isDark ? c.card : '#fff', borderColor: c.ln, borderWidth: 1 }]}>
          <T size={15} weight="semibold" center color={value === i ? c.tx : c.tx2}>{o}</T>
        </Pressable>
      ))}
    </View>
  );
}

export function ProgressBar({ value, color, height = 6 }: { value: number; color?: string; height?: number }) {
  const { c } = useApp();
  const d = useDir();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }} style={{ height, borderRadius: height, backgroundColor: c.fill, overflow: 'hidden', alignItems: d.start }}>
      <View style={{ width: `${pct * 100}%`, height: '100%', borderRadius: height, backgroundColor: color ?? c.ac }} />
    </View>
  );
}

export function Ring({ value, size = 140, color, label }: { value: number; size?: number; color?: string; label: string }) {
  const { c, font } = useApp();
  const r = 46;
  const circ = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={label}>
      <Svg width={size} height={size} viewBox="0 0 120 120" style={StyleSheet.absoluteFill}>
        <Circle cx={60} cy={60} r={r} fill="none" stroke={c.fill} strokeWidth={9} />
        <Circle cx={60} cy={60} r={r} fill="none" stroke={color ?? c.ac} strokeWidth={9} strokeLinecap="round" strokeDasharray={`${circ}`} strokeDashoffset={circ * (1 - Math.max(0, Math.min(1, value)))} transform="rotate(-90 60 60)" />
      </Svg>
      <Text style={{ fontFamily: font('bold'), fontSize: size / 5, color: c.tx }}>{label}</Text>
    </View>
  );
}

export function Pips({ n, max, color }: { n: number; max: number; color: string }) {
  const { c } = useApp();
  const d = useDir();
  return (
    <View style={{ flexDirection: d.row, gap: 4 }} accessibilityLabel={`${n}/${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i < n ? color : c.fill, borderWidth: i < n ? 0 : 1, borderColor: c.ln }} />
      ))}
    </View>
  );
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (s: string) => void; placeholder: string }) {
  const { c, font } = useApp();
  const d = useDir();
  return (
    <View style={[styles.search, { backgroundColor: c.fill, borderColor: c.ln, flexDirection: d.row }]}>
      <Icon name="search" size={20} color={c.tx2} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={c.tx2}
        accessibilityLabel={placeholder}
        maxLength={60}
        autoCorrect={false}
        style={{ flex: 1, fontFamily: font('regular', true), fontSize: 16, color: c.tx, textAlign: d.align, paddingVertical: 10 }}
      />
    </View>
  );
}

export function Notice({ text, tone = 'info' }: { text: string; tone?: 'info' | 'ok' | 'bad' }) {
  const { c } = useApp();
  const color = tone === 'ok' ? c.ok : tone === 'bad' ? c.bad : c.tx2;
  return (
    <Row gap={10} style={[styles.notice, { backgroundColor: tone === 'bad' ? c.badbg : tone === 'ok' ? c.okbg : c.fill }]}>
      <Icon name={tone === 'bad' ? 'alert' : 'info'} size={18} color={color} />
      <View style={{ flex: 1 }}><T size={14} color={tone === 'info' ? c.tx2 : color}>{text}</T></View>
    </Row>
  );
}

export function SourceBadge({ kind }: { kind: 'official' | 'general' }) {
  const { c, t } = useApp();
  const color = kind === 'official' ? c.ok : c.tx2;
  return (
    <Row gap={6} style={{ alignSelf: 'flex-start' }}>
      <Icon name={kind === 'official' ? 'check' : 'info'} size={16} color={color} />
      <T size={13} color={color}>{kind === 'official' ? t.common.official : t.common.general}</T>
    </Row>
  );
}

export function Loading() {
  const { c } = useApp();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}>
      <ActivityIndicator color={c.ac} />
    </View>
  );
}

export function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  const { c } = useApp();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, gap: 14 }}>
      <Icon name="search" size={36} color={c.tx2} />
      <T muted center>{text}</T>
      {action}
    </View>
  );
}

export function Dialog({ visible, text, title, actions, onClose }: { visible: boolean; title?: string; text: string; actions: React.ReactNode; onClose: () => void }) {
  const { c } = useApp();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={[styles.scrim, { backgroundColor: c.scrim }]} onPress={onClose} accessibilityLabel="close">
        <Pressable style={[styles.dialog, { backgroundColor: c.card, borderColor: c.ln }]} onPress={() => {}}>
          {title ? <T size={19} weight="bold" center>{title}</T> : null}
          <T center style={{ marginVertical: 10 }}>{text}</T>
          <View style={{ gap: 10 }}>{actions}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Bottom-sheet style list picker (replaces the web <select>). */
export function PickerSheet({ visible, title, items, value, onPick, onClose }: { visible: boolean; title: string; items: { value: string; label: string }[]; value: string; onPick: (v: string) => void; onClose: () => void }) {
  const { c } = useApp();
  const insets = useSafeAreaInsets();
  const d = useDir();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: c.scrim }} onPress={onClose} accessibilityLabel="close" />
      <View style={[styles.sheet, { backgroundColor: c.card, paddingBottom: 16 + insets.bottom }]}>
        <T size={18} weight="bold" style={{ marginBottom: 8 }}>{title}</T>
        <ScrollView style={{ maxHeight: 420 }}>
          {items.map((it) => (
            <Pressable key={it.value || '_all'} accessibilityRole="button" accessibilityState={{ selected: it.value === value }} onPress={() => { onPick(it.value); onClose(); }} style={[styles.sheetRow, { flexDirection: d.row, backgroundColor: it.value === value ? c.fill : 'transparent' }]}>
              <View style={{ flex: 1 }}><T weight={it.value === value ? 'semibold' : 'regular'} color={it.value === value ? c.ac : c.tx}>{it.label}</T></View>
              {it.value === value ? <Icon name="check" size={18} color={c.ac} /> : null}
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10, marginTop: 18 }}>
      <T size={20} weight="bold" role="header">{title}</T>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8, minHeight: 56 },
  content: { paddingHorizontal: 20, paddingTop: 6, gap: 12 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 20, padding: 16, borderWidth: 1 },
  btn: { minHeight: 52, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 12, justifyContent: 'center' },
  btnSmall: { minHeight: 44, borderRadius: 14, paddingVertical: 8 },
  chip: { minHeight: 36, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, justifyContent: 'center' },
  seg: { padding: 4, borderRadius: 16, borderWidth: 1, gap: 4 },
  segBtn: { flex: 1, minHeight: 44, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 6 },
  search: { alignItems: 'center', gap: 8, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, minHeight: 48 },
  notice: { padding: 12, borderRadius: 14, alignItems: 'flex-start' },
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 360, borderRadius: 24, padding: 22, borderWidth: 1 },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  sheetRow: { alignItems: 'center', minHeight: 48, paddingHorizontal: 12, borderRadius: 12 },
});
