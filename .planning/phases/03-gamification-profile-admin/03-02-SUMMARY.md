# 03-02: Profile & Admin — Execution Summary

## Build Status
✅ `npm run build` passes

## Files Created

### API Routes (8 files)
- `app/api/user/profile/route.ts` — GET (user+profile), PUT (update name, country, timezone, streakGoal)
- `app/api/user/export/route.ts` — GET all user data as JSON { version, exportedAt, data }
- `app/api/user/import/route.ts` — POST restore entries (skip duplicate date+category)
- `app/api/admin/stats/route.ts` — GET KPIs, registration trend, mood distribution
- `app/api/admin/users/route.ts` — GET paginated user list with search & role filter
- `app/api/admin/users/[id]/route.ts` — PUT role/ban, DELETE (soft-delete, hard-delete if already soft)
- `app/api/admin/sso/route.ts` — GET list providers, PUT toggle enabled
- `app/api/admin/invite-codes/route.ts` — GET list, POST generate, DELETE revoke (with child `[id]/route.ts`)

### Lib & Hooks (4 files)
- `lib/api/profile.ts` — fetchProfile, updateProfile, exportData, importData
- `hooks/use-profile.ts` — useProfile, useUpdateProfile, useExportData, useImportData
- `lib/api/admin.ts` — fetchAdminStats, fetchAdminUsers, updateUser, deleteUser, fetchSSOConfig, toggleSSO, fetchInviteCodes, generateInviteCode, revokeInviteCode
- `hooks/use-admin.ts` — useAdminStats, useAdminUsers, useAdminMutations, useSSOConfig, useInviteCodes

### Settings Components & Pages (7 files)
- `components/settings/profile-form.tsx` — react-hook-form + Zod: name, country (auto-fills timezone), timezone, streakGoal
- `components/settings/achievement-summary.tsx` — progress ring, "X of 14 badges", icon grid, link to /achievements
- `components/settings/data-export.tsx` — "Export My Data" button → JSON download
- `components/settings/data-import.tsx` — file upload, parse, preview, confirm → POST
- `app/settings/page.tsx` — Profile | Data | Privacy sections, auth guard
- `app/settings/layout.tsx`, `loading.tsx`, `error.tsx`

### Admin Components & Pages (8 files)
- `components/admin/admin-dashboard.tsx` — 4 KPI cards, RegistrationTrend BarChart, MoodDistribution PieChart, CSV export
- `components/admin/user-table.tsx` — shadcn Table, search, role filter, pagination, row click → detail dialog
- `components/admin/user-detail-dialog.tsx` — Dialog: info grid, Promote/Demote, Suspend/Unsuspend, Delete
- `components/admin/sso-config.tsx` — Google/GitHub cards with toggle switches
- `components/admin/invite-codes.tsx` — generate form (maxUses + expiry), code list with copy & revoke
- `app/admin/page.tsx` — Tabs (Dashboard/Users/SSO/InviteCodes), admin-only guard
- `app/admin/layout.tsx`, `loading.tsx`, `error.tsx`

### Supporting Files (2 files)
- `components/ui/table.tsx` — Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter, TableCaption

### Modified Files (1 file)
- `components/header.tsx` — Added Settings + Admin (admin-only) links to dropdown menu

## Verification
- `/settings` — profile form (save works), achievement summary, data export/import
- `/admin` — dashboard with KPIs and charts, user table with search/filter/actions, SSO toggles, invite code management
- Header dropdown includes Settings for all users, Admin for admin users only
- Dark mode supported throughout
- `npm run build` — clean ✅
