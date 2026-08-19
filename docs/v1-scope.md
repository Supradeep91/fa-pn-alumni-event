# V1 Scope

**Goal:** Full event experience — achievements, admin control, live finale, agenda management.

---

## Everything in MVP, plus:

| # | Feature | Status |
|---|---|---|
| 10 | **Achievements** — 6 badges, auto-unlock | ✅ Built |
| 11 | **Admin panel** — stats, attendees, agenda, finale launch | ✅ Built |
| 12 | **Admin access via DB** — `admin_emails` Supabase table | ✅ Built |
| 13 | **Finale screen** — projector display, live counter, feed | ✅ Built |
| 14 | **Agenda editor** — DB-backed, editable from admin panel | ✅ Built |
| 15 | **Session highlighting** — auto (time-based) + manual pin | ✅ Built |
| 16 | **Network wall / connection graph** | ❌ Not built |
| 17 | **Future Match follow-up email** | ❌ Not built |

---

## Achievements

| Badge | Unlock Condition |
|---|---|
| 🌍 Perfect Stranger | First stamp |
| ⏳ Time Traveller | Stamps from 5+ different cohort years |
| 🔑 Leadership Unlock | Connect with CEO or CFO |
| 🤝 Connector | 3+ stamps |
| 🚀 Future Match | Flag at least one connection as a future match |
| 🏆 Full House | Stamps from every present cohort + CEO & CFO (min 5 cohorts) |

Achievement logic runs in `lib/achievements.ts` on every stamp confirmation. Checks run client-side via a Supabase RPC with SECURITY DEFINER to avoid exposing other users' data.

---

## Admin Panel

Single page at `/admin`, server-rendered with auth gate.

**Access control:** checked against `admin_emails` Supabase table on each page load. Non-admins are redirected to `/passport`. The ⚙ Admin link appears in the passport header only for admin users.

**Tabs:**
- **Overview** — stat cards, hourly timeline, top connectors, cohort breakdown, achievement counts, recent connections feed
- **Attendees** — full attendee list with stamp count and badge count
- **Agenda** — inline editor for all sessions; add, edit, delete, pin

**Launch Finale** button opens `/finale` in a new tab.

Real-time updates via Supabase channel subscription on `stamps` and `achievements` tables.

---

## Finale Screen

Public URL at `/finale` — no login required (URL is access control).

- Designed for a projector or large display
- Animated connection counter with smooth count-up
- Pulses on each new stamp (Supabase Realtime subscription)
- Top connector and most active cohort callouts
- Achievement breakdown grid
- Live feed of last 7 connections

---

## Agenda Editor

Agenda is stored in the `agenda_sessions` Supabase table (not a static file).

- Falls back to `lib/agenda-data.ts` if the table is empty
- Admin can edit any session inline: time, title, speaker, location, duration, status, alumni highlight flag
- Auto-shifts the next session's start time when a parseable duration is saved (e.g. "30 min" → next session moves to start + 30)
- 📍 pin manually highlights a session in the attendee agenda — overrides the automatic time-based highlight
- Attendee agenda auto-highlights the current session based on device time; shows cyan ring + pulsing `● Now` badge

---

## Architecture Notes

### Auth
- Supabase Auth, OTP via email (8-digit code, not magic link)
- Middleware (`proxy.ts`) does JWT-only auth — no DB call per request
- Each page handles its own data fetching and redirect logic

### Data flow
- Server components fetch initial data (SSR)
- Client components subscribe to Supabase Realtime for live updates
- No API routes — all DB access goes through Supabase client directly

### RLS
- All tables have Row Level Security enabled
- Users can only read/write their own rows (profiles, stamps, achievements, future_matches)
- `allowed_emails` and `admin_emails` have open SELECT policies for authenticated users
- `agenda_sessions` has open SELECT (public read) and authenticated write

### Performance
- Middleware removed DB profile check — saves 200–400ms per navigation
- Passport page fetches profile + stamps + achievements + admin check in a single `Promise.all`
- Camera stop awaited before navigation to prevent race conditions on Scan tab

---

## Not Built (future ideas)

- **Network wall** — visual graph of all connections, nodes coloured by cohort
- **Future Match follow-up email** — automated post-event email with connection list and Future Match contacts
- **Push notifications** — badge unlock alerts via service worker
- **CSV export** — attendee + connection data for post-event analysis
