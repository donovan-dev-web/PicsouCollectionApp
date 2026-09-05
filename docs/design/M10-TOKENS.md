# M-10 — Tokens finaux « Vault Lisible »

## Couleurs

| Token | Light (Vault & Venture) | Dark (Obsidian Vault) | Usage |
|---|---|---|---|
| `text` | `#001B3D` | `#FFFFFF` | texte courant |
| `textSecondary` | `#404B5E` | `#B0B6C2` | secondaire ≥14px (ex-`#5A6478` trop clair) |
| `background` | `#FFFFFF` | `#0B1B33` | fond écran |
| `backgroundElement` | `#F0F3F7` | `#16304F` | cartes, inputs |
| `accent` | `#FDD835` | `#FDD835` | **fonds de boutons uniquement** |
| `accentText` | `#1F1B00` | `#1F1B00` | texte sur `accent` |
| `accentTextOnLight` | `#5C5200` | — | texte « jaune » lisible sur fond clair (remplace `colors.accent` en texte) |
| `navActive` | `#00629E` | `#4FC3F7` | TabBar actif (jamais jaune sur blanc) |
| `success` | `#1B7F3B` | `#7BC67E` | **Possédé** (vert positif, inversé) |
| `onSuccess` | `#FFFFFF` | `#062B0A` | texte sur succès |
| `ownedBg` | `#E6F4EA` | `rgba(123,198,126,0.16)` | fond badge Possédé |
| `danger` | `#B3261E` | `#F2B8B5` | destructif |
| `absentBg` | `#E8EDF3` | `rgba(176,182,194,0.16)` | fond badge Absent (neutre, ex-vert) |
| `absentText` | `#404B5E` | `#B0B6C2` | texte Absent neutre |

Règle : **jamais `#FDD835` en texte sur fond clair** (ratio ~1.6:1). Jaune = fond bouton
ou texte sur fond sombre uniquement.

## Typographie

- `display-lg 48/56 anybody 800` (compteur), `headline 24/32`, `title 20/28`,
  `body 16/24`, `body-sm 14/20`, `label 13/18 min` (ex-12px interdits en UI).
- `hankenGrotesk` interface, `anybody` N°, `jetbrainsMono` ISBN/dates.

## Spacing / cibles

- `0/4/8/12/16/24/32`, marges écran 16-24, `minHeight 44`, `hitSlop 8`,
  icônes TabBar 24px, labels 12px, chevrons 20px.

## Icônes (Feather via @expo/vector-icons)

`home, book-open, settings, camera, plus, x, chevron-left/right, check-circle,
x-circle, search, upload, download, arrow-left`. 0 emoji UI.
