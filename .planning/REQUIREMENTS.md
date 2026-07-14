# Requirements: Moodscaparr

**Defined:** 2026-07-13
**Core Value:** Make mood tracking effortless enough to do daily, rewarding enough to sustain as a habit, and insightful enough to reveal personal emotional patterns.

## v1.2 Requirements

Requirements for milestone v1.2 (UI Redesign). Each maps to roadmap phases.

### Layout & Navigation

- [ ] **UI-01**: Desktop sidebar navigation with icon + label links, collapsed/expanded states, and active route highlighting
- [ ] **UI-02**: Mobile bottom tab bar with 5 tabs, safe-area-aware, responsive breakpoint at 1024px
- [ ] **UI-03**: Route groups restructuring — `(app)` layout for authenticated pages, `(auth)` layout for login/register
- [ ] **UI-04**: Single shared nav config module consumed by both sidebar and bottom tabs
- [ ] **UI-05**: Responsive layout switching between sidebar (desktop) and bottom tabs (mobile)

### Infrastructure

- [ ] **UI-06**: Session/auth provider in root layout eliminating per-page useEffect auth boilerplate
- [x] **UI-07**: All 7+ pages migrated to new layout shell, Header boilerplate stripped
- [ ] **UI-08**: Cleanup — delete old `header.tsx`, remove unused dependencies

## v2 Requirements

(None deferred — this milestone covers the full UI redesign scope.)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Glassmorphism/frosted effects | Deferred — focus on layout + navigation structure first |
| Framer Motion or animation libraries | Overkill — CSS transitions sufficient for v1.2 |
| Drag-to-reorder sidebar | Not needed for 6 flat navigation items |
| Resizable sidebar | No value for a personal mood diary app |
| Full-page glass backgrounds | Extreme GPU cost on mobile devices |
| Swipe gestures between pages | Complex, conflicts with scroll |
| Admin-specific sidebar variant | Admin items shown conditionally in same sidebar |
| FAB button relocation | Handled in cleanup — FAB removed during page migration |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UI-01 | Phase 6 | Pending |
| UI-02 | Phase 6 | Pending |
| UI-03 | Phase 5 | Pending |
| UI-04 | Phase 5 | Pending |
| UI-05 | Phase 6 | Pending |
| UI-06 | Phase 6 | Pending |
| UI-07 | Phase 7 | Complete |
| UI-08 | Phase 8 | Pending |

**Coverage:**
- v1.2 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-13*
*Last updated: 2026-07-13 after initial definition*
