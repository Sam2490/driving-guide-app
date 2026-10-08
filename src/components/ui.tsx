import React from 'react';
import { ActivityIndicator, Animated, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions, type LayoutChangeEvent, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { useApp, useDir } from '@/state/AppProvider';
import { LATIN_FONT, type Weight } from '@/theme/fonts';
import { BREAKPOINTS, ELEVATION, ICON, LAYOUT, MAX_CONTENT_WIDTH, MOTION, RADIUS, SPACE, TEXT, TOUCH, type TextRole, type TypeSize } from '@/theme/tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Icon, type IconName } from './Icon';
import { LANGUAGES } from '@/i18n';

/** Bottom padding under scrolling content. The tab bar is docked, so it no longer covers the last item. */
export const TAB_BAR_SPACE = SPACE.xl;

type TProps = {
  children: React.ReactNode;
  /** A step of the type scale (theme/tokens TYPE). Prefer `role`. */
  size?: TypeSize;
  /** A typography role; sets size and weight (both can still be overridden). */
  role?: TextRole;
  weight?: Weight;
  color?: string;
  muted?: boolean;
  content?: boolean;
  /** Latin text (e.g. English sign names) shown inside Arabic or Urdu screens. */
  latin?: boolean;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  header?: boolean;
  /** Cap on the system font-size multiplier (decorative numbers, chrome). Body text is never capped. */
  maxScale?: number;
  onTextLayout?: React.ComponentProps<typeof Text>['onTextLayout'];
  /**
   * A short label that should stay on one line (chips, badges, row labels). Android can draw a label a hair wider
   * than it measured it; instead of wrapping or cutting a letter, the text shrinks slightly (never below 80%).
   */
  fit?: boolean;
};

/** Text that picks the right font, line height and alignment for the current language. */
export function T({ children, size, role, weight, color, muted, content, latin, center, style, numberOfLines, header, maxScale, onTextLayout, fit }: TProps) {
  const { c, font, lh } = useApp();
  const d = useDir();
  const spec = role ? TEXT[role] : undefined;
  const fs = size ?? spec?.size ?? 16;
  const w = weight ?? spec?.weight ?? 'regular';
  return (
    <Text
      accessibilityRole={header ? 'header' : undefined}
      numberOfLines={fit ? 1 : numberOfLines}
      adjustsFontSizeToFit={fit || undefined}
      minimumFontScale={fit ? 0.8 : undefined}
      onTextLayout={onTextLayout}
      maxFontSizeMultiplier={maxScale ?? spec?.maxScale}
      // Android's default "highQuality" line breaking measures a little wider than Yoga allots.
      textBreakStrategy="simple"
      style={[{ fontFamily: latin ? LATIN_FONT[w] : font(w, content), fontSize: fs, lineHeight: latin ? Math.round(fs * 1.4) : lh(fs, content), color: color ?? (muted ? c.tx2 : c.tx), textAlign: center ? 'center' : content ? 'right' : d.align, writingDirection: content ? 'rtl' : d.writing }, style]}
    >
      {children}
    </Text>
  );
}

/** Columns for card lists on wider screens: one on phones, two from 600 pt (tablets, landscape). */
export function useListColumns(): { cols: number; maxWidth: number } {
  const { width } = useWindowDimensions();
  return width >= BREAKPOINTS.medium ? { cols: 2, maxWidth: 1040 } : { cols: 1, maxWidth: MAX_CONTENT_WIDTH };
}

/** Lays cards out in equal columns, row by row in reading order (right to left in Arabic and Urdu). */
export function Grid({ children, cols, gap = LAYOUT.list }: { children: React.ReactNode; cols: number; gap?: number }) {
  const items = React.Children.toArray(children);
  if (cols <= 1) return <View style={{ gap }}>{items}</View>;
  const rows: React.ReactNode[][] = [];
  for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));
  return (
    <View style={{ gap }}>
      {rows.map((r, i) => (
        <Row key={i} gap={gap} style={{ alignItems: 'stretch' }}>
          {Array.from({ length: cols }, (_, j) => <View key={j} style={{ flex: 1 }}>{r[j] ?? null}</View>)}
        </Row>
      ))}
    </View>
  );
}

export function Row({ children, style, gap = SPACE.sm, onLayout }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; gap?: number; onLayout?: (e: LayoutChangeEvent) => void }) {
  const d = useDir();
  return <View onLayout={onLayout} style={[{ flexDirection: d.row, alignItems: 'center', gap }, style]}>{children}</View>;
}

/** Scale-on-press feedback (80 ms), skipped when the system asks for reduced motion. */
function usePressScale() {
  const reduce = useReducedMotion();
  const scale = React.useState(() => new Animated.Value(1))[0];
  const to = (v: number) => () => {
    if (reduce) return;
    Animated.timing(scale, { toValue: v, duration: MOTION.press, useNativeDriver: true }).start();
  };
  return { scale, onPressIn: to(0.98), onPressOut: to(1) };
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
  /** A tab's root title (H1, 28) instead of a stack title (H2, 22). */
  large?: boolean;
  /** Sticky action docked under the content (level 2), e.g. "Open Absher". */
  footer?: React.ReactNode;
  /** Widest column for this screen (two-pane screens pass more). */
  maxWidth?: number;
};

/** Safe-area screen with a header, a centred readable column and an optional sticky footer. */
export function Screen({ title, contentTitle, back, onBack, right, children, scroll = true, tabSpace = true, contentStyle, large, footer, maxWidth = MAX_CONTENT_WIDTH }: ScreenProps) {
  const { c, t } = useApp();
  const insets = useSafeAreaInsets();
  const d = useDir();
  const { width } = useWindowDimensions();
  const gutter = width < 360 ? LAYOUT.gutterCompact : LAYOUT.gutter;
  const header = (title || back || right) && (
    <View style={[styles.header, { flexDirection: d.row, paddingHorizontal: gutter, maxWidth }]}>
      {back ? <IconButton icon="go" flip={d.rtl} label={t.common.back} onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))} /> : null}
      <View style={{ flex: 1 }}>{title ? <T role={large ? 'h1' : 'h2'} header numberOfLines={3} content={contentTitle}>{title}</T> : null}</View>
      {right}
    </View>
  );
  const pad = { paddingBottom: (footer ? SPACE.md : tabSpace ? TAB_BAR_SPACE : SPACE.xl) + (footer ? 0 : insets.bottom * (tabSpace ? 0 : 1)) };
  const column = [styles.content, { paddingHorizontal: gutter, maxWidth }, pad, contentStyle];
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      {header}
      {scroll ? (
        <ScrollView contentContainerStyle={column} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      ) : (
        <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
      )}
      {footer ? <StickyBar inset={!tabSpace}>{footer}</StickyBar> : null}
    </View>
  );
}

/** Level 2 surface docked to the bottom edge: a hairline on top, no shadow. */
export function StickyBar({ children, tone, inset = true }: { children: React.ReactNode; tone?: 'ok' | 'bad'; inset?: boolean }) {
  const { c } = useApp();
  const insets = useSafeAreaInsets();
  const bg = tone === 'ok' ? c.okbg : tone === 'bad' ? c.badbg : 'transparent';
  return (
    <View style={{ backgroundColor: c.card, borderTopWidth: StyleSheet.hairlineWidth * 2, borderTopColor: tone === 'ok' ? c.ok : tone === 'bad' ? c.bad : c.ln }}>
      {/* Inside a tab, the tab bar already sits on the safe area, so only the top screens add it. */}
      <View style={{ backgroundColor: bg, paddingBottom: inset ? Math.max(insets.bottom, SPACE.sm) : SPACE.sm }}>
        <View style={{ width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', paddingHorizontal: LAYOUT.gutter, paddingTop: SPACE.sm, gap: SPACE.sm }}>{children}</View>
      </View>
    </View>
  );
}

export function IconButton({ icon, label, onPress, flip, size = ICON.nav, color, active }: { icon: IconName; label: string; onPress: () => void; flip?: boolean; size?: number; color?: string; active?: boolean }) {
  const { c } = useApp();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={active === undefined ? undefined : { selected: active }}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.iconBtn, { backgroundColor: active ? c.acSoft : pressed ? c.ln : c.fill }]}
    >
      <Icon name={icon} size={size} color={color ?? (active ? c.onAcSoft : c.tx)} flip={flip} />
    </Pressable>
  );
}

/** Level 1 surface. Pressable cards scale slightly on press. */
export function Card({ children, style, onPress, label, accent, checked }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; label?: string; accent?: string; checked?: boolean }) {
  const { c } = useApp();
  const press = usePressScale();
  const base = [styles.card, { backgroundColor: c.card, borderColor: accent ?? c.ln }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Animated.View style={{ transform: [{ scale: press.scale }] }}>
      <Pressable
        accessibilityRole={checked === undefined ? 'button' : 'checkbox'}
        accessibilityLabel={label}
        accessibilityState={checked === undefined ? undefined : { checked }}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={({ pressed }) => [...base, pressed && { backgroundColor: c.fill }]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export type ButtonKind = 'primary' | 'secondary' | 'tertiary' | 'destructive';
type LegacyKind = 'ghost' | 'ok' | 'danger';
type BtnProps = {
  title: string; onPress: () => void; kind?: ButtonKind | LegacyKind; icon?: IconName; disabled?: boolean; loading?: boolean; style?: StyleProp<ViewStyle>; small?: boolean; label?: string;
  /** Tighter side padding for buttons that share a row (exam footer), so a long word keeps its line. */
  dense?: boolean;
};

const KIND: Record<ButtonKind | LegacyKind, ButtonKind> = { primary: 'primary', secondary: 'secondary', tertiary: 'tertiary', destructive: 'destructive', ghost: 'secondary', ok: 'primary', danger: 'destructive' };

/**
 * One primary button per screen; secondary is tinted green; tertiary is text only; destructive only in confirmations.
 * Disabled is outlined and dashed (reads as "not yet"); loading keeps the label and swaps the icon for a spinner.
 */
export function Button({ title, onPress, kind = 'primary', icon, disabled, loading, style, small, label, dense }: BtnProps) {
  const { c } = useApp();
  const k = KIND[kind];
  const press = usePressScale();
  const size: TypeSize = small ? 16 : 18;
  const fg = disabled ? c.tx2 : k === 'secondary' ? c.onAcSoft : k === 'tertiary' ? c.ac : c.onAc;
  const bg = (pressed: boolean) =>
    disabled ? 'transparent' : k === 'primary' ? (pressed ? c.acPressed : c.acSolid) : k === 'destructive' ? c.badSolid : k === 'secondary' ? (pressed ? c.ln : c.acSoft) : pressed ? c.fill : 'transparent';
  const glyph = loading ? <ActivityIndicator color={fg} size="small" /> : icon ? <Icon name={icon} size={ICON.control} color={fg} /> : null;
  return (
    <Animated.View style={[{ transform: [{ scale: press.scale }] }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? title}
        accessibilityState={{ disabled: !!disabled, busy: !!loading }}
        disabled={disabled || loading}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={({ pressed }) => [styles.btn, small && styles.btnSmall, k === 'tertiary' && styles.btnTertiary, dense && styles.btnDense, { backgroundColor: bg(pressed), borderColor: disabled ? c.lnStrong : 'transparent', borderStyle: disabled ? 'dashed' : 'solid' }]}
      >
        <ButtonLabel title={title} size={size} color={fg} glyph={glyph} />
      </Pressable>
    </Animated.View>
  );
}

const GLYPH_SLOT = ICON.control + SPACE.xs;

/**
 * Button label. The text box always spans the button's full width, so Android never shrinks it to "fit" the text
 * (that is what cut off "أبشر" and pushed icons under labels on some phones). It wraps to a second line only when
 * the words truly do not fit. The icon is drawn beside the text as laid out, using the widest line's width, and
 * the same space is kept free on both sides so the text stays centred. The web has no such measuring issue and
 * does not report line widths, so it uses a plain row.
 */
function ButtonLabel({ title, size, color, glyph }: { title: string; size: TypeSize; color: string; glyph: React.ReactNode }) {
  const d = useDir();
  const [drawn, setDrawn] = React.useState<{ text: string; w: number } | null>(null);
  const label = (
    <T size={size} weight="semibold" color={color} center numberOfLines={2} style={glyph && Platform.OS !== 'web' ? { paddingHorizontal: GLYPH_SLOT } : undefined}
      onTextLayout={glyph && Platform.OS !== 'web' ? (e) => {
        const w = Math.ceil(Math.max(0, ...e.nativeEvent.lines.map((l) => l.width)));
        if (drawn?.text !== title || drawn.w !== w) setDrawn({ text: title, w });
      } : undefined}
    >
      {title}
    </T>
  );
  if (!glyph) return label;
  if (Platform.OS === 'web') {
    return (
      <Row gap={SPACE.xs} style={{ justifyContent: 'center' }}>
        {glyph}
        <View style={{ flexShrink: 1 }}>{label}</View>
      </Row>
    );
  }
  const w = drawn?.text === title ? drawn.w : null;
  // Centre of the box, minus half the drawn text, minus the gap and the icon: the icon sits at the reading start.
  const offset = w === null ? 0 : -(w / 2) - GLYPH_SLOT;
  return (
    <View style={{ alignSelf: 'stretch', justifyContent: 'center' }}>
      {label}
      <View
        testID="button-icon"
        pointerEvents="none"
        style={[{ position: 'absolute', top: 0, bottom: 0, justifyContent: 'center', opacity: w === null ? 0 : 1 }, d.rtl ? { right: '50%', marginRight: offset } : { left: '50%', marginLeft: offset }]}
      >
        {glyph}
      </View>
    </View>
  );
}

/** A filter chip when it has `onPress` (44 pt target, selected = brand fill + check), otherwise a compact label. */
export function Chip({ label, on, onPress, icon }: { label: string; on?: boolean; onPress?: () => void; icon?: IconName }) {
  const { c } = useApp();
  if (!onPress) {
    return (
      <View style={[styles.chip, styles.chipStatic, { backgroundColor: c.fill }]}>
        <T role="caption" size={14} weight="medium" fit>{label}</T>
      </View>
    );
  }
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: !!on }} onPress={onPress} hitSlop={{ top: 4, bottom: 4 }} style={({ pressed }) => [styles.chip, { backgroundColor: on ? c.acSolid : pressed ? c.ln : c.card, borderColor: on ? c.acSolid : c.ln }]}>
      <Row gap={SPACE.xxs}>
        {on ? <Icon name="check" size={ICON.inline} color={c.onAc} /> : icon ? <Icon name={icon} size={ICON.inline} color={c.ac} /> : null}
        <T size={14} weight="semibold" color={on ? c.onAc : c.tx} fit>{label}</T>
      </Row>
    </Pressable>
  );
}

/** Small read-only label: sources, fees, counts, "new". */
export function Badge({ text, tone = 'neutral', icon }: { text: string; tone?: 'neutral' | 'brand' | 'sand' | 'ok' | 'bad' | 'warn'; icon?: IconName }) {
  const { c } = useApp();
  const d = useDir();
  // Short badges stay on one line; long ones (e.g. "from public sources · not confirmed on Absher") may wrap.
  const short = text.length <= 28;
  const fg = tone === 'brand' ? c.ac : tone === 'sand' ? c.sand : tone === 'ok' ? c.ok : tone === 'bad' ? c.bad : tone === 'warn' ? c.warn : c.tx2;
  const bg = tone === 'ok' ? c.okbg : tone === 'bad' ? c.badbg : tone === 'warn' ? c.warnbg : c.fill;
  return (
    <Row gap={SPACE.xxs} style={[styles.badge, { backgroundColor: bg, alignSelf: d.start }]}>
      {icon ? <Icon name={icon} size={12} color={fg} /> : null}
      <T size={12} weight="semibold" color={fg} maxScale={1.5} fit={short} style={short ? undefined : { flexShrink: 1 }}>{text}</T>
    </Row>
  );
}

export function Segmented({ options, value, onChange }: { options: string[]; value: number; onChange: (i: number) => void }) {
  const { c } = useApp();
  const d = useDir();
  return (
    <View accessibilityRole="tablist" style={[styles.seg, { backgroundColor: c.bg2, borderColor: c.ln, flexDirection: d.row }]}>
      {options.map((o, i) => (
        <Pressable key={o} accessibilityRole="tab" accessibilityLabel={o} accessibilityState={{ selected: value === i }} onPress={() => onChange(i)} style={[styles.segBtn, value === i && { backgroundColor: c.card, borderColor: c.ln, borderWidth: 1 }]}>
          <T size={16} weight="semibold" center color={value === i ? c.tx : c.tx2} maxScale={1.3} numberOfLines={2}>{o}</T>
        </Pressable>
      ))}
    </View>
  );
}

export function ProgressBar({ value, color, height = 6, label }: { value: number; color?: string; height?: number; label?: string }) {
  const { c } = useApp();
  const d = useDir();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }} style={{ height, borderRadius: height, backgroundColor: c.fill, overflow: 'hidden', alignItems: d.start }}>
      <View style={{ width: `${pct * 100}%`, height: '100%', borderRadius: height, backgroundColor: color ?? c.acSolid }} />
    </View>
  );
}

/**
 * Progress ring with its number fitted inside the hole (the number can never spill over the ring) and an optional
 * second line under it. With `animate`, the arc and number count up once (600 ms; instant with reduced motion).
 */
export function Ring({ value, size = 140, color, label, sub, a11y, animate }: { value: number; size?: number; color?: string; label: string; sub?: string; a11y?: string; animate?: boolean }) {
  const { c, font } = useApp();
  const reduce = useReducedMotion();
  const target = Math.max(0, Math.min(1, value));
  const moving = !!animate && !reduce;
  const [progress, setProgress] = React.useState(0);
  const shown = moving ? progress : target;
  React.useEffect(() => {
    if (!moving) return;
    const v = new Animated.Value(0);
    const id = v.addListener(({ value: x }) => setProgress(x));
    Animated.timing(v, { toValue: target, duration: MOTION.celebrate, useNativeDriver: false }).start();
    return () => v.removeListener(id);
  }, [moving, target]);
  const r = 46;
  const stroke = 9;
  const circ = 2 * Math.PI * r;
  // The hole's diameter is (2r - stroke)/120 of the ring; the text box uses 80% of that.
  const hole = (size * (2 * r - stroke)) / 120;
  const box = hole * 0.8;
  const numeric = /^\d+$/.test(label);
  const count = numeric && moving && target > 0 ? String(Math.round((Number(label) * shown) / target)) : label;
  const fs = Math.min(size / (sub ? 4.4 : 4), box / (Math.max(2, label.length) * 0.56));
  return (
    <View style={{ width: size, height: size, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }} accessible accessibilityRole="image" accessibilityLabel={a11y ?? (sub ? `${label} ${sub}` : label)}>
      <Svg width={size} height={size} viewBox="0 0 120 120" style={StyleSheet.absoluteFill}>
        <Circle cx={60} cy={60} r={r} fill="none" stroke={c.fill} strokeWidth={stroke} />
        <Circle cx={60} cy={60} r={r} fill="none" stroke={color ?? c.acSolid} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${circ}`} strokeDashoffset={circ * (1 - shown)} transform="rotate(-90 60 60)" />
      </Svg>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} maxFontSizeMultiplier={1.3} style={{ width: box, textAlign: 'center', fontFamily: font('bold'), fontSize: fs, lineHeight: Math.round(fs * 1.25), color: c.tx, fontVariant: ['tabular-nums'] }}>
        {count}
      </Text>
      {sub ? (
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} maxFontSizeMultiplier={1.3} style={{ width: box, textAlign: 'center', fontFamily: font('medium'), fontSize: Math.max(12, Math.round(fs * 0.42)), color: c.tx2 }}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

/** Star rating drawn as shapes (filled vs outline), so it never relies on colour alone. */
export function Stars({ n, max = 3, size = 16, label }: { n: number; max?: number; size?: number; label: string }) {
  const { c } = useApp();
  const d = useDir();
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={{ flexDirection: d.row, gap: 2 }}>
      {Array.from({ length: max }, (_, i) => <Icon key={i} name="star" size={size} color={i < n ? c.sand : c.lnStrong} filled={i < n} strokeWidth={1.75} />)}
    </View>
  );
}

/** @deprecated Use Stars for ratings; Pips remain for counts such as attempts left. */
export function Pips({ n, max, color }: { n: number; max: number; color: string }) {
  const { c } = useApp();
  const d = useDir();
  return (
    <View style={{ flexDirection: d.row, gap: SPACE.xxs }} accessibilityLabel={`${n}/${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i < n ? color : 'transparent', borderWidth: i < n ? 0 : 1.5, borderColor: c.lnStrong }} />
      ))}
    </View>
  );
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (s: string) => void; placeholder: string }) {
  const { c, font, t } = useApp();
  const d = useDir();
  return (
    <View style={[styles.search, { backgroundColor: c.card, borderColor: c.lnStrong, flexDirection: d.row }]}>
      <Icon name="search" size={ICON.control} color={c.tx2} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={c.tx2}
        accessibilityLabel={placeholder}
        maxLength={60}
        autoCorrect={false}
        style={{ flex: 1, fontFamily: font('regular', true), fontSize: 16, color: c.tx, textAlign: d.align, paddingVertical: SPACE.sm }}
      />
      {value ? (
        <Pressable accessibilityRole="button" accessibilityLabel={t.common.close} onPress={() => onChange('')} hitSlop={10} style={styles.clear}>
          <Icon name="close" size={ICON.inline} color={c.tx2} />
        </Pressable>
      ) : null}
    </View>
  );
}

export type Tone = 'info' | 'ok' | 'bad' | 'warn';
export function Notice({ text, tone = 'info', title }: { text: string; tone?: Tone; title?: string }) {
  const { c } = useApp();
  const color = tone === 'ok' ? c.ok : tone === 'bad' ? c.bad : tone === 'warn' ? c.warn : c.info;
  const bg = tone === 'ok' ? c.okbg : tone === 'bad' ? c.badbg : tone === 'warn' ? c.warnbg : c.infobg;
  return (
    <Row gap={SPACE.sm} style={[styles.notice, { backgroundColor: bg }]}>
      <Icon name={tone === 'bad' || tone === 'warn' ? 'alert' : tone === 'ok' ? 'check' : 'info'} size={ICON.control} color={color} />
      <View style={{ flex: 1, gap: 2 }}>
        {title ? <T size={16} weight="semibold">{title}</T> : null}
        <T size={14}>{text}</T>
      </View>
    </Row>
  );
}

export function SourceBadge({ kind }: { kind: 'official' | 'general' }) {
  const { c, t } = useApp();
  const d = useDir();
  const color = kind === 'official' ? c.ok : c.tx2;
  // Sits at the reading start: right in Arabic and Urdu, left otherwise.
  return (
    <Row gap={SPACE.xs} style={{ alignSelf: d.start }}>
      <Icon name={kind === 'official' ? 'check' : 'info'} size={ICON.inline} color={color} />
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

/** Placeholder rows shaped like the content they stand in for; they pulse gently (still with reduced motion). */
export function Skeleton({ rows = 3, height = 64 }: { rows?: number; height?: number }) {
  const { c } = useApp();
  const reduce = useReducedMotion();
  const o = React.useState(() => new Animated.Value(1))[0];
  React.useEffect(() => {
    if (reduce) return;
    const loop = Animated.loop(Animated.sequence([Animated.timing(o, { toValue: 0.5, duration: 600, useNativeDriver: true }), Animated.timing(o, { toValue: 1, duration: 600, useNativeDriver: true })]));
    loop.start();
    return () => loop.stop();
  }, [o, reduce]);
  return (
    <View accessibilityLabel="…" style={{ gap: LAYOUT.list }}>
      {Array.from({ length: rows }, (_, i) => <Animated.View key={i} style={{ height, borderRadius: RADIUS.lg, backgroundColor: c.fill, opacity: o }} />)}
    </View>
  );
}

export function EmptyState({ text, title, action, icon = 'search' }: { text: string; title?: string; action?: React.ReactNode; icon?: IconName }) {
  const { c } = useApp();
  return (
    <View style={{ alignItems: 'center', paddingVertical: SPACE.x3, gap: SPACE.md }}>
      <Icon name={icon} size={ICON.hero} color={c.tx2} />
      {title ? <T role="h3" center>{title}</T> : null}
      <T muted center>{text}</T>
      {action}
    </View>
  );
}

/** Confirmation dialog (level 3). At most two actions; a destructive one goes last. */
export function Dialog({ visible, text, title, actions, onClose, icon }: { visible: boolean; title?: string; text: string; actions: React.ReactNode; onClose: () => void; icon?: IconName }) {
  const { c, t } = useApp();
  const reduce = useReducedMotion();
  return (
    <Modal visible={visible} transparent animationType={reduce ? 'none' : 'fade'} onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={[styles.scrim, { backgroundColor: c.scrim }]} onPress={onClose} accessibilityRole="button" accessibilityLabel={t.common.close}>
        <Pressable style={[styles.dialog, ELEVATION.overlay, { backgroundColor: c.elevated, borderColor: c.ln, shadowColor: c.shadow }]} onPress={() => {}} accessible={false} accessibilityViewIsModal>
          {icon ? <View style={{ alignSelf: 'center', marginBottom: SPACE.sm }}><IconTile icon={icon} /></View> : null}
          {title ? <T role="h2" center header>{title}</T> : null}
          <T center style={{ marginVertical: SPACE.sm }}>{text}</T>
          <View style={{ gap: SPACE.sm }}>{actions}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Bottom sheet (level 3): grab handle, title, close button; closes on the scrim, the button or system back. */
export function BottomSheet({ visible, title, onClose, children, scroll = true }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode; scroll?: boolean }) {
  const { c, t } = useApp();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const { height } = useWindowDimensions();
  const d = useDir();
  return (
    <Modal visible={visible} transparent animationType={reduce ? 'none' : 'slide'} onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: c.scrim }} onPress={onClose} accessibilityRole="button" accessibilityLabel={t.common.close} />
      <View accessibilityViewIsModal style={[styles.sheet, ELEVATION.overlay, { backgroundColor: c.elevated, shadowColor: c.shadow, paddingBottom: LAYOUT.sheet + insets.bottom, maxHeight: height * 0.9 }]}>
        <View style={[styles.grab, { backgroundColor: c.lnStrong }]} />
        <View style={{ width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', gap: SPACE.sm, flexShrink: 1 }}>
          <Row style={{ flexDirection: d.row }}>
            <View style={{ flex: 1 }}><T role="h2" header>{title}</T></View>
            <IconButton icon="close" label={t.common.close} onPress={onClose} />
          </Row>
          {scroll ? <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ gap: SPACE.sm }} keyboardShouldPersistTaps="handled">{children}</ScrollView> : children}
        </View>
      </View>
    </Modal>
  );
}

/** Bottom-sheet list picker with search for long lists (replaces the web <select>). */
export function PickerSheet({ visible, title, items, value, onPick, onClose }: { visible: boolean; title: string; items: { value: string; label: string }[]; value: string; onPick: (v: string) => void; onClose: () => void }) {
  const { c, t } = useApp();
  const [q, setQ] = React.useState('');
  const searchable = items.length > 15;
  const shown = searchable && q.trim() ? items.filter((it) => !it.value || it.label.toLowerCase().includes(q.trim().toLowerCase())) : items;
  const close = () => {
    setQ('');
    onClose();
  };
  const d = useDir();
  return (
    <BottomSheet visible={visible} title={title} onClose={close}>
      {searchable ? <SearchBox value={q} onChange={setQ} placeholder={t.common.search} /> : null}
      <View>
        {shown.map((it) => (
          <Pressable key={it.value || '_all'} accessibilityRole="radio" accessibilityLabel={it.label} accessibilityState={{ selected: it.value === value }} onPress={() => { onPick(it.value); close(); }} style={({ pressed }) => [styles.sheetRow, { flexDirection: d.row, backgroundColor: it.value === value ? c.acSoft : pressed ? c.fill : 'transparent' }]}>
            <View style={{ flex: 1 }}><T weight={it.value === value ? 'semibold' : 'regular'} color={it.value === value ? c.onAcSoft : c.tx}>{it.label}</T></View>
            {it.value === value ? <Icon name="check" size={ICON.control} color={c.onAcSoft} /> : null}
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

export function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <View style={{ gap: LAYOUT.list, marginTop: SPACE.md }}>
      <Row>
        <View style={{ flex: 1 }}><T role="h3" header>{title}</T></View>
        {action}
      </Row>
      {children}
    </View>
  );
}

/** Tinted square behind a feature icon (48, icon 28; 40 / 20 when compact). Brand green everywhere. */
export function IconTile({ icon, color, compact, bg }: { icon: IconName; color?: string; compact?: boolean; bg?: string }) {
  const { c } = useApp();
  const size = compact ? 40 : 48;
  return (
    <View style={{ width: size, height: size, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', backgroundColor: bg ?? c.acSoft }}>
      <Icon name={icon} size={compact ? ICON.control : ICON.tile} color={color ?? c.onAcSoft} />
    </View>
  );
}

/** List row (min 56): leading icon tile, title and caption, trailing value or chevron. */
export function ListRow({ title, sub, icon, onPress, trailing, label, content, badge, tileBg, tileColor }: { title: string; sub?: string; icon?: IconName; onPress?: () => void; trailing?: React.ReactNode; label?: string; content?: boolean; badge?: React.ReactNode; tileBg?: string; tileColor?: string }) {
  const { c } = useApp();
  const d = useDir();
  const body = (
    <Row gap={SPACE.sm} style={{ alignItems: 'center' }}>
      {icon ? <IconTile icon={icon} compact bg={tileBg} color={tileColor} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <T role="title" size={16} content={content}>{title}</T>
        {sub ? <T size={14} muted>{sub}</T> : null}
      </View>
      {badge}
      {trailing ?? (onPress ? <Icon name="go" size={ICON.control} color={c.tx2} flip={!d.rtl} /> : null)}
    </Row>
  );
  if (!onPress) return <View style={[styles.row, { backgroundColor: c.card, borderColor: c.ln }]}>{body}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label ?? (sub ? `${title}, ${sub}` : title)} onPress={onPress} style={({ pressed }) => [styles.row, { backgroundColor: pressed ? c.fill : c.card, borderColor: c.ln }]}>
      {body}
    </Pressable>
  );
}

/** One figure in a row of equal tiles (results). Rows of StatTiles stretch so every tile has the same height. */
export function StatTile({ value, label, color, children }: { value?: string; label: string; color?: string; children?: React.ReactNode }) {
  const { c } = useApp();
  return (
    <View style={[styles.stat, { backgroundColor: c.card, borderColor: c.ln }]} accessible accessibilityLabel={value ? `${value} ${label}` : label}>
      <View style={styles.statValue}>{children ?? <T role="h2" size={24} center color={color} maxScale={1.3}>{value}</T>}</View>
      <T size={12} muted center>{label}</T>
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
      style={({ pressed }) => [{ flexDirection: d.row, alignItems: 'center', gap: SPACE.xxs, minHeight: TOUCH, paddingHorizontal: SPACE.sm, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: c.ln, backgroundColor: pressed ? c.ln : c.fill }]}
    >
      <Icon name="globe" size={ICON.control} color={c.tx} />
      <T size={14} weight="semibold" maxScale={1.3} fit>{name}</T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Header and content share one centred column, capped on tablets and large phones.
  header: { alignItems: 'center', gap: SPACE.sm, paddingTop: SPACE.sm, paddingBottom: SPACE.xs, minHeight: 56, width: '100%', alignSelf: 'center' },
  content: { paddingTop: SPACE.xs, gap: LAYOUT.list, width: '100%', alignSelf: 'center' },
  iconBtn: { width: TOUCH, height: TOUCH, borderRadius: TOUCH / 2, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: RADIUS.lg, padding: LAYOUT.card, borderWidth: 1 },
  btn: { minHeight: 52, borderRadius: RADIUS.md, paddingHorizontal: LAYOUT.buttonX, paddingVertical: SPACE.sm, justifyContent: 'center', borderWidth: 1 },
  btnSmall: { minHeight: TOUCH, paddingVertical: SPACE.xs, paddingHorizontal: SPACE.md },
  btnTertiary: { minHeight: TOUCH, paddingVertical: SPACE.xs },
  btnDense: { paddingHorizontal: SPACE.sm },
  chip: { minHeight: 36, paddingHorizontal: 14, paddingVertical: SPACE.xxs, borderRadius: RADIUS.pill, justifyContent: 'center', borderWidth: 1 },
  chipStatic: { minHeight: 28, paddingHorizontal: SPACE.sm, borderWidth: 0 },
  badge: { minHeight: 24, paddingHorizontal: SPACE.xs, borderRadius: RADIUS.sm, maxWidth: '100%' },
  seg: { padding: SPACE.xxs, borderRadius: RADIUS.pill, borderWidth: 1, gap: SPACE.xxs },
  segBtn: { flex: 1, minHeight: TOUCH, borderRadius: RADIUS.pill, justifyContent: 'center', paddingHorizontal: SPACE.xs, borderWidth: 1, borderColor: 'transparent' },
  search: { alignItems: 'center', gap: SPACE.xs, borderRadius: RADIUS.md, borderWidth: 1, paddingHorizontal: SPACE.md, minHeight: 52 },
  clear: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  notice: { padding: SPACE.sm, paddingHorizontal: SPACE.md, borderRadius: RADIUS.md, alignItems: 'flex-start' },
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACE.xl },
  dialog: { width: '100%', maxWidth: 400, borderRadius: RADIUS.xl, padding: LAYOUT.modal, borderWidth: 1 },
  sheet: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, paddingHorizontal: LAYOUT.sheet, paddingTop: SPACE.xs },
  grab: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: SPACE.xs },
  sheetRow: { alignItems: 'center', minHeight: 52, paddingHorizontal: SPACE.sm, borderRadius: RADIUS.md },
  row: { minHeight: 56, paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm, borderRadius: RADIUS.md, borderWidth: 1, justifyContent: 'center' },
  stat: { flex: 1, borderRadius: RADIUS.lg, borderWidth: 1, paddingVertical: SPACE.sm, paddingHorizontal: SPACE.xs, gap: SPACE.xxs, justifyContent: 'center' },
  statValue: { minHeight: 34, alignItems: 'center', justifyContent: 'center' },
});
