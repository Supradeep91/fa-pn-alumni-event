# FA PN Connection Challenge

> Play. Connect. Leave a Legacy.

A PWA networking game for the **FA PN Alumni Event — Mo 21.09, Erlangen**.  
~150 attendees connect across cohorts using a digital passport and QR stamp system.

---

## What is this?

FA PN may end as a formal program — but the network doesn't have to.  
This app turns the alumni evening into a structured networking game:

- Attendees log in via a one-time email code and set up a **digital passport**
- They find people from other cohorts, have a real conversation, and **collect a stamp** by scanning each other's QR codes
- Achievements unlock automatically based on who you've met
- Cohorts compete on a **live leaderboard**
- An **admin panel** lets the organiser monitor activity and manage the agenda in real time
- A **finale screen** (designed for projector) shows live connection counts and top performers

---

## Current Status

**Fully built and live on Vercel.**

| Feature | Status |
|---|---|
| 3-step OTP email login (email → confirm → code) | ✅ Done |
| Email allowlist (allowed_emails table) | ✅ Done |
| Onboarding wizard (name → cohort → LinkedIn → done) | ✅ Done |
| Digital passport (QR code, stamps, badges, tips) | ✅ Done |
| QR stamping with mutual confirmation | ✅ Done |
| Conversation tip cards | ✅ Done |
| Live class leaderboard | ✅ Done |
| LinkedIn handle + button | ✅ Done |
| Future Match flag on connections | ✅ Done |
| Achievements — 6 badges, auto-unlock | ✅ Done |
| Admin panel (stats, attendees, agenda editor, finale launch) | ✅ Done |
| Agenda editor (DB-backed, live edits, session highlight) | ✅ Done |
| Finale screen (projector display, animated counter, live feed) | ✅ Done |
| Admin access via admin_emails table | ✅ Done |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router), TypeScript |
| Styling | Tailwind CSS |
| Backend / Auth / DB | Supabase (Postgres + Auth + Realtime + RLS) |
| QR scanning | html5-qrcode (device camera) |
| QR display | qrcode.react |
| Deployment | Vercel |
| App format | PWA (installable, works offline after first load) |

---

## Database Tables

| Table | Purpose |
|---|---|
| `profiles` | Attendee name, cohort year, LinkedIn handle |
| `stamps` | Confirmed connections between two users |
| `pending_stamps` | Initiator → target stamp request (awaiting confirmation) |
| `achievements` | Unlocked badge keys per user |
| `future_matches` | Connections flagged for follow-up |
| `allowed_emails` | Email allowlist — only these addresses can log in (empty = allow all) |
| `admin_emails` | Admin access list — these addresses see the ⚙ Admin link |
| `agenda_sessions` | Live event agenda, editable from admin panel |

---

## Key URLs

| URL | Who sees it |
|---|---|
| `/login` | Everyone — email OTP entry |
| `/setup` | First-time users — onboarding wizard |
| `/passport` | All logged-in attendees — home screen |
| `/scan` | All logged-in attendees — QR camera |
| `/leaderboard` | All logged-in attendees — live rankings |
| `/agenda` | All logged-in attendees — event schedule |
| `/admin` | Admin emails only — analytics + agenda editor |
| `/finale` | Public (no login) — projector display URL |

---

## Docs

| Document | Description |
|---|---|
| [How It Works](docs/how-it-works.md) | Game mechanics, passport, stamping flow, achievements |
| [MVP Scope](docs/mvp-scope.md) | The core features shipped for event day |
| [V1 Scope](docs/v1-scope.md) | Full feature set and what was built |

---

## Local Development

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase URL + anon key
npm run dev
```

Required Supabase env vars:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
