# HoopIQ Design System

HoopIQ follows a clean, compact dashboard style: warm off-white surfaces,
charcoal typography and feature panels, fine neutral borders, and a soft lime
accent. DM Sans is used for interface text and Manrope for headings. The system
is built as a standalone stylesheet in `design-system.css`, follows the
operating system's theme by default, and supports a persisted manual light/dark
choice from the top-bar theme control.

## Color reference

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--page` | `#f5f5f2` | `#161714` | App canvas |
| `--surface` | `#ffffff` | `#20211e` | Sidebar and cards |
| `--surface-raised` | `#fafaf8` | `#262723` | Inputs and nested content |
| `--surface-muted` | `#f0f1ec` | `#30312c` | Progress tracks and quiet fills |
| `--text` | `#20211f` | `#f3f4ef` | Main text |
| `--text-soft` | `#53554e` | `#c0c1b8` | Supporting text |
| `--muted` | `#858780` | `#a0a297` | Secondary labels |
| `--line` | `#e9eae5` | `#343630` | Borders and dividers |
| `--accent` | `#c5ef75` | `#c5ef75` | Highlight actions and emphasis |
| `--accent-strong` | `#a9d84c` | `#c5ef75` | Progress and hover states |
| `--accent-dark` | `#769b35` | `#c5ef75` | Accessible focus indication |
| `--success` | `#648b38` | `#b1d77f` | Positive status |
| `--warning` | `#9a752f` | `#dfc27b` | Attention status |
| `--danger` | `#c7574f` | `#ef8a80` | Validation errors |

Semantic states use `--success-soft` and `--warning-soft` backgrounds. Set a
custom accent or palette by overriding the corresponding custom properties on
`:root`.

## Layout measurements

- **Desktop sidebar:** 238px, sticky, full viewport height; narrows to 224px at
  tablet widths.
- **Main content:** fluid, with a 1280px maximum; horizontal padding scales from
  24px to 58px.
- **Mobile navigation:** separate fixed bottom bar below 760px, with five
  equal-width icon destinations and safe-area padding; desktop sidebar is hidden.
- **Dashboard:** a two-column card grid, a full-width hero and feature card, and
  compact three-up metric tiles.
- **Responsive breakpoints:** 1050px for compact desktop, 760px for mobile
  navigation, and 560px for single-column cards and forms.
- **Corner radii:** 9px controls and 13px cards and feature surfaces.
- **Motion:** short transitions for navigation, buttons, progress, and view
  changes; reduced-motion preferences are respected.

## Component guidance

- **Navigation:** use `.nav-item` inside `.nav`; add `.active` to the current
  destination. Use small inline SVGs with `.nav-icon`, not emoji. The
  `.mobile-nav` repeats the destinations with concise labels for touch screens.
- **Top-bar controls:** use `.icon-btn` for compact, accessible icon-only
  actions. HoopIQ's theme control toggles light/dark appearance and the gear
  opens the Settings view.
- **Primary action:** use `.primary-btn` for the most important action on a
  surface; it uses charcoal by default. Inside `.hero-card`, the primary action
  uses the lime accent. Use `.secondary-btn` for a paired alternative and
  `.ghost-btn` for low-emphasis actions.
- **Cards:** use `.card` for general content and `.player-card` for vertically
  arranged player profiles. Group a title and optional `.pill` in `.card-head`.
- **Status pills:** `.success`, `.warning`, and `.accent` communicate positive,
  attention, and highlighted states.
- **Forms:** arrange fields in `.form-grid` inside `.input-form`; retain visible
  labels, native input types, focus indication, and `aria-invalid` on invalid
  values. `.form-hint` and `.drill-feedback` provide supporting or validation
  text.
- **Dashboard metrics:** use `.hero-metrics` and `.metric-box`; highlight a key
  metric with `.accent`.
- **Progress:** use `.progress-ring` for a circular indicator or `.bar-group`
  and `.bar-row` for comparable values. Update each inner bar's width from the
  measured value.
- **Wide content:** add `.wide-card` to span the dashboard or section grid.

## HoopIQ feature surfaces

- **Progress tracking:** group shooting totals, the half-court chart, time
  summaries, trends, and session history into clear cards. Keep zero-attempt
  percentages at `0%` and provide an empty state before a player logs activity.
- **Training and coaching:** use labeled profile and planner forms, compact
  workout blocks, and visible start/pause/skip/complete controls. Recommendations
  should state their local rule-based rationale; skill ratings are player
  self-assessments.
- **Learning:** present IQ scenarios with selectable answers and immediate
  explanations. The strategy board pairs preset tactical diagrams with a
  concise readout; the strategy coach accepts an offense or defense situation
  and returns transparent local-rule guidance, not a connected AI response.
  Academy lessons should keep practice steps, common mistakes, difficulty,
  duration, and a measurable outcome together. The Academy play-style quiz
  suggests roles and player-inspired lessons from a few selected preferences;
  treat it as guidance, not a definitive position assessment.
- **Data and safety:** keep progress local, provide explicit export/import
  actions, and confirm before replacing or resetting saved data. Training copy
  should encourage breaks and stopping when pain occurs; age-group guidance is
  conservative and does not replace a qualified coach or responsible adult.

## Sample HTML shell

```html
<div class="app-shell">
  <aside class="sidebar">
    <div class="brand-wrap">
      <div class="brand-mark" aria-hidden="true">H</div>
      <div>
        <p class="eyebrow">Training Zone</p>
        <h1>HoopIQ</h1>
      </div>
    </div>
    <nav class="nav" aria-label="Main navigation">
      <button class="nav-item active" type="button">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
        </svg>
        <span>Dashboard</span>
      </button>
    </nav>
  </aside>

  <main class="main-panel">
    <header class="topbar">
      <div>
        <p class="eyebrow subtle">Player profile</p>
        <h2>Dashboard</h2>
      </div>
      <button class="primary-btn" type="button">Log workout</button>
    </header>

    <section class="hero-card">
      <div>
        <p class="eyebrow">Welcome back</p>
        <h3>Build your game one rep at a time.</h3>
        <p>Make steady progress with focused practice.</p>
      </div>
      <div class="hero-metrics">
        <div class="metric-box accent">
          <span>Season shot %</span>
          <strong>42%</strong>
        </div>
      </div>
    </section>

    <section class="stats-grid" aria-label="Training summary">
      <article class="card">
        <div class="card-head">
          <h4>Training summary</h4>
          <span class="pill success">On track</span>
        </div>
        <p>Keep building consistency, one practice at a time.</p>
      </article>
    </section>
  </main>
</div>
```
