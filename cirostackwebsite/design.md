# CiroStack Design System Audit & Recommendations

## 1. Current Design System Inventory

### Typography

| Role | Font | Weights | Usage |
|------|------|---------|-------|
| Display (headings) | Space Grotesk | 400, 500, 600, 700 | h1-h6, brand name, section titles |
| Body | Inter | 400, 500, 600 | Paragraphs, UI text, navigation |

**Loading**: `next/font/google` (layout.tsx) + `@fontsource` imports (styles/globals.css)

**Issue: Double font loading.** Fonts are loaded via both `next/font/google` in layout.tsx AND `@fontsource` CSS imports in styles/globals.css. This means the browser downloads each font twice. Pick one method — `next/font/google` is preferred for Next.js (automatic optimization, subsetting, self-hosting).

**Heading styles**: `font-weight: 600`, `letter-spacing: -0.02em` (set in app/globals.css). This tight tracking works well for large display sizes but becomes slightly cramped at `text-sm`/`text-base` on labels and badges.

**Recommendation**: Keep Space Grotesk + Inter. Remove `@fontsource` imports. Loosen letter-spacing on headings smaller than `text-xl` to `-0.01em` or `0`.

---

### Color System

The site has **two parallel color systems** that partially conflict:

#### System 1: HSL CSS Variables (styles/globals.css — shadcn/ui tokens)
```
--primary:            0 72% 51%    → #D63A3A (warm red)
--accent:             217 91% 60%  → #4A8FF7 (blue)
--background:         40 100% 97%  → #FFF8F0 (warm cream)
--foreground:         20 14% 15%   → #2B2420 (warm charcoal)
--muted-foreground:   20 10% 40%   → #706358
--border:             33 30% 85%   → #E1D5C7
--trust:              152 60% 40%  → #29A36B (green)
```

#### System 2: Direct hex values (app/globals.css — @theme block)
```
--color-brand:        #E82121      (brighter red)
--color-brand-dark:   #C41B1B
--color-brand-light:  #F04040
--color-ai:           #7C3AED      (purple)
--color-bg:           #FFFAF5      (slightly different cream)
--color-text:         #2A2420
--color-border:       #EDE5D8
```

**Issue: The two reds don't match.** `--primary` resolves to approximately `#D63A3A` while `--color-brand` is `#E82121`. Components using `text-primary` get one red; components using `text-brand` get another. This creates subtle visual inconsistency.

**Issue: Two separate dark mode definitions.** styles/globals.css defines `.dark` with one set of values; app/globals.css defines `.dark` with different values. The cascade means whichever loads last wins — fragile and confusing.

**Recommendation:**
- **Consolidate to a single file.** Move everything into styles/globals.css (the shadcn/ui canonical location)
- **Pick one red.** `#E82121` is more vibrant and distinctive — use it as `--primary`
- **Integrate the AI purple** (`#7C3AED`) into the shadcn token system as `--accent` instead of the current blue
- **Remove app/globals.css entirely** or reduce it to just the `@import "tailwindcss"` directive, with all custom properties in styles/globals.css

### Proposed Consolidated Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--primary` | `#E82121` (CiroStack red) | `#E82121` | CTAs, links, brand accents |
| `--accent` | `#7C3AED` (AI purple) | `#A78BFA` | AI features, gradient endpoint, secondary accent |
| `--background` | `#FFFAF5` (warm cream) | `#0A0E1A` (deep navy) | Page backgrounds |
| `--foreground` | `#2A2420` (warm charcoal) | `#F1F5F9` (near white) | Body text |
| `--card` | `#FFFBF8` | `#0F1629` | Card surfaces |
| `--muted` | `#F7F1E8` | `#141E35` | Subtle backgrounds |
| `--muted-foreground` | `#6B6560` | `#94A3B8` | Secondary text |
| `--border` | `#EDE5D8` | `#1E2A45` | Dividers, borders |
| `--success` | `#10B981` | `#10B981` | Positive states |
| `--warning` | `#F59E0B` | `#F59E0B` | Caution states |
| `--destructive` | `#EF4444` | `#EF4444` | Error states |
| `--trust` | `#29A36B` | `#34D399` | Trust signals, verification |

### The Gradient
```css
background: linear-gradient(135deg, #E82121 0%, #7C3AED 100%);
```
This red-to-purple gradient is the brand's most distinctive visual element. Use it sparingly:
- Hero headline text (`text-gradient`)
- Primary CTA button hover states
- Decorative accent lines
- OG image overlays

Do NOT use it on: body text, large background fills, or anywhere it competes with readability.

---

### Spacing & Layout

| Token | Value | Usage |
|-------|-------|-------|
| Container max-width | 1400px (2xl) | Page content width |
| Container padding | 2rem | Horizontal gutter |
| Section padding | `py-20 md:py-28 lg:py-32` | Vertical rhythm between sections |
| Border radius | 0.75rem (lg), 0.5rem (md), 0.25rem (sm) | Card corners, buttons |

**Assessment**: Spacing is generous and consistent. The `section-padding` utility ensures even vertical rhythm. No changes needed.

**One issue**: The container padding is set to `2rem` in tailwind.config.ts but components use `px-4 md:px-6` (1rem/1.5rem). These don't conflict (px-4 overrides the config) but it's confusing. Standardize on `px-4 md:px-6` in components and remove the config padding.

---

### Component Patterns

#### Cards
```
surface-glass: bg-card/60 backdrop-blur-xl border border-border/50
hover-lift: transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
```
Cards use a frosted glass effect with lift-on-hover. This is visually appealing but:
- `backdrop-blur-xl` is GPU-intensive — on pages with 10+ cards (industry listings), this can cause jank on mid-range devices
- The 60% opacity means card content is harder to read when cards overlap scrolling content

**Recommendation**: Use `bg-card` (solid) for content-heavy cards and reserve `surface-glass` for decorative/hero elements.

#### Buttons
Buttons use shadcn/ui defaults with `rounded-full` override on CTAs. Primary buttons are red (#E82121 area), outline buttons use border-white/20 on dark backgrounds.

**Issue**: The rounded-full pills and the rounded-lg default buttons both appear on the same pages, creating visual inconsistency. Pick one shape language.

**Recommendation**: Use `rounded-full` for all primary CTAs and `rounded-lg` for secondary/utility buttons. Document this distinction.

#### Section Badges
```html
<span class="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
  Badge Text
</span>
```
These eyebrow badges are used consistently via `SectionHeading`. Good pattern — keep it.

#### Hero Pattern
Full-viewport-height hero with background image, dark overlay (`bg-black/60` or gradient), and centered/left-aligned white text. Consistent across PageHero and HeroSlider.

**Issue**: Hero images are loaded as `<img>` tags with `fetchPriority="high"` but no `<source>` or responsive sizing. A 4K hero image downloads at full resolution on mobile.

**Recommendation**: Use `next/image` with `fill` and `sizes` prop, or at minimum add `srcSet` with responsive breakpoints.

---

### Animations

| Animation | Library | Usage |
|-----------|---------|-------|
| `fadeUp` | Framer Motion | Section headings, cards, hero elements |
| `fade-in` | CSS keyframes | Generic fade |
| `slideInRight` | CSS keyframes | Dropdown menus |
| `marquee` | CSS keyframes | Testimonial carousel |
| `float` | CSS keyframes | Decorative elements |
| `accordion-down/up` | CSS keyframes | Radix accordion |

**Issue (flagged in refine.md)**: Nearly every section uses Framer Motion `whileInView` with `fadeUp`. On long pages (industry detail pages have 8-10 sections), the constant "popping in" feels like the page is loading slowly rather than animating gracefully.

**Recommendation:**
- Keep animations on the first 2-3 viewport sections (hero, services, process)
- Below the fold, use CSS `animation: fadeIn 0.3s ease forwards` with `IntersectionObserver` instead of Framer Motion — lighter weight
- Remove animation entirely from dense content sections (FAQ, testimonial grids, feature lists)
- The `marquee` animation on testimonials is good — it's functional, not decorative

---

## 2. Dark Mode

Dark mode is implemented and functional with:
- `next-themes` for toggle state
- CSS variable overrides in `.dark` class
- `ThemeToggle` component in navbar
- `section-alt` utility that inverts to dark surfaces in light mode and even darker in dark mode

**Issue**: The `section-alt` utility forces dark styling in light mode (warm charcoal background `20 14% 15%`). This is a bold design choice that works for visual contrast, but it means the "light mode" experience is actually a mixed light/dark layout. This can feel disorienting.

**Recommendation**: Keep `section-alt` but soften it in light mode. Instead of going full dark, use the warm cream palette at a deeper shade:
```css
.section-alt {
  --background: 33 40% 92%;  /* warm gray instead of dark charcoal */
  --card: 33 40% 95%;
  --muted-foreground: 20 10% 45%;
  --border: 33 30% 82%;
}
```
This maintains visual rhythm without the jarring light-dark-light-dark striping.

---

## 3. Responsive Design

### Breakpoints (Tailwind defaults)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1400px (container max)

### Mobile Observations
- Navbar collapses to a hamburger at `lg` (1024px) — good threshold
- Mobile menu is a full-screen overlay with accordion navigation — well implemented
- Hero text scales from `text-4xl` to `text-7xl` — appropriate range
- Cards stack to single column on mobile — correct
- Container gutters shrink from 24px to 16px on mobile — could be tighter on small phones

### Issues
- **Industry mega-menu**: 200 items in accordion on mobile. Even with nested accordions, this is overwhelming. Most users won't scroll through 20 categories x 10 items
- **WhatsApp popup**: Always visible on mobile — can obscure content and feels aggressive

### Recommendations
- On mobile, replace the industry mega-menu with a search bar + top 5 featured industries
- Make the WhatsApp popup dismissible and don't show it for the first 30 seconds of a session
- Test hero text at 320px viewport width — `text-4xl` (2.25rem/36px) may need to drop to `text-3xl` on very small screens

---

## 4. Accessibility

### Current State
- No skip-navigation link
- No ARIA labels on many interactive elements (flagged in refine.md)
- Color contrast concerns with `muted-foreground` on light backgrounds
- Keyboard navigation incomplete for mega-menus

### Contrast Check (approximate)

| Text | Background | Ratio | WCAG AA |
|------|-----------|-------|---------|
| `#2A2420` on `#FFFAF5` | Body text | ~14:1 | Pass |
| `#6B6560` on `#FFFAF5` | Muted text | ~5.2:1 | Pass |
| `#94A3B8` on `#FFFAF5` | Subtle text | ~3.1:1 | **Fail** (needs 4.5:1) |
| `#E82121` on `#FFFAF5` | Brand links | ~4.2:1 | **Borderline** |
| `#FFFFFF` on `#E82121` | Button text | ~4.0:1 | **Borderline** |

### Recommendations
- Add skip-nav link: `<a href="#main" class="sr-only focus:not-sr-only">Skip to content</a>`
- Darken `--text-subtle` from `#94A3B8` to `#6B7B8D` to meet AA
- Darken `--primary` slightly to `#C41B1B` for better contrast on white, or use `#E82121` only on dark backgrounds
- Add `aria-label` to all icon-only buttons (search, theme toggle, mobile menu)
- Implement focus trap in mega-menu and mobile menu

---

## 5. Performance Considerations

### Current Weight Concerns
- **Three.js** (HeroGlobe, ParticleNetwork): ~500KB+ for a decorative globe. Not used on most pages but bundled if imported
- **Framer Motion**: ~100KB for animations that could be CSS
- **@fontsource imports**: Duplicate font loading alongside next/font
- **industries-generated.ts**: 34K lines loaded on every industry page

### Recommendations
1. **Lazy-load Three.js**: `dynamic(() => import('./HeroGlobe'), { ssr: false })` — only load on homepage
2. **Replace Framer Motion** with CSS animations for simple fade/slide effects. Keep FM only for complex interactions (accordion, menu transitions)
3. **Remove @fontsource** — next/font handles everything
4. **Split industry data** by category so each page loads only its own data (~1.7K lines instead of 34K)
5. **Add responsive image sources** to hero images — serve WebP at appropriate sizes

---

## 6. Design Tokens — Recommended Final System

### File: `src/styles/globals.css` (single source of truth)

```
:root {
  /* Brand */
  --brand:           #E82121;
  --brand-dark:      #C41B1B;
  --brand-light:     #F04040;
  --accent:          #7C3AED;
  --accent-light:    #A78BFA;

  /* Gradient */
  --gradient:        linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%);

  /* Surfaces (light) */
  --bg:              #FFFAF5;
  --surface:         #FFFBF8;
  --surface-2:       #F7F1E8;
  --card:            #FFFFFF;

  /* Text (light) */
  --text:            #2A2420;
  --text-muted:      #6B6560;
  --text-subtle:     #6B7B8D;  /* darkened for a11y */

  /* Borders (light) */
  --border:          #EDE5D8;
  --border-strong:   #D9CBBC;

  /* Semantic */
  --success:         #10B981;
  --warning:         #F59E0B;
  --danger:          #EF4444;
  --info:            #4FA3FF;

  /* Spacing */
  --radius:          0.75rem;
}

.dark {
  --bg:              #0A0E1A;
  --surface:         #0F1629;
  --surface-2:       #141E35;
  --card:            #111827;
  --text:            #F1F5F9;
  --text-muted:      #94A3B8;
  --text-subtle:     #64748B;
  --border:          #1E2A45;
  --border-strong:   #2A3A58;
}
```

---

## 7. Design Debt & Cleanup Priorities

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | Two CSS files with conflicting color definitions | High | Consolidate into styles/globals.css |
| 2 | Double font loading (next/font + @fontsource) | Medium | Remove @fontsource imports |
| 3 | `section-alt` creates jarring light/dark striping | Medium | Soften to warm gray in light mode |
| 4 | `surface-glass` on content cards causes GPU strain | Medium | Use solid `bg-card` for content cards |
| 5 | Mixed button radius (rounded-full vs rounded-lg) | Low | Standardize: pill for CTAs, rounded-lg for utility |
| 6 | No responsive image handling for heroes | Medium | Use next/image or srcSet |
| 7 | Animation overuse below the fold | Low | Limit Framer Motion to top 3 sections |
| 8 | `--text-subtle` fails WCAG AA contrast | High | Darken to #6B7B8D |
| 9 | No skip-nav, incomplete ARIA labels | High | Add skip link, audit interactive elements |
| 10 | Three.js loaded without dynamic import | Medium | Wrap in `dynamic({ ssr: false })` |

---

## 8. Visual Identity Checklist

What exists today vs. what a mature brand needs:

| Asset | Status | Action |
|-------|--------|--------|
| Wordmark (Ciro**Stack**) | Exists (text-only in code) | Formalize as SVG |
| Logo icon | Exists (logo.png, small) | Redesign as scalable SVG |
| Favicon | Exists (.ico + .png) | Ensure consistency with new logo |
| OG image | Generic hero-bg.jpg | Create branded template with logo + gradient |
| Color palette | Exists but fragmented | Consolidate (see section 6) |
| Typography scale | Exists via Tailwind | Document heading sizes + line heights |
| Icon style | Lucide (consistent) | Good — no change needed |
| Illustration style | None | Consider light line illustrations for empty states and error pages |
| Photography style | Stock images, generic | Define a photo direction: diverse teams, real workspaces, warm lighting |
| Motion language | Exists but overused | Define when to animate vs. when to be static |
| Email templates | None visible | Create branded templates for contact form confirmations and newsletter |
| Social media templates | None visible | Create templates for blog post sharing, case study announcements |
| Pitch deck template | None visible | Create branded slide deck for sales calls |
