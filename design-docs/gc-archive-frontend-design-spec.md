# Pulpit GC Archive — Frontend Design Specification

## For Claude Code / Gemini CLI: This document defines every visual and interaction decision for the frontend. Follow it precisely for design consistency.

---

## 1. Design Philosophy

This is a **scholarly editorial** project — not a SaaS app, not a church website, not a generic dashboard. The closest visual analogues are:

- **The Joseph Smith Papers** (josephsmithpapers.org) — authoritative, dignified, text-focused
- **The Wilford Woodruff Papers** (wilfordwoodruffpapers.org) — warm, accessible, document-centric
- **Stripe's documentation** — clean, generous spacing, beautiful typography
- **A well-designed university press book** — understated, refined, intellectual

The design should communicate: *"This was made by people who care deeply about historical accuracy and treat these records with respect."* It should feel like opening a beautifully typeset volume, not like logging into a project management tool.

### One-Line Aesthetic
**Warm scholarly minimalism** — high-contrast serif typography, abundant whitespace, muted earth tones, no decoration that doesn't serve comprehension.

### What Makes This Unforgettable
The `fidelity` metadata system. No other resource tells you *how trustworthy* each transcript is. The design should make provenance and fidelity information feel like a first-class citizen, not a footnote — color-coded, always visible, elegantly integrated.

---

## 2. Typography

### Font Stack

**Display / Headings:** `"Newsreader"` from Google Fonts
- A modern editorial serif with excellent screen rendering. Designed specifically for long-form reading at screen resolutions. Has optical sizing. It feels like a sophisticated newspaper or journal — authoritative but warm, not stiff.
- Use weights 400 (for large hero text) and 600 (for section headings). Use italic for emphasis and pull quotes.
- Fallback: `"Georgia", "Times New Roman", serif`

**Body / UI:** `"Source Serif 4"` from Google Fonts
- A refined serif for body text. Highly readable at small sizes, designed by Frank Grießhammer for Adobe. Works beautifully for long-form transcript reading.
- Use weight 400 for body text, 600 for bold/emphasis.
- Fallback: `"Georgia", serif`

**Monospace / Metadata / Labels:** `"IBM Plex Mono"` from Google Fonts
- For dates, source citations, metadata labels, technical info, code snippets in the guide.
- Use weight 400, size slightly smaller than body text (~0.85em).
- Fallback: `"Menlo", "Consolas", monospace`

**UI Elements / Navigation / Buttons:** `"Inter"` from Google Fonts
- The one sans-serif in the stack. Only for navigation links, button text, filter labels, badges, and other small UI chrome.
- Use weight 400 and 500. Never for headings or body text.
- Fallback: `system-ui, sans-serif`

### Type Scale

Use a modular scale based on 1.25 (major third). Base size: `18px` (1.125rem) for body text.

```
--text-xs:    0.75rem    (12px)  — metadata labels, timestamps
--text-sm:    0.875rem   (14px)  — captions, badges, secondary info
--text-base:  1.125rem   (18px)  — body text, transcript content
--text-lg:    1.25rem    (20px)  — lead paragraphs, introductions
--text-xl:    1.5rem     (24px)  — section headings (h3)
--text-2xl:   1.875rem   (30px)  — page headings (h2)
--text-3xl:   2.25rem    (36px)  — major headings (h1)
--text-4xl:   3rem       (48px)  — hero text, landing page title
--text-5xl:   3.75rem    (60px)  — dramatic hero on landing page only
```

### Line Heights
- Body text: 1.7 (generous — this is for reading transcripts)
- Headings: 1.2
- UI elements: 1.4

### Letter Spacing
- Body text: normal
- Headings: -0.01em (very slight tightening)
- All-caps labels: 0.08em (tracking for readability)
- Metadata/mono: 0.02em

### Paragraph Spacing
- Paragraphs within transcript text: `margin-bottom: 1.5em`
- Between sections: `margin-top: 3rem`

---

## 3. Color Palette

### CSS Custom Properties

```css
:root {
  /* === PRIMARY PALETTE === */
  --color-ink:           #1a1a1a;     /* Primary text — near-black, never pure black */
  --color-ink-secondary: #4a4a4a;     /* Secondary text, captions */
  --color-ink-tertiary:  #7a7a7a;     /* Disabled, placeholder, timestamps */

  --color-paper:         #faf8f5;     /* Primary background — warm off-white, like aged paper */
  --color-paper-warm:    #f3efe8;     /* Slightly darker background for cards/sections */
  --color-paper-cool:    #f0f0ed;     /* Alternate section background */

  /* === ACCENT === */
  --color-accent:        #8b5e3c;     /* Primary accent — warm umber/brown. Used for links, active states, key CTAs */
  --color-accent-hover:  #6d4830;     /* Darker on hover */
  --color-accent-light:  #d4b896;     /* Light accent for backgrounds, borders */
  --color-accent-subtle: #efe6db;     /* Very subtle accent wash for highlighted sections */

  /* === FIDELITY COLORS (the signature feature) === */
  --fidelity-verbatim:    #2d6a4f;   /* Deep green — high confidence */
  --fidelity-near:        #4a7c59;   /* Medium green */
  --fidelity-edited:      #b8860b;   /* Dark goldenrod — caution, editorial changes */
  --fidelity-summary:     #c17817;   /* Orange-brown — significant uncertainty */
  --fidelity-reconstructed:#a0522d;  /* Sienna — heavily reconstructed */
  --fidelity-normalized:  #8b6914;   /* Dark yellow — text was modernized */

  /* === STATUS COLORS (tracker) === */
  --status-unclaimed:    #9ca3af;    /* Neutral gray */
  --status-in-progress:  #6b7de0;    /* Soft blue-purple */
  --status-in-review:    #d4a843;    /* Warm gold */
  --status-complete:     #4a8c5c;    /* Muted green */

  /* === DIFFICULTY BADGES === */
  --difficulty-easy:        #4a8c5c;
  --difficulty-medium:      #b8860b;
  --difficulty-hard:        #c17817;
  --difficulty-detective:   #a0522d;

  /* === BORDERS & DIVIDERS === */
  --color-border:        #ddd8d0;    /* Subtle warm border */
  --color-border-light:  #e8e4dc;    /* Very light divider */
  --color-border-strong: #b8b0a4;    /* Stronger border for emphasis */

  /* === SHADOWS === */
  --shadow-sm:   0 1px 3px rgba(26, 26, 26, 0.06);
  --shadow-md:   0 4px 12px rgba(26, 26, 26, 0.08);
  --shadow-lg:   0 8px 30px rgba(26, 26, 26, 0.1);
}
```

### Dark Mode (optional, implement only if time allows)
If dark mode is implemented, invert the paper/ink relationship:
```css
[data-theme="dark"] {
  --color-ink:           #e8e4dc;
  --color-ink-secondary: #b8b0a4;
  --color-paper:         #1a1917;
  --color-paper-warm:    #232220;
  --color-paper-cool:    #1e1d1b;
  --color-accent:        #d4a843;
  --color-border:        #3a3835;
}
```

---

## 4. Layout & Spacing

### Content Width
- **Max content width:** `780px` for prose/transcript reading (optimal line length for serifs at 18px)
- **Max page width:** `1200px` for tracker, guide, and wider layouts
- **Full-bleed sections** (landing page hero): `100vw`

### Spacing Scale (Tailwind-compatible)
Use multiples of 4px, with generous spacing:
```
--space-1:   0.25rem   (4px)
--space-2:   0.5rem    (8px)
--space-3:   0.75rem   (12px)
--space-4:   1rem      (16px)
--space-6:   1.5rem    (24px)
--space-8:   2rem      (32px)
--space-12:  3rem      (48px)
--space-16:  4rem      (64px)
--space-20:  5rem      (80px)
--space-24:  6rem      (96px)
```

### Section Spacing
- Between major page sections: `--space-20` to `--space-24`
- Between subsections: `--space-12` to `--space-16`
- Padding inside cards/panels: `--space-6` to `--space-8`

### The Golden Rule
**When in doubt, add more whitespace.** This is a reading-focused site. Density is the enemy.

---

## 5. Page-by-Page Design Specification

### 5.1 Landing Page (`/`)

**Structure:**

1. **Hero Section** (full-width, `--color-paper` background)
   - Large display text: project title in Newsreader italic, `--text-5xl` on desktop, `--text-3xl` on mobile
   - Subtitle: one sentence describing the project, in Source Serif, `--text-lg`, `--color-ink-secondary`
   - No image, no illustration. Let the typography be the visual.
   - Subtle horizontal rule or ornamental divider below (a thin line, or a small centered `✦` or `❧` glyph in `--color-accent-light`)

2. **Stats Strip** (centered, compact)
   - A single row of 3–4 key numbers: "X talks collected · Y conferences indexed · Z% complete"
   - IBM Plex Mono for the numbers, Source Serif for the labels
   - Numbers in `--color-accent`, labels in `--color-ink-secondary`
   - No boxes, no cards — just the numbers floating on the page

3. **Progress by Era** (visual centerpiece)
   - Five horizontal bars, one per era, labeled with date range and era name
   - Each bar shows completion percentage with a fill in the era's difficulty color
   - The bars should be thin (8px height), with rounded ends
   - Current completion numbers right-aligned: "47 / 52 sessions"
   - This is the most visually interesting section — it tells the story of the project at a glance

4. **Three Cards** (link to main sections)
   - "Volunteer Tracker" — brief description + link
   - "Collection Guide" — brief description + link
   - "About the Project" — brief description + link
   - Cards: `--color-paper-warm` background, `--shadow-sm`, `--color-border` border, `--space-6` padding
   - Card title in Newsreader, body in Source Serif
   - On hover: `--shadow-md`, border shifts to `--color-accent-light`. Subtle, not flashy.

5. **Recent Activity Feed** (optional, if time allows)
   - Last 5 claim/completion events: "Noah claimed October 1876 · 2 hours ago"
   - Small, understated, at bottom of page

**No:** navigation mega-menus, hero images, carousels, testimonials, call-to-action banners.

---

### 5.2 Volunteer Tracker (`/tracker`)

This is the most interaction-heavy page. It must be functional first, beautiful second — but it should still feel scholarly, not like Jira.

**Structure:**

1. **Header Bar** (sticky on scroll)
   - Page title: "Volunteer Tracker" in Newsreader
   - User avatar (Google profile pic) + name, right side
   - "Sign out" link in `--color-ink-tertiary`

2. **Stats Summary** (top of page, below header)
   - Compact stats row: total sessions | unclaimed | in progress | in review | complete
   - Each stat is a pill/chip showing the count, colored by its status color
   - These should be clickable as quick-filters (clicking "in progress" filters the list to only in-progress sessions)

3. **Filter Controls** (below stats, horizontal bar)
   - **Era filter:** segmented control or pill buttons for each era (all | 1830-1844 | 1845-1850 | 1850-1879 | 1881-1896 | 1897-present)
   - **Status filter:** similar pill buttons (all | unclaimed | in progress | in review | complete)
   - **Difficulty filter:** optional, same pattern
   - **"My Claims" toggle:** a switch/checkbox that shows only sessions claimed by the current user
   - **Search:** a small text input to search by year or label (for jumping to a specific conference)
   - Filters should use the sans-serif (Inter) at `--text-sm`
   - Active filters should use `--color-accent` background with white text

4. **Session List** (the main content)
   - **NOT a traditional table.** Use a card-list or stacked-row pattern — each session is a horizontal row/card.
   - Each row contains:
     - **Date** (left, prominent): "Oct 1876" in IBM Plex Mono, `--text-base`
     - **Label**: "October 1876 General Conference" in Source Serif
     - **Era badge**: small pill in the era's difficulty color, Inter font, `--text-xs`, all-caps
     - **Difficulty badge**: small pill, colored by difficulty
     - **Status badge**: pill showing current status, colored by status
     - **Claimed by**: small avatar + name if claimed, or empty if unclaimed
     - **Action button**: "Claim" (if unclaimed), "Mark Complete" (if claimed by you), or nothing (if claimed by someone else)
   - Rows should have subtle alternating backgrounds (`--color-paper` / `--color-paper-warm`) for scanability
   - Hover state: row background shifts to `--color-accent-subtle`
   - Rows should be grouped by era with a sticky sub-header for each era group

5. **Claim/Complete Modal**
   - Clean, centered modal with gentle backdrop blur
   - When claiming: just a confirmation ("Claim October 1876 General Conference?") with Claim / Cancel buttons
   - When completing: fields for talk_count (number input), notes (textarea), drive_link (text input). All optional except talk_count.
   - Modal background: `--color-paper`, border: `--color-border`, shadow: `--shadow-lg`

**Sorting:**
- Default: chronological (oldest first), grouped by era
- Optionally allow reverse-chronological
- Within each era group, sessions are always chronological

**Real-time updates:**
- When another volunteer claims or completes a session, the row should update smoothly (a brief fade/highlight animation on the changed row, then settle). No jarring full-page refreshes.

---

### 5.3 Collection Guide (`/guide`)

**Structure:**
- Rendered from the Markdown file using `react-markdown` with `remark-gfm`
- Content centered at `max-width: 780px` (optimal reading width)
- All body text in Source Serif 4 at `--text-base` with `line-height: 1.7`
- Headings in Newsreader
- Code blocks and YAML examples in IBM Plex Mono on `--color-paper-warm` background with `--color-border` left border (4px)
- Tables should be cleanly styled: no heavy grid lines. Use bottom borders only, header row in bold, alternating row backgrounds.
- A floating "Table of Contents" sidebar on desktop (left side, sticky, listing all h2 headings as anchor links). On mobile, this becomes a collapsible TOC at the top.
- At the top: a "Download as Markdown" button (small, understated, in `--color-ink-tertiary`)

**Table Styling:**
```css
table { width: 100%; border-collapse: collapse; }
th { 
  font-family: "Inter", sans-serif;
  font-weight: 500;
  text-align: left;
  padding: var(--space-3) var(--space-4);
  border-bottom: 2px solid var(--color-border-strong);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-ink-secondary);
}
td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  font-size: var(--text-sm);
}
tr:nth-child(even) { background: var(--color-paper-warm); }
```

---

### 5.4 About (`/about`)

- Simple prose page, centered at 780px
- Project description, motivation, team credits
- Acknowledgments section listing all sources (Church History Library, JSP, BYU, Internet Archive, Watson, LaJean Carruth's shorthand work, etc.)
- A note about copyright and personal use
- Contact info or link to reach the project maintainer

---

## 6. Global UI Components

### Navigation
- **Top nav bar**: fixed, clean, minimal
- Left: Project name ("GC Archive") in Newsreader italic, linked to home
- Right: nav links (Home, Tracker, Guide, About) in Inter, `--text-sm`
- If authenticated: user avatar + name, small
- Background: `--color-paper` with subtle `--color-border-light` bottom border
- **No hamburger menu on mobile.** The nav has only 4 items — they fit horizontally. Use smaller font size on mobile if needed.

### Buttons
- **Primary** (Claim, Sign In): `--color-accent` background, white text, Inter 500, rounded-md, subtle shadow
- **Secondary** (Cancel, Filter): transparent background, `--color-accent` text, `--color-border` border
- **Ghost** (Sign Out, Download): no background, no border, `--color-ink-secondary` text, underline on hover
- All buttons: `padding: --space-2 --space-6`, `font-size: --text-sm`, `transition: all 0.15s ease`

### Badges / Pills
- Small rounded pills for status, era, difficulty, fidelity
- Background: the relevant color at 15% opacity, text in the full color
- `font-family: "Inter"`, `font-size: --text-xs`, `font-weight: 500`, `text-transform: uppercase`, `letter-spacing: 0.04em`
- `padding: 2px 10px`, `border-radius: 9999px`

### Cards
- Background: `--color-paper-warm`
- Border: `1px solid var(--color-border)`
- Border-radius: `8px`
- Padding: `--space-6`
- Shadow: `--shadow-sm`
- Hover: `--shadow-md`, border-color shifts to `--color-accent-light`
- Transition: `all 0.2s ease`

### Dividers
- Horizontal rules: `1px solid var(--color-border-light)`
- Between major sections, optionally use a centered ornamental glyph: `❧` or `✦` or `◆` in `--color-accent-light`, `--text-sm`

### Loading States
- Skeleton screens for the tracker (gray shimmer bars matching row layout)
- No spinners. Use subtle opacity fade-in when data arrives.

### Empty States
- If no sessions match filters: centered message in Source Serif italic, `--color-ink-tertiary`
- Example: *"No sessions match your current filters."*

---

## 7. Responsive Behavior

### Breakpoints
```css
--bp-sm:   640px
--bp-md:   768px
--bp-lg:   1024px
--bp-xl:   1280px
```

### Mobile Adaptations (below 768px)
- Hero text: `--text-3xl` instead of `--text-5xl`
- Content max-width: full width with `--space-4` horizontal padding
- Tracker rows: stack vertically (date + label on top, badges + action below)
- Guide TOC: collapsible accordion at top instead of sidebar
- Navigation: keep all 4 links visible, reduce font size
- Stats strip: wrap to 2x2 grid instead of single row

### Tablet (768px–1024px)
- Content max-width: `780px` with `--space-6` padding
- Tracker: rows remain horizontal but tighter
- Guide: TOC sidebar disappears, becomes top-of-page

---

## 8. Animation & Motion

### Philosophy
Restraint. This is a scholarly tool, not a portfolio site. Motion should be functional (communicating state changes) rather than decorative.

### Allowed Animations
- **Page transitions:** Subtle fade-in on route change (opacity 0→1, 200ms ease)
- **Tracker row updates:** When a session's status changes via Realtime, briefly highlight the row with a `--color-accent-subtle` background pulse (400ms), then fade back to normal
- **Button hover:** Scale to 1.01, subtle shadow increase (150ms ease)
- **Card hover:** Shadow deepens, border color shifts (200ms ease)
- **Modal open/close:** Fade in backdrop (200ms), slide up modal content (250ms ease-out)
- **Skeleton loading:** Gentle shimmer effect on placeholder elements

### Forbidden Animations
- No bouncing, no spring physics, no parallax scrolling
- No animated gradient backgrounds
- No entrance animations on scroll (no "slide in from left" as you scroll down)
- No loading spinners — use skeleton screens
- No confetti or celebration animations on completion (this isn't a gamified app)

---

## 9. Accessibility

- Color contrast: all text/background combinations must meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
- All interactive elements must have visible focus rings (`outline: 2px solid var(--color-accent); outline-offset: 2px`)
- Badge colors (fidelity, status, difficulty) must NOT be the only way to distinguish meaning — always pair with text labels
- Tracker table must be navigable by keyboard (tab through rows, enter to expand/claim)
- Images (if any) must have alt text
- Use semantic HTML: `<main>`, `<nav>`, `<article>`, `<section>`, `<aside>` for the TOC
- Skip-to-content link for keyboard users

---

## 10. Google Fonts Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400;1,6..72,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400;1,8..60,600&display=swap" rel="stylesheet">
```

---

## 11. Tailwind Configuration Guidance

Extend the Tailwind config to include:
- Custom colors matching all CSS variables above
- Custom font families: `'display'` (Newsreader), `'body'` (Source Serif 4), `'mono'` (IBM Plex Mono), `'ui'` (Inter)
- Custom spacing scale if the default Tailwind scale doesn't match
- Extended `max-width` to include `'prose': '780px'`

---

## 12. Summary: Design Principles Checklist

Before shipping any page, verify:

- [ ] Is all body text in Source Serif 4? (Not Inter, not system fonts)
- [ ] Are all headings in Newsreader? (With the correct weight/style)
- [ ] Is the content width ≤780px for reading pages?
- [ ] Is there enough whitespace? (When in doubt, add more)
- [ ] Do all badges pair color with text labels?
- [ ] Are fidelity indicators visible and color-coded?
- [ ] Does the page look good on a phone? (Test at 375px width)
- [ ] Are hover/focus states defined for all interactive elements?
- [ ] Does it feel like a scholarly publication, NOT like a SaaS dashboard?
- [ ] Would a historian feel comfortable using this? Would they trust it?
