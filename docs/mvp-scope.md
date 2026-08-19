# MVP Scope

**Goal:** Core game loop works reliably on event day. Nothing more, nothing less.

---

## Features Shipped

| # | Feature | Detail |
|---|---|---|
| 1 | **OTP email login** | 3-step flow: email → confirm → 8-digit code. No magic links (corporate email scanners consume them). |
| 2 | **Email allowlist** | `allowed_emails` Supabase table — only listed addresses can log in. Empty table = allow all (safe for testing). |
| 3 | **Onboarding wizard** | 4 steps: name → cohort year → LinkedIn (optional) → done screen with mission list |
| 4 | **Digital passport** | QR code tab, stamps tab (connections list), achievements tab, tips tab |
| 5 | **QR stamping** | Scan QR → mutual confirmation screen → stamp recorded for both |
| 6 | **Conversation tips** | Static tip cards on passport Tips tab |
| 7 | **Class leaderboard** | Live real-time ranking of all cohorts by connection count |
| 8 | **LinkedIn** | Optional handle on setup; LinkedIn button on connection rows |
| 9 | **Future Match** | 🚀 flag on any connection; unlocks a badge |

---

## Stamping Flow

1. User A opens passport → QR tab → shows their QR code
2. User B opens Scan tab → scans User A's QR with camera
3. User B is taken to confirm screen → taps **Connect**
4. Stamp is recorded for both — appears in each other's Stamps tab immediately
5. Achievement logic runs in the background

> Camera navigation bug fixed: the app waits for the camera to stop before navigating away from the Scan tab.

---

## Auth Notes

- Supabase Auth with `signInWithOtp` + `verifyOtp` (type: `email`, 8-digit code)
- "Confirm email" toggle must be **OFF** in Supabase Auth settings (Sign In → Email → Confirm email)
- Middleware does JWT-only check — no DB call on every navigation

---

## Success Criteria

- Every attendee can log in within 2 minutes of arriving
- QR scan + stamp confirmation completes in under 30 seconds
- Leaderboard updates in real time with no manual refresh
- App works on any phone browser without installation (PWA)
- LinkedIn handle is optional — zero friction if skipped
