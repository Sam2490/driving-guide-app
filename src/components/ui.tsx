import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { useApp, useDir } from '@/state/AppProvider';
import { LATIN_FONT, type Weight } from '@/theme/fonts';
import { MAX_CONTENT_WIDTH, RADIUS, SPACE, TOUCH, type TypeSize } from '@/theme/tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Icon, type IconName } from './Icon';
import { LANGUAGES } from '@/i18n';

export const TAB_BAR_SPACE = 104;

type TProps = {
  children: React.ReactNode;
  /** A step of the type scale (theme/tokens TYPE). */
  size?: TypeSize;
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
  /** Use the heading size (24) instead of display (28) for long root titles. */
  compactTitle?: boolean;
};

/** Safe-area screen with an optional header and a back button that points the right way. */
export function Screen({ title, contentTitle, back, onBack, right, children, scroll = true, tabSpace = true, contentStyle, compactTitle }: ScreenProps) {
  const { c, t } = useApp();
  const insets = useSafeAreaInsets();
  const d = useDir();
  const header = (title || back || right) && (
    <View style={[styles.header, { flexDirection: d.row }]}>
      {back ? (
        <IconButton icon="go" flip={!d.rtl ? false : true} label={t.common.back} onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))} />
      ) : null}
      <View style={{ flex: 1 }}>{title ? <T size={back ? 20 : compactTitle ? 24 : 28} weight="bold" role="header" numberOfLines={2} content={contentTitle}>{title}</T> : null}</View>
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

export function Card({ children, style, onPress, label, accent, checked }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; label?: string; accent?: string; checked?: boolean }) {
  const { c } = useApp();
  const base = [styles.card, { backgroundColor: c.card, borderColor: accent ?? c.ln }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable accessibilityRole={checked === undefined ? 'button' : 'checkbox'} accessibilityLabel={label} accessibilityState={checked === undefined ? undefined : { checked }} onPress={onPress} style={({ pressed }) => [...base, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
}

type BtnProps = { title: string; onPress: () => void; kind?: 'primary' | 'ghost' | 'danger' | 'ok'; icon?: IconName; disabled?: boolean; style?: StyleProp<ViewStyle>; small?: boolean };

export function Button({ title, onPress, kind = 'primary', icon, disabled, style, small }: BtnProps) {
  const { c } = useApp();
  const bg = disabled ? 'transparent' : kind === 'primary' ? c.acSolid : kind === 'danger' ? c.badSolid : kind === 'ok' ? c.okSolid : c.fill;
  const fg = disabled ? c.tx2 : kind === 'ghost' ? c.ac : c.onAc;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      // Disabled = outlined and muted (not just faded), so it reads as "not yet" rather than a rendering glitch.
      style={({ pressed }) => [styles.btn, small && styles.btnSmall, { backgroundColor: bg, borderWidth: 1, borderColor: disabled ? c.ln : 'transparent', borderStyle: disabled ? 'dashed' : 'solid', opacity: pressed ? 0.85 : 1 }, style]}
    >
      <Row gap={8} style={{ justifyContent: 'center' }}>
        {icon ? <Icon name={icon} size={20} color={fg} /> : null}
        <T size={small ? 16 : 18} weight="semibold" color={fg} center>{title}</T>
      </Row>
    </Pressable>
  );
}

/** A filter chip when it has `onPress` (44 px touch target), otherwise a compact label chip. */
export function Chip({ label, on, onPress }: { label: string; on?: boolean; onPress?: () => void }) {
  const { c } = useApp();
  if (!onPress) {
    return (
      <View style={[styles.chip, styles.chipStatic, { backgroundColor: c.fill }]}>
        <T size={14}>{label}</T>
      </View>
    );
  }
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: !!on }} onPress={onPress} style={({ pressed }) => [styles.chip, { backgroundColor: on ? c.acSolid : c.fill, opacity: pressed ? 0.85 : 1 }]}>
      <T size={14} weight={on ? 'semibold' : 'regular'} color={on ? c.onAc : c.tx}>{label}</T>
    </Pressable>
  );
}

export function Segmented({ options, value, onChange }: { options: string[]; value: number; onChange: (i: number) => void }) {
  const { c } = useApp();
  const d = useDir();
  return (
    <View accessibilityRole="tablist" style={[styles.seg, { backgroundColor: c.fill, borderColor: c.ln, flexDirection: d.row }]}>
      {options.map((o, i) => (
        <Pressable key={o} accessibilityRole="tab" accessibilityLabel={o} accessibilityState={{ selected: value === i }} onPress={() => onChange(i)} style={[styles.segBtn, value === i && { backgroundColor: c.card, borderColor: c.ln, borderWidth: 1 }]}>
          <T size={16} weight="semibold" center color={value === i ? c.tx : c.tx2}>{o}</T>
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
      {/* Keep the label inside the ring: the hole is about 70% of the ring, so fit the text to ~60% of it. */}
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
        maxFontSizeMultiplier={1}
        style={{ width: size * 0.6, textAlign: 'center', fontFamily: font('bold'), fontSize: Math.min(size / 5, (size * 0.6) / (Math.max(3, label.length) * 0.5)), color: c.tx }}
      >
        {label}
      </Text>
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
        style={{ flex: 1, fontFamily: font('regular', true), fontSize: 16, color: c.tx, textAlign: d.align, paddingVertical: 12 }}
      />
    </View>
  );
}

export function Notice({ text, tone = 'info' }: { text: string; tone?: 'info' | 'ok' | 'bad' }) {
  const { c } = useApp();
  const color = tone === 'ok' ? c.ok : tone === 'bad' ? c.bad : c.tx2;
  return (
    <Row gap={12} style={[styles.notice, { backgroundColor: tone === 'bad' ? c.badbg : tone === 'ok' ? c.okbg : c.fill }]}>
      <Icon name={tone === 'bad' ? 'alert' : 'info'} size={18} color={color} />
      <View style={{ flex: 1 }}><T size={14} color={tone === 'info' ? c.tx2 : color}>{text}</T></View>
    </Row>
  );
}

export function SourceBadge({ kind }: { kind: 'official' | 'general' }) {
  const { c, t } = useApp();
  const d = useDir();
  const color = kind === 'official' ? c.ok : c.tx2;
  // Sits at the reading start: right in Arabic and Urdu, left otherwise.
  return (
    <Row gap={8} style={{ alignSelf: d.start }}>
      <Icon name={kind === 'official' ? 'check' : 'info'} size={16} color={color} />
      <T size={14} color={color}>{kind === 'official' ? t.common.official : t.common.general}</T>
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
    <View style={{ alignItems: 'center', paddingVertical: 40, gap: 16 }}>
      <Icon name="search" size={36} color={c.tx2} />
      <T muted center>{text}</T>
      {action}
    </View>
  );
}

export function Dialog({ visible, text, title, actions, onClose, icon }: { visible: boolean; title?: string; text: string; actions: React.ReactNode; onClose: () => void; icon?: IconName }) {
  const { c, t } = useApp();
  const reduce = useReducedMotion();
  return (
    <Modal visible={visible} transparent animationType={reduce ? 'none' : 'fade'} onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={[styles.scrim, { backgroundColor: c.scrim }]} onPress={onClose} accessibilityRole="button" accessibilityLabel={t.common.close}>
        <Pressable style={[styles.dialog, { backgroundColor: c.card, borderColor: c.ln }]} onPress={() => {}} accessible={false} accessibilityViewIsModal>
          {icon ? <View style={{ alignSelf: 'center', marginBottom: SPACE.sm }}><IconTile icon={icon} color={c.ac} /></View> : null}
          {title ? <T size={20} weight="bold" center>{title}</T> : null}
          <T center style={{ marginVertical: 12 }}>{text}</T>
          <View style={{ gap: 12 }}>{actions}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Bottom-sheet style list picker (replaces the web <select>). */
export function PickerSheet({ visible, title, items, value, onPick, onClose }: { visible: boolean; title: string; items: { value: string; label: string }[]; value: string; onPick: (v: string) => void; onClose: () => void }) {
  const { c, t } = useApp();
  const [q, setQ] = React.useState('');
  // Long lists (cities) get a search field.
  const searchable = items.length > 15;
  const shown = searchable && q.trim() ? items.filter((it) => !it.value || it.label.toLowerCase().includes(q.trim().toLowerCase())) : items;
  const close = () => {
    setQ('');
    onClose();
  };
  const insets = useSafeAreaInsets();
  const d = useDir();
  const reduce = useReducedMotion();
  return (
    <Modal visible={visible} transparent animationType={reduce ? 'none' : 'slide'} onRequestClose={close} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: c.scrim }} onPress={close} accessibilityRole="button" accessibilityLabel={t.common.close} />
      <View accessibilityViewIsModal style={[styles.sheet, { backgroundColor: c.card, paddingBottom: SPACE.md + insets.bottom, gap: SPACE.xs }]}>
        <T size={18} weight="bold">{title}</T>
        {searchable ? <SearchBox value={q} onChange={setQ} placeholder={t.common.search} /> : null}
        <ScrollView style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled">
          {shown.map((it) => (
            <Pressable key={it.value || '_all'} accessibilityRole="button" accessibilityLabel={it.label} accessibilityState={{ selected: it.value === value }} onPress={() => { onPick(it.value); close(); }} style={[styles.sheetRow, { flexDirection: d.row, backgroundColor: it.value === value ? c.fill : 'transparent' }]}>
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
    <View style={{ gap: 12, marginTop: 16 }}>
      <T size={20} weight="bold" role="header">{title}</T>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // Header and content share one centred column, capped on tablets and large phones.
  header: { alignItems: 'center', gap: SPACE.sm, paddingHorizontal: SPACE.lg, paddingTop: SPACE.sm, paddingBottom: SPACE.xs, minHeight: 56, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  content: { paddingHorizontal: SPACE.lg, paddingTop: SPACE.xs, gap: SPACE.sm, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  iconBtn: { width: TOUCH, height: TOUCH, borderRadius: TOUCH / 2, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: RADIUS.lg, padding: SPACE.md, borderWidth: 1 },
  btn: { minHeight: 52, borderRadius: RADIUS.lg, paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm, justifyContent: 'center' },
  btnSmall: { minHeight: TOUCH, borderRadius: RADIUS.md, paddingVertical: SPACE.xs },
  chip: { minHeight: TOUCH, paddingHorizontal: SPACE.md, paddingVertical: SPACE.xs, borderRadius: RADIUS.pill, justifyContent: 'center' },
  chipStatic: { minHeight: 32, paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xxs },
  seg: { padding: SPACE.xxs, borderRadius: RADIUS.lg, borderWidth: 1, gap: SPACE.xxs },
  segBtn: { flex: 1, minHeight: TOUCH, borderRadius: RADIUS.md, justifyContent: 'center', paddingHorizontal: SPACE.xs },
  search: { alignItems: 'center', gap: SPACE.xs, borderRadius: RADIUS.md, borderWidth: 1, paddingHorizontal: SPACE.sm, minHeight: 48 },
  notice: { padding: SPACE.sm, borderRadius: RADIUS.md, alignItems: 'flex-start' },
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACE.xl },
  dialog: { width: '100%', maxWidth: 360, borderRadius: RADIUS.xl, padding: SPACE.xl, borderWidth: 1 },
  sheet: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACE.xl },
  sheetRow: { alignItems: 'center', minHeight: 48, paddingHorizontal: SPACE.sm, borderRadius: RADIUS.md },
});

/** Tinted square behind a feature icon. One size everywhere (44), 36 for compact rows. */
export function IconTile({ icon, color, compact }: { icon: IconName; color: string; compact?: boolean }) {
  const size = compact ? 36 : TOUCH;
  return (
    <View style={{ width: size, height: size, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', backgroundColor: color + '29' }}>
      <Icon name={icon} size={compact ? 20 : 24} color={color} />
    </View>
  );
}

/** Shows the current language and opens Settings; language must never hide behind an icon in a five-language app. */
export function LanguagePill() {
  const { c, t, lang } = useApp();
  const d = useDir();
  const name = LANGUAGES.find((l) => l.id === lang)?.name ?? lang;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t.settings.language}: ${name}`}
      onPress={() => router.push('/settings')}
      hitSlop={4}
      style={({ pressed }) => [{ flexDirection: d.row, alignItems: 'center', gap: SPACE.xxs, minHeight: TOUCH, paddingHorizontal: SPACE.sm, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: c.ln, backgroundColor: c.fill, opacity: pressed ? 0.7 : 1 }]}
    >
      <Icon name="globe" size={18} color={c.tx} />
      <T size={14} weight="semibold">{name}</T>
    </Pressable>
  );
}
