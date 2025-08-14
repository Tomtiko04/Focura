# Focura – UI Style Guide & Component Library Plan


## 0) Design Principles

* **Modern minimal**: lots of white space, clean typography, single bold accent.
* **Fast to scan**: clear hierarchy, bold main tasks, indented subtasks.
* **Touch-first**: large hit areas (≥44×44), generous spacing.
* **Delight, not distraction**: subtle motion, smooth state changes, confident color.
* **Accessible**: min 4.5:1 contrast for text; supports Dynamic Type (font scaling).

---

## 1) Brand & Color System

### Palette (Base)

* **Primary**: Emerald 600 `#10B981` (fresh, calm)

  * Darken: Emerald 700 `#059669`; Lighten: Emerald 400 `#34D399`
* **Accent**: Coral 500 `#FF6F61` (for highlights/CTAs)
* **Surface**: `#FFFFFF` (cards), **Canvas**: `#F8FAFC` (background)
* **Text Primary**: Slate 900 `#0F172A`; **Text Secondary**: Slate 600 `#475569`
* **Border**: Slate 200 `#E2E8F0`
* **Success**: Green 500 `#22C55E`
* **Warning**: Amber 500 `#F59E0B`
* **Error**: Red 500 `#EF4444`

### Semantic Tokens

* `--bg`: Canvas
* `--surface`: Surface
* `--primary`: Emerald 600
* `--on-primary`: White
* `--text`: Slate 900
* `--muted`: Slate 600
* `--border`: Slate 200
* `--success`: Green 500
* `--warning`: Amber 500
* `--error`: Red 500

### Dark Mode Mapping

* `--bg`: Slate 900 `#0F172A`
* `--surface`: Slate 800 `#1E293B`
* `--text`: Slate 100 `#F1F5F9`
* `--muted`: Slate 400 `#94A3B8`
* `--border`: Slate 700 `#334155`
* `--primary`: Emerald 400 `#34D399`
* `--on-primary`: Slate 900

---

## 2) Typography

* **Headings**: *Poppins* (700/600)
* **Body/UI**: *Inter* (400/500)

> Expo fonts: `@expo-google-fonts/inter`, `@expo-google-fonts/poppins`.

**Scale** (base 16):

* Display: 28/34
* H1: 24/30
* H2: 20/26
* H3: 18/24
* Body: 16/22
* Caption: 13/18

Enable RN font scaling & use `maxFontSizeMultiplier` where needed.

---

## 3) Spacing, Radius, Elevation

* **Spacing**: Tailwind scale (2, 3, 4, 6, 8, 10, 12, 16, 24)
* **Radius**: `rounded-xl (12)`, `rounded-2xl (16)`, `rounded-full`
* **Shadows** (iOS)/**Elevation** (Android):

  * Card: `shadow-md` / `elevation-2`
  * Floating: `shadow-lg` / `elevation-4`
  * FAB: `shadow-xl` / `elevation-6`

---

## 4) NativeWind / Tailwind Setup

**tailwind.config.js** (RN-friendly)

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#10B981',
          400: '#34D399',
          600: '#10B981',
          700: '#059669',
        },
        accent: '#FF6F61',
        text: {
          DEFAULT: '#0F172A',
          muted: '#475569',
        },
        border: '#E2E8F0',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        heading: ['Poppins_700Bold', 'Poppins_600SemiBold'],
        body: ['Inter_400Regular', 'Inter_500Medium'],
      },
      borderRadius: {
        xl: 12,
        '2xl': 16,
      }
    }
  },
  plugins: [],
}
```

**Theme helper (`src/theme/theme.js`)**

```js
export const theme = {
  colors: {
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    muted: '#475569',
    primary: '#10B981',
    accent: '#FF6F61',
    border: '#E2E8F0',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  radius: { md: 12, lg: 16, full: 999 },
};
```

---

## 5) Motion & Interaction

* Use **Reanimated** + **Moti** for simple, performant animations.
* Durations: 120–200ms for taps; 250–300ms for screen transitions.
* Easing: `easeOut` for entrances; `easeIn` for exits.
* Examples: press scale `0.98`, list item swipe, FAB rise on scroll.

---

## 6) Iconography

* **Library**: `react-native-vector-icons` (Feather/Lucide set) or `lucide-react-native`.
* Line icons, 24px default; use filled variations for active states.

---

## 7) Component Library (Atoms → Molecules → Organisms)

### 7.1 Atoms

#### Button

* Variants: `primary`, `secondary`, `ghost`, `destructive`.
* Sizes: `sm`, `md`, `lg`.
* Props: `icon`, `loading`, `disabled`, `onPress`.

Usage:

```jsx
<TouchableOpacity className="bg-primary rounded-2xl px-5 py-3 items-center" onPress={onPress}>
  <Text className="text-white font-bold">Continue</Text>
</TouchableOpacity>
```

#### IconButton

* Circular, subtle surface, shadow on float.

#### Input

* Label, helper, error; leading icon.
* Class: `border border-border rounded-xl px-4 py-3 bg-surface`.

#### Checkbox / Switch

* Use RN `Switch` themed; `accent` color when on.

#### Chip / Pill

* For **Implementation Intentions** (time/place)
* Class: `bg-slate-100 text-slate-700 rounded-full px-3 py-1` (dark: slate-700/slate-100)

#### Badge

* Status: success/warning/error; small dot + text.

---

### 7.2 Molecules

#### Card

* Surface with shadow, rounded corners, padding.
* Header (title + meta), body, footer (actions).

#### ListItem / TaskItem

* Layout: left status indicator (checkbox), center content, right time.
* Main task **bold**, subtasks collapsed count `(+2)`.
* Show chips: `⏰ 9:00 AM` `📍 Office`.

#### Toolbar / AppHeader

* Title, optional search, right-side icon buttons (Bell, Settings).

#### EmptyState

* Illustration (Lottie) + title + hint + primary action.

#### Snackbar / Toast

* Use `react-native-toast-message`; variants align to theme.

#### Segment/Tabs

* For Today | Upcoming | Completed.

---

### 7.3 Organisms

#### TaskComposer

* **Type Mode**: inputs for main task, subtasks (dynamic add), time, place.
* **Snap Mode**: camera button → preview → OCR result → parsed list → confirm.
* Implementation Intention preview: *“I will {task} at {time} in {place}.”*

#### ScheduleBoard

* Day timeline with time markers; cards positioned by time; drag to reschedule.

#### CameraSnap

* Inline camera or modal flow; guide frame overlay; shutter FAB.

#### BottomSheet (parse results)

* Show detected items grouped; toggle/edit before save.

---

## 8) Screens (Initial)

* **Auth**: Login, Register (already done; apply theme classes).
* **Home**: quick actions (Snap / Type), Today’s tasks, next reminder.
* **Add Task**: segmented toggle (Type | Snap) + TaskComposer.
* **Schedule**: ScheduleBoard + filters.
* **Settings**: Notifications lead time, email toggles, theme (Light/Dark/System).

---

## 9) Accessibility & UX Rules

* Hit targets ≥44×44; list rows ≥56 height.
* Don’t rely on color alone: add icons/labels for states.
* Respect system font scaling; test at 120–135%.
* Motion sensitivity: offer "Reduce Motion" toggle to limit large animations.

---

## 10) File Structure (UI Layer)

```
mobile/src/ui/
├─ components/
│  ├─ atoms/
│  │  ├─ Button.js
│  │  ├─ IconButton.js
│  │  ├─ Input.js
│  │  ├─ Chip.js
│  │  ├─ Badge.js
│  │  └─ Checkbox.js
│  ├─ molecules/
│  │  ├─ Card.js
│  │  ├─ ListItem.js
│  │  ├─ Snackbar.js
│  │  ├─ Tabs.js
│  │  └─ AppHeader.js
│  └─ organisms/
│     ├─ TaskComposer.js
│     ├─ BottomSheetParse.js
│     └─ CameraSnap.js
├─ theme/
│  ├─ theme.js
│  └─ index.js
└─ utils/
   └─ motion.js
```

---

## 11) Code Patterns (Snippets)

**Button (primary/secondary variants)**

```jsx
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

export function Button({ title, onPress, variant = 'primary', loading, leftIcon }) {
  const base = 'rounded-2xl px-5 py-3 flex-row items-center justify-center';
  const variants = {
    primary: 'bg-primary',
    secondary: 'bg-slate-900',
    ghost: 'bg-transparent border border-border',
    destructive: 'bg-error',
  };
  const text = variant === 'ghost' ? 'text-text' : 'text-white';
  return (
    <TouchableOpacity className={`${base} ${variants[variant]}`} onPress={onPress} disabled={loading}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View className="flex-row items-center gap-2">
          {leftIcon}
          <Text className={`${text} font-bold`}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
```

**Input**

```jsx
import { TextInput, Text, View } from 'react-native';

export function Input({ label, error, ...props }) {
  return (
    <View className="mb-4">
      {label && <Text className="mb-2 text-text font-semibold">{label}</Text>}
      <TextInput
        className={`bg-surface border border-border rounded-xl px-4 py-3 text-text ${error ? 'border-error' : ''}`}
        placeholderTextColor="#94A3B8"
        {...props}
      />
      {!!error && <Text className="text-error mt-1">{error}</Text>}
    </View>
  );
}
```

**ListItem / TaskItem**

```jsx
import { View, Text, TouchableOpacity } from 'react-native';

export function TaskItem({ title, time, place, completed, onToggle }) {
  return (
    <TouchableOpacity className="flex-row items-center bg-surface rounded-2xl p-4 mb-3 border border-border" onPress={onToggle}>
      <View className={`w-5 h-5 mr-3 rounded ${completed ? 'bg-success' : 'border border-border'}`} />
      <View className="flex-1">
        <Text className={`font-semibold ${completed ? 'text-text-muted line-through' : 'text-text'}`}>{title}</Text>
        <View className="flex-row gap-2 mt-2">
          {time && <Text className="bg-slate-100 text-slate-700 rounded-full px-2 py-0.5">⏰ {time}</Text>}
          {place && <Text className="bg-slate-100 text-slate-700 rounded-full px-2 py-0.5">📍 {place}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}
```

**BottomSheet Parse (structure)**

```jsx
// Use @gorhom/bottom-sheet
// Show parsed tasks with toggles and inline editing before saving
```

---

## 12) Libraries to Install (UI/Styling/Motion)

* `nativewind` (and Tailwind peer deps)
* `react-native-safe-area-context`
* `react-native-vector-icons` or `lucide-react-native`
* `moti` + `react-native-reanimated`
* `@expo-google-fonts/inter` + `@expo-google-fonts/poppins`
* `react-native-toast-message`
* `@gorhom/bottom-sheet`
* `lottie-react-native` (optional, for empty states)

---

## 13) Theming & Dark Mode Hook

* Keep a `useTheme()` context exposing `isDark`, tokens, and helper styles.
* Mirror Tailwind classes with `className` + conditional dark styles using NativeWind’s `dark:` prefix.

---

## 14) QA Checklist (UI)

* Typography loads early; fallback fonts set.
* Touch targets: ✅ 44+.
* Color contrast verified (WCAG AA at minimum).
* Dark mode parity (no invisible borders/text).
* RTL mirroring tested for Arabic/Hebrew.
* Animations disabled when "Reduce Motion" is on.

---

## 15) Hand-off Notes

* All new screens should consume atoms/molecules first.
* Avoid inline colors; use tokens/classes.
* Keep motion subtle; prefer translate/opacity over scale for lists.
* Prefer composition over prop drilling; co-locate styles with components.
