---
name: Gamified Dark ICT
colors:
  surface: '#09151a'
  surface-dim: '#09151a'
  surface-bright: '#2f3b40'
  surface-container-lowest: '#041015'
  surface-container-low: '#111d22'
  surface-container: '#152126'
  surface-container-high: '#202c31'
  surface-container-highest: '#2a373c'
  on-surface: '#d7e5eb'
  on-surface-variant: '#becbb1'
  inverse-surface: '#d7e5eb'
  inverse-on-surface: '#263237'
  outline: '#88957d'
  outline-variant: '#3f4a36'
  surface-tint: '#6be026'
  primary: '#74e930'
  on-primary: '#133800'
  primary-container: '#58cc02'
  on-primary-container: '#1e5000'
  inverse-primary: '#2b6c00'
  secondary: '#88ceff'
  on-secondary: '#00344d'
  secondary-container: '#00a8ed'
  on-secondary-container: '#003954'
  tertiary: '#fec800'
  on-tertiary: '#3e2e00'
  tertiary-container: '#ddad00'
  on-tertiary-container: '#574300'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#87fe45'
  primary-fixed-dim: '#6be026'
  on-primary-fixed: '#082100'
  on-primary-fixed-variant: '#1f5100'
  secondary-fixed: '#c8e6ff'
  secondary-fixed-dim: '#88ceff'
  on-secondary-fixed: '#001e2e'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#ffdf92'
  tertiary-fixed-dim: '#f4bf00'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#09151a'
  on-background: '#d7e5eb'
  surface-variant: '#2a373c'
  ecto-green-dark: '#46a302'
  macaw-blue-dark: '#1899d6'
  lightning-gold: '#ffc800'
  crimson-heart: '#ff4b4b'
  crimson-heart-dark: '#d92f2f'
  card-dark: '#1b2e35'
  card-border: '#2b4754'
  text-muted: '#89a3af'
  gray-inactive: '#37464f'
  gray-inactive-dark: '#242e34'
typography:
  display-lg:
    fontFamily: Nunito Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: 0.04em
  display-sm:
    fontFamily: Nunito Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: 0.03em
  headline-lg:
    fontFamily: Nunito Sans
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 34px
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Nunito Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: 0.02em
  headline-sm:
    fontFamily: Nunito Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 26px
  body-md:
    fontFamily: Nunito Sans
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
  body-sm:
    fontFamily: Nunito Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-lg:
    fontFamily: Nunito Sans
    fontSize: 15px
    fontWeight: '800'
    lineHeight: 20px
    letterSpacing: 0.06em
  label-md:
    fontFamily: Nunito Sans
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Nunito Sans
    fontSize: 11px
    fontWeight: '800'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

# Termy — AL ICT MCQ Learning Platform
> Duolingo dark-mode gamified learning mechanics tailored for A/L ICT multiple-choice questions

**Theme:** dark

Termy is a gamified A/L (Advanced Level) Information and Communication Technology (ICT) exam prep web app styled with Duolingo's dark UI aesthetic (#131f24 / #000437 dark surfaces, vibrant #58cc02 green, #1cb0f6 cyan, #ffc800 gold, #ff4b4b red accents, tactile 3D borders, playful chunky buttons, progress path / skill tree, XP leaderboards, and streak tracking). Explicit constraint: NO MASCOT (no Duo the owl, no character cartoon mascots). All focus is clean tech/computing iconography (terminals, binary, logic gates, chips, code, flowcharts) and multiple-choice questions (AL ICT syllabus: Number systems, Logic gates, Networking, Python programming, Database, Web dev, Systems analysis).

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Ecto Green | `#58cc02` | `--color-ecto-green` | Primary success & active path nodes, CTA buttons, correct answers |
| Ecto Green Dark | `#46a302` | `--color-ecto-green-dark` | 3D pressable bottom border for green CTA buttons |
| Macaw Blue | `#1cb0f6` | `--color-macaw-blue` | Practice / secondary action accent, active tabs, info badges |
| Macaw Blue Dark | `#1899d6` | `--color-macaw-blue-dark` | 3D bottom border for blue buttons |
| Lightning Gold | `#ffc800` | `--color-lightning-gold` | XP, crowns, streaks, completed milestone chests |
| Crimson Heart | `#ff4b4b` | `--color-crimson-heart` | Hearts, errors, incorrect MCQ options |
| Background Dark | `#131f24` | `--color-bg-dark` | App background, matching Duolingo dark theme |
| Card Dark | `#1b2e35` | `--color-card-dark` | Navigation panel, quest cards, question cards, stats box |
| Card Dark Border | `#2b4754` | `--color-border-dark` | Distinctive 2px tactile structural borders |
| Text Primary | `#ffffff` | `--color-text-primary` | Main titles, question prompts, active text |
| Text Muted | `#89a3af` | `--color-text-muted` | Secondary hints, explanations, syllabus tags |
| Gray Inactive | `#37464f` | `--color-gray-inactive` | Locked nodes, disabled states, empty progress tracks |

## Tokens — Typography

### din-round — Primary UI & Display Typeface
- **Substitute:** Nunito, Quicksand, DM Sans
- **Weights:** 500, 700, 800
- **Tracking:** 0.04em

## Components

### Duolingo 3D Button
Chunky rounded button (radius: 16px) with a 4px solid darker bottom border creating the signature tactile pressable mechanical feel.

### MCQ Interactive Option Card
Tactile option cards with key indicators [A, B, C, D], rounded 16px, 2px borders with 3D bottom border. Selected state glows in Macaw Blue or Ecto Green.

### AL ICT Skill Learning Path (Stepping Stones)
The central serpentine curved path of circular lesson nodes (Logic Gates, Python Loops, SQL Queries, Binary Arithmetic, OSI Model). Completed nodes display checkmarks or crowns; current node is highlighted and pulsing; locked nodes are gray with padlocks. No animal mascots.

### Top Status Bar & Sidebar Navigation
Sidebar has Termy terminal/code logo, Learn, Practice, Leaderboard, Quests, Syllabus Stats. Top header displays Current Topic (AL ICT Unit), Flame Streak, Gem/Bit count, and Hearts (Life).
