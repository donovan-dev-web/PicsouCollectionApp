---
name: Obsidian Vault
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#cfc6ac'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#989079'
  outline-variant: '#4c4733'
  surface-tint: '#e8c41d'
  primary: '#fff6e2'
  on-primary: '#3a3000'
  primary-container: '#fdd835'
  on-primary-container: '#715e00'
  inverse-primary: '#705d00'
  secondary: '#ffb3ae'
  on-secondary: '#68000c'
  secondary-container: '#a00118'
  on-secondary-container: '#ffa8a3'
  tertiary: '#eff8ff'
  on-tertiary: '#003548'
  tertiary-container: '#ade1ff'
  on-tertiary-container: '#006789'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe16e'
  primary-fixed-dim: '#e8c41d'
  on-primary-fixed: '#221b00'
  on-primary-fixed-variant: '#544600'
  secondary-fixed: '#ffdad7'
  secondary-fixed-dim: '#ffb3ae'
  on-secondary-fixed: '#410004'
  on-secondary-fixed-variant: '#930015'
  tertiary-fixed: '#c2e8ff'
  tertiary-fixed-dim: '#75d1ff'
  on-tertiary-fixed: '#001e2b'
  on-tertiary-fixed-variant: '#004d67'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  surface-raised: '#1e1e1e'
  surface-overlay: '#2c2c2c'
  text-primary: '#ffffff'
  text-secondary: '#b0b0b0'
  status-owned: '#ff5252'
  status-missing: '#66bb6a'
  accent-gold: '#fdd835'
typography:
  numeric-hero:
    fontFamily: anybody
    fontSize: 64px
    fontWeight: '900'
    lineHeight: 64px
    letterSpacing: -0.02em
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

The brand personality is **Elite**, **Sleek**, and **Technical**. Moving from the high-glare outdoor focus of its predecessor, the design system adopts a sophisticated dark-mode aesthetic designed for serious collectors who curate their treasures in focused environments. It maintains the "treasure hunt" optimism but pivots toward a "digital vault" narrative.

The design style is **Minimalism** meets **Glassmorphism**. It utilizes deep, ink-like surfaces and luminous accents to create a sense of depth and preciousness. The UI feels like a high-end security interface—precise, responsive, and premium. High-contrast typography and neon-inflected yellow accents ensure that the utilitarian core remains intact while achieving a modern, nocturnal elegance.

## Colors

The palette is optimized for OLED displays and low-light environments, prioritizing eye comfort and visual hierarchy through luminance.

- **Primary (Vibrant Yellow):** The core legacy accent. It is used as a "luminous" trigger for high-priority actions like the Scanner. Against the dark background, this yellow acts as a beacon.
- **Surface Strategy:** The base environment is `#121212`. Elevated components like cards and menus use `#1e1e1e`. This 2-tier dark system provides structural clarity without the harshness of pure black.
- **Secondary (Red) & Tertiary (Cyan):** "Owned" status shifts to a vibrant `#ff5252` to maintain urgency, while the brand blue evolves into a brighter `#4fc3f7` to ensure it "pops" against deep grays.
- **Typography:** High-contrast white (`#ffffff`) is reserved for titles and critical data, while light gray (`#b0b0b0`) handles secondary metadata to prevent visual fatigue.

## Typography

Typography maintains a strict functional hierarchy. The use of `anybody` for large numerics provides a bold, collectible character that feels both vintage and futuristic when set in white against dark surfaces.

`hankenGrotesk` provides a sharp, high-legibility interface for descriptive text, while `jetbrainsMono` is used for "hard data" points like serial numbers or dates. This monospaced font reinforces the "technical vault" aesthetic. To ensure accessibility in dark mode, font weights for body text should never drop below 400, as thin white text on dark backgrounds can cause "haloing" or blurring for users with astigmatism.

## Layout & Spacing

The layout utilizes a **Fluid Grid** that prioritizes scanning speed. 

- **Vertical Rhythm:** A tight 8px base unit allows for high information density. In list views, the 12px gutter ensures items are distinct without wasting precious screen real estate.
- **Responsive Behavior:** On mobile, margins are locked to 16px to ensure content does not bleed into the bezel, maintaining the "contained" vault feel. On larger screens, the content containers remain centered with a max-width of 1200px to prevent excessive line lengths in descriptions.
- **Interactive Zones:** All interactive elements strictly adhere to a 48px minimum touch target, ensuring that even in a fast-paced collection environment, actions are deliberate and accurate.

## Elevation & Depth

In the dark mode transition, hierarchy is communicated through **Tonal Layers** and **Glassmorphism**.

- **Atmospheric Depth:** The background is the lowest layer. Surface cards "float" above it by being slightly lighter (`#1e1e1e`). 
- **Backdrop Blurs:** For modals and overlays, use a semi-transparent surface (60% opacity) with a heavy background blur (20px). This keeps the context of the collection visible while bringing the focused task to the foreground.
- **Luminous Borders:** Instead of shadows, which can look muddy in dark mode, use a 1px inner stroke on cards with a low-opacity white (10%) to define edges. For active elements, this stroke should transition to the Primary Yellow or Tertiary Cyan.

## Shapes

The shape language is **Rounded**, providing a sophisticated and modern feel that balances the "technical" typography.

- **Primary Actions:** Full pill-shapes (rounded-xl) are reserved for the most important actions, such as the Scanner and Add buttons, making them feel like physical tools.
- **Container Logic:** Standard cards and input fields use a 0.5rem (8px) radius. This creates a clean, systematic appearance that aligns with modern OS standards.
- **Micro-Elements:** Status tags and small data badges use a tighter 0.25rem radius to distinguish them as "metadata" rather than primary interactive containers.

## Components

- **Scanner Button:** A floating, pill-shaped button. In dark mode, it uses the `primary_color_hex` (#fdd835) with a black icon for maximum contrast.
- **Collection Cards:** Dark surfaces (`#1e1e1e`) with a subtle 1px border. The issue number should be displayed in `numeric-hero` at a reduced size in white.
- **Status Banners:** 
    - *Owned:* A deep red wash with bright white text.
    - *Missing:* A deep emerald wash with bright white text.
- **Input Fields:** Darker than the surface background (`#0a0a0a`) with a 1px border that glows Cyan when focused. Labels must use `label-md` in light gray.
- **Chips:** Small, technical labels with a subtle border and monospaced text. They should feel like "stamps" on a digital record.
- **Navigation:** Use a bottom navigation bar with a glassmorphic blur. The active state is indicated by a glowing Primary Yellow dot or icon change.