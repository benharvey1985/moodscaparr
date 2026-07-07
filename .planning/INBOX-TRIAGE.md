===================================================================
  GSD INBOX TRIAGE — benharvey1985/moodscaparr — 2026-07-07
===================================================================

SUMMARY
-------
Open issues: 12   Open PRs: 0
  Features:    0    Feature PRs:      0
  Enhancements:4    Enhancement PRs:  0
  Bugs:        8    Fix PRs:          0
  Chores:      0    Wrong template:   0
  Unclassified:1    No linked issue:  0

NOTES
-----
This project has no `.github/ISSUE_TEMPLATE/` directory. Issues are created
via the in-app feedback system (`components/feedback/feedback-dialog.tsx`),
which collects minimal structured fields:
  - Bug: title, severity, description
  - Feature: title, category, description

Review criteria below are adapted to the project's actual feedback format.
Missing fields noted under "Recommended additions" are suggestions for
improving the feedback form, not template violations.

Bug #6 (Achievements screen — no header bar) was FIXED in commit
`app/achievements/page.tsx` but the issue remains OPEN. Close after
verification.

GATE VIOLATIONS (action required)
---------------------------------
None — no open PRs to gate-check.

ISSUES NEEDING ATTENTION
------------------------

  #10 [Bug] Admin Button
    Type:    Bug Report
    Score:   50% complete (3/6 fields)
    Present: Title, Severity (Critical), Description
    Missing: Steps to reproduce, Expected behavior, Environment info
    Labels:  bug → Suggested: needs-triage
    Age:     0 days
    Priority: Critical — admin users have no nav path to /admin

  #9 [Bug] Header Bar issue
    Type:    Bug Report (mixed with feature request)
    Score:   50% complete (3/6 fields)
    Present: Title, Severity (Critical), Description
    Missing: Steps to reproduce, Expected behavior, Environment info
    Labels:  bug → Suggested: needs-triage, enhancement
    Age:     0 days
    Note:    Contains two distinct requests — responsive burger menu
             (enhancement) and floating New Entry button (feature)

  #11 [Bug] Profile Icon Clicked
    Type:    Bug Report
    Score:   50% complete (3/6 fields)
    Present: Title, Severity (Medium), Description
    Missing: Steps to reproduce, Expected behavior, Environment info
    Labels:  bug → Suggested: needs-triage
    Age:     0 days
    Note:    Base UI error #31 — runtime crash on dropdown trigger

  #6 * [Bug] Achievements screen - no header bar (FIXED)
    Type:    Bug Report
    Score:   50% complete (3/6 fields)
    Present: Title, Severity (Critical), Description
    Missing: Steps to reproduce, Expected behavior, Environment info
    Labels:  bug → Suggested: needs-triage
    Age:     0 days (all day)
    Status:  HEADER BAR FIX DEPLOYED — close issue after verifying
    * Fix:   app/achievements/page.tsx rewritten to client component with Header

  #7 [Bug] History not showing all records
    Type:    Bug Report
    Score:   50% complete (3/6 fields)
    Present: Title, Severity (Medium), Description
    Missing: Steps to reproduce, Expected behavior, Environment info
    Labels:  bug → Suggested: needs-triage
    Age:     0 days

  #4 [Bug] Achievements
    Type:    Bug Report
    Score:   50% complete (3/6 fields)
    Present: Title, Severity (Medium), Description
    Missing: Steps to reproduce, Expected behavior, Environment info
    Labels:  bug → Suggested: needs-triage
    Age:     0 days

  #2 [Bug] Site Intro
    Type:    Bug Report
    Score:   50% complete (3/6 fields)
    Present: Title, Severity (Medium), Description
    Missing: Steps to reproduce, Expected behavior, Environment info
    Labels:  bug → Suggested: needs-triage
    Age:     0 days

  #1 [Bug] Dashboard Issue
    Type:    Bug Report
    Score:   50% complete (3/6 fields)
    Present: Title, Severity (Medium), Description
    Missing: Steps to reproduce, Expected behavior, Environment info
    Labels:  bug → Suggested: needs-triage
    Age:     0 days

  #12 [Feature] Info Boxes
    Type:    Feature Suggestion / Enhancement
    Score:   60% complete (3/5 fields)
    Present: Title, Category (UI/UX), Description
    Missing: Use case / user story details, Scope considerations
    Labels:  enhancement → Suggested: needs-review
    Age:     0 days

  #8 [Feature] Analytics
    Type:    Feature Suggestion / Enhancement
    Score:   60% complete (3/5 fields)
    Present: Title, Category (UI/UX), Description
    Missing: Use case / user story details, Scope considerations
    Labels:  enhancement → Suggested: needs-review
    Age:     0 days

  #5 [Feature] Achievements screen
    Type:    Feature Suggestion / Enhancement
    Score:   60% complete (3/5 fields)
    Present: Title, Category (UI/UX), Description
    Missing: Use case / user story details, Scope considerations
    Labels:  enhancement → Suggested: needs-review
    Age:     0 days

  #3 [Feature] New Entry
    Type:    Feature Suggestion / Enhancement
    Score:   60% complete (3/5 fields)
    Present: Title, Category (UI/UX), Description
    Missing: Use case / user story details, Scope considerations
    Labels:  enhancement → Suggested: needs-review
    Age:     0 days

PRS NEEDING ATTENTION
---------------------
None.

READY TO MERGE
--------------
None — no open PRs.

STALE ITEMS (>30 days, no activity)
-----------------------------------
None — all issues created today (2026-07-07).

===================================================================

DETAILED REVIEW
---------------

Issue #12 — [Feature] Info Boxes
  Labels:    enhancement
  Author:    benharvey1985
  Age:       0 days
  Score:     60% (3/5)
  Type:      Enhancement (via in-app feedback)
  Body: Round corners on info boxes to match KPI card styling
  Assessment: Clear styling consistency request. References existing
    visual pattern ("like the KPI cards"). Actionable as-is — apply
    consistent border-radius token across unrounded information
    containers.

Issue #11 — [Bug] Profile Icon Clicked
  Labels:    bug
  Author:    benharvey1985
  Severity:  Medium
  Age:       0 days
  Score:     50% (3/6)
  Body: Base UI error #31 on profile icon click
  Assessment: Runtime crash — the user dropdown trigger throws a
    Base UI production error. Missing error page/URL and repro
    steps. Error code #31 likely relates to missing context or
    invalid render state.

Issue #10 — [Bug] Admin Button
  Labels:    bug
  Author:    benharvey1985
  Severity:  Critical
  Age:       0 days
  Score:     50% (3/6)
  Body: No way to access admin panel from any page
  Assessment: Admin users (`user.role === "admin"`) see the admin
    link in the dropdown menu (`components/header.tsx:155-160`),
    but there is no direct nav link visible on any page. The
    dropdown only shows admin link if role is "admin". Reproduce
    to confirm if the dropdown admin entry appears.

Issue #9 — [Bug] Header Bar issue
  Labels:    bug
  Author:    benharvey1985
  Severity:  Critical
  Age:       0 days
  Score:     50% (3/6)
  Body: Items disappear on horizontal resize; wants burger menu and
    floating New Entry button
  Assessment: Two concerns in one issue — (1) responsive nav collapse
    (items hidden on narrow screens, currently `hidden sm:flex`),
    (2) separate persistent New Entry button. Bug + feature request
    mixed in one issue.

Issue #8 — [Feature] Analytics
  Labels:    enhancement
  Author:    benharvey1985
  Age:       0 days
  Score:     60% (3/5)
  Type:      Enhancement (via in-app feedback)
  Body: Group reflection prompts into categories on analytics screen
  Assessment: Clear suggestion. Would benefit from layout/mockup hints.

Issue #7 — [Bug] History not showing all records
  Labels:    bug
  Author:    benharvey1985
  Severity:  Medium
  Age:       0 days
  Score:     50% (3/6)
  Body: Backdated entry doesn't appear in history
  Assessment: Date-filtering or query logic may exclude backdated
    entries. Missing date used and whether entry shows elsewhere.

Issue #6 — [Bug] Achievements screen - no header bar
  Labels:    bug | FIX DEPLOYED
  Author:    benharvey1985
  Severity:  Critical
  Age:       0 days (all day)
  Score:     50% (3/6)
  Body: Header bar missing on achievements page
  Assessment: FIXED — `app/achievements/page.tsx` was converted from
    a server component (no Header) to a client component with full
    Header rendering. Close this issue after verifying in production.

Issue #5 — [Feature] Achievements screen
  Labels:    enhancement
  Author:    benharvey1985
  Age:       0 days
  Score:     60% (3/5)
  Body: Progress indicators on achievement cards
  Assessment: Clear suggestion. Could specify indicator type (bar,
    percentage, count X/Y).

Issue #4 — [Bug] Achievements
  Labels:    bug
  Author:    benharvey1985
  Severity:  Medium
  Age:       0 days
  Score:     50% (3/6)
  Body: All achievements unlocked with only 3 entries
  Assessment: Likely logic bug in achievement-checking algorithm.
    Missing expected locked achievements list.

Issue #3 — [Feature] New Entry
  Labels:    enhancement
  Author:    benharvey1985
  Severity:  Medium
  Age:       0 days
  Score:     60% (3/5)
  Body: Quick date buttons (today/yesterday) in date selector
  Assessment: Straightforward UX enhancement. Actionable as-is.

Issue #2 — [Bug] Site Intro
  Labels:    bug
  Author:    benharvey1985
  Severity:  Medium
  Age:       0 days
  Score:     50% (3/6)
  Body: Tour appears on every dashboard refresh
  Assessment: Onboarding completion check may not be persisting.
    Missing expected behavior (show once after first login).

Issue #1 — [Bug] Dashboard Issue
  Labels:    bug
  Author:    benharvey1985
  Severity:  Medium
  Age:       0 days
  Score:     50% (3/6)
  Body: KPI cards don't refresh after quick log
  Assessment: Data refetch not triggered after mood entry creation.
    Missing whether manual refresh resolves it.

===================================================================
  INBOX HEALTH SCORE
===================================================================

Template coverage:  NONE — no templates exist
  → All 12 submissions use minimal 2-3 field format from the in-app
    feedback dialog. Bug reports lack steps to reproduce, expected
    behavior, and environment context. Feature suggestions lack use
    cases, scope, and acceptance criteria.

Suggested improvements:
  1. Add `.github/ISSUE_TEMPLATE/bug_report.yml` with fields:
     Description, Steps to reproduce, Expected behavior, Environment
  2. Add `.github/ISSUE_TEMPLATE/feature_request.yml` with fields:
     Description, Use case, Proposed solution, Scope notes
  3. Update in-app feedback form to collect additional fields
  4. Add `needs-triage` and `needs-review` labels to the repo

Priority triage suggestions:
  Critical: #10 (admin nav), #6 (fixed), #9 (responsive header)
  High:     #11 (profile crash), #4 (achievement logic bug), #7 (history)
  Medium:   #1 (dashboard refresh), #2 (site tour)
  Enhance:  #12, #8, #5, #3

===================================================================

───────────────────────────────────────────────────────────────

## Inbox Triage Complete

Reviewed: 12 issues, 0 PRs
Gate violations: 0
Ready to merge: 0
Needing attention: 12
Stale (30+ days): 0
Report saved to .planning/INBOX-TRIAGE.md

Notable changes since last run:
  +4 new issues (#9, #10, #11, #12)
  #6 (Achievements header bar) — FIX DEPLOYED, close after verify
  #9 combines responsive nav (bug) + floating button (feature)
  #10 and #9 are both Critical severity

───────────────────────────────────────────────────────────────
