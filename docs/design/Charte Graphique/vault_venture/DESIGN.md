---
name: Vault & Venture
colors:
  surface: '#f4faff'
  surface-dim: '#cfdce4'
  surface-bright: '#f4faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e9f6fd'
  surface-container: '#e3f0f8'
  surface-container-high: '#ddeaf2'
  surface-container-highest: '#d7e4ec'
  on-surface: '#111d23'
  on-surface-variant: '#4c4733'
  inverse-surface: '#263238'
  inverse-on-surface: '#e6f3fb'
  outline: '#7e7761'
  outline-variant: '#cfc6ac'
  surface-tint: '#705d00'
  primary: '#705d00'
  on-primary: '#ffffff'
  primary-container: '#fdd835'
  on-primary-container: '#715e00'
  inverse-primary: '#e8c41d'
  secondary: '#b51a1e'
  on-secondary: '#ffffff'
  secondary-container: '#d93633'
  on-secondary-container: '#fffbff'
  tertiary: '#00629e'
  on-tertiary: '#ffffff'
  tertiary-container: '#c0ddff'
  on-tertiary-container: '#00639f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe16e'
  primary-fixed-dim: '#e8c41d'
  on-primary-fixed: '#221b00'
  on-primary-fixed-variant: '#544600'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ac'
  on-secondary-fixed: '#410003'
  on-secondary-fixed-variant: '#93000e'
  tertiary-fixed: '#cfe5ff'
  tertiary-fixed-dim: '#99cbff'
  on-tertiary-fixed: '#001d34'
  on-tertiary-fixed-variant: '#004a78'
  background: '#f4faff'
  on-background: '#111d23'
  surface-variant: '#d7e4ec'
  status-owned: '#C62828'
  status-missing: '#2E7D32'
  status-warning: '#FF8F00'
  surface-duck-egg: '#E1F5FE'
typography:
  display-lg:
    fontFamily: anybody
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 52px
    letterSpacing: -1px
  headline-lg:
    fontFamily: anybody
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: anybody
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: anybody
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
  body-lg:
    fontFamily: hankenGrotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: hankenGrotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: jetbrainsMono
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.5px
  label-md:
    fontFamily: jetbrainsMono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
  numeric-hero:
    fontFamily: anybody
    fontSize: 64px
    fontWeight: '900'
    lineHeight: 64px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  margin-mobile: 16px
  gutter-list: 12px
  touch-target: 48px
  card-padding: 16px
---

## Brand & Style

The design system is a "Modern Utilitarian" framework tailored for high-speed decision-making in high-glare environments. It blends the professional rigor of Material Design 3 with the vibrant, nostalgic spirit of comic book collecting. The aesthetic is inspired by the iconic Scrooge McDuck—evoking the thrill of the "treasure hunt" while remaining a serious tool for inventory management.

The brand personality is **Precise**, **Optimistic**, and **Reliable**. It prioritizes extreme legibility for outdoor use at flea markets, using high-contrast elements and bold information hierarchy to answer the collector's primary question ("Do I own this?") in milliseconds.

The design style is **Corporate / Modern** with a **Tactile** edge. It utilizes clean surfaces and systematic spacing but introduces thick-stroked icons and bold, numeric-focused typography to give the app a "collectible" feel.

## Colors

The palette is anchored by "Duck Blue" (`tertiary`) and "Rich Red" (`secondary`), with "Vibrant Yellow" (`primary`) used sparingly for high-priority actions like scanning. 

- **Primary (Yellow):** Reserved for the "Scanner" and primary floating action buttons to ensure they are visible even in direct sunlight.
- **Secondary (Red):** Used for "Owned" status indicators, providing an immediate visual "stop" or warning.
- **Tertiary (Blue):** The "Duck Blue" serves as the core professional brand color, used for navigation, headers, and active UI states.
- **Neutral:** A deep charcoal-gray instead of pure black is used for text and borders to maintain professional warmth and reduce eye strain.

The color mode is locked to **Light** by default to maximize contrast for outdoor legibility.

## Typography

The typography system is split into three functional roles:
1. **Expressive Numerics (`anybody`):** Used for magazine issue numbers and large status headings. It is bold and impactful to facilitate quick scanning.
2. **Professional Interface (`hankenGrotesk`):** A clean, modern sans-serif for metadata, descriptions, and list items.
3. **Data/Action Labels (`jetbrainsMono`):** Monospaced labels are used for technical details (ISBN, dates) and button text to emphasize the "utilitarian" nature of the tool.

**Outdoor Optimization:** Use `body-lg` as the default for most lists to ensure readability in glare. Titles should always use `headline-lg` or larger.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a focus on high-density data lists. 

- **Flea Market Mode:** For list views, vertical spacing is tightened (`gutter-list`) to maximize the number of items visible on a single screen, reducing the need for excessive scrolling.
- **Action Zone:** Interactive elements like the "SCANNER" button must maintain a minimum `touch-target` of 48px to accommodate one-handed use while walking.
- **Safe Zones:** High-contrast margins (16px) separate the camera preview from the control UI to prevent accidental triggers during the identification phase.

## Elevation & Depth

This design system uses **Tonal Layers** and **Low-contrast Outlines** rather than heavy shadows. This approach maintains high readability under sunlight, where subtle shadows often vanish.

- **Surface Levels:** The background uses a flat light gray. Primary cards use a pure white surface with a 1px solid border in the `neutral` color at 10% opacity.
- **The "Vault" Effect:** Modal overlays for identification results (Red/Green) use a high-opacity backdrop (80% blur) to focus the user's attention entirely on the result.
- **Active States:** Instead of elevation, active or pressed states are indicated by a "toggled" background color (e.g., a button turning from Primary Yellow to a slightly darker gold).

## Shapes

The shape language is **Rounded**, balancing the "utilitarian" precision with a friendly, comic-inspired feel.

- **Cards & Inputs:** 0.5rem (8px) corners provide a modern, Material Design 3 aesthetic.
- **Primary Buttons:** Use a **Pill-shaped** (Full Rounded) style for the "SCANNER" and "ADD" buttons to make them feel distinct and tactile.
- **Status Badges:** Small items (like "N° 547") should use sharp 0.25rem corners to look like vintage library tags or archive labels.

## Components

- **Scanner Button:** The hero component. It should be a large, pill-shaped button using the `primary_color` (Yellow) with a bold duck or camera icon.
- **Collection Cards:** High-density cards featuring a small thumbnail, the issue number in `numeric-hero` (scaled down), and the title in `headline-sm`.
- **Status Indicators:** Large, full-width banners at the top of the result screen. 
    - *Owned:* Red background, white `headline-lg` text.
    - *Missing:* Green background, white `headline-lg` text.
- **Input Fields:** Outlined style with a 2px stroke when active, using the `tertiary_color` (Blue) to signify focus. Labels should use `label-md`.
- **Chips:** Used for metadata like "French Edition" or "1984". These use a light `surface-duck-egg` background with `tertiary` text.
- **Lists:** Clean vertical lists with divider lines (1px) in a light neutral tone. The "swipe-to-delete" or "swipe-to-edit" pattern should be utilized for fast collection management.