# MVP Scope

**Goal:** Core game loop works reliably on event day. Nothing more, nothing less.  
**Target timeline:** ~1.5 weeks

---

## Features

| # | Feature | Detail |
|---|---|---|
| 1 | **Email login** | Magic link — one-tap sign-in, no password |
| 2 | **Profile setup** | Name + cohort year (2000–2026, CEO, CFO, Coach) |
| 3 | **Digital passport** | QR code, stamp grid (collected as pills), conversation questions |
| 4 | **QR stamping** | Scan someone's QR → mutual confirmation → stamp recorded for both |
| 5 | **Conversation questions** | 4 static questions shown on passport screen to guide conversations |
| 6 | **Class leaderboard** | Live real-time ranking of all classes by number of connections made |
| 7 | **LinkedIn** | Optional handle on profile setup; LinkedIn button on stamp success screen; LinkedIn icon in connections list |

---

## Stamping Flow (detailed)

1. User A opens passport → displays their QR code
2. User B scans User A's QR with their camera
3. Both users see a confirmation screen → both tap **"Confirm"**
4. Stamp is recorded for both — appears on each other's passport
5. Achievement logic runs silently in the background

> Mutual confirmation is required to prevent fake stamps.

---

## Conversation Questions (default set)

- Something we have in common?
- What did you learn through FA PN?
- What are you working on now?
- Who/what should I connect with?

---

## Out of Scope for MVP

- Achievements and badge unlocks → V1
- Achievement notifications → V1
- Network wall / connection graph → V1
- Admin panel → V1
- Finale screen → V1
- Future Match follow-up email → V1
- Photo booth, slideshow, memory wall → not in app scope

---

## Success Criteria

- Every attendee can log in within 2 minutes of arriving
- QR scan + stamp confirmation completes in under 30 seconds
- Leaderboard updates in real time with no manual refresh
- App works on any phone browser without installation (PWA)
- LinkedIn handle is optional — zero friction if skipped
