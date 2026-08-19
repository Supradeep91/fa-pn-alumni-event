# How It Works

## The Concept

A networking game that gets everyone moving, talking, and connecting across cohorts.  
Each attendee gets a **digital passport**. The mission: collect stamps by meeting people from other classes.

---

## Login Flow

1. Attendee opens the app URL and enters their email
2. They confirm the email on a second screen, then tap **Send code**
3. The app checks the email against the `allowed_emails` table — if not listed, access is denied
4. Supabase sends an 8-digit one-time code to their inbox
5. Attendee enters the code → logged in

> Corporate email scanners can follow magic links and consume them before the user clicks — this is why the app uses typed OTP codes instead.

**First-time users** are taken through a 4-step setup wizard:
- Enter name
- Pick cohort year (2000–2026, CEO, CFO, Coach)
- Optionally add LinkedIn handle
- Shown their mission list → land on passport

---

## Player Flow

### 1. Arrive & Log In
- Attendee opens the app (or installs it to their home screen as a PWA)
- Completes login and setup in under 2 minutes
- Passport is ready immediately

### 2. Find Someone
- Look for someone from a cohort you haven't stamped yet
- Or find someone you want to reconnect with
- CEO and CFO are also players — their stamps are worth chasing

### 3. Talk
- The Tips tab on the passport shows conversation starters:
  - *Something we have in common?*
  - *What did you learn through FA PN?*
  - *What are you working on now?*
  - *Who/what should I connect with?*

### 4. Get Stamped
- One person opens their passport → QR tab → shows QR code
- The other goes to the Scan tab and scans it with their camera
- Scanner is taken to a confirm screen → taps **Connect**
- Stamp is recorded for both — appears in each other's Stamps tab
- Achievement logic runs immediately in the background

> Mutual confirmation is required: the QR owner must be physically present for the stamp to go through.

### 5. Unlock Achievements & Compete
- Badges unlock automatically as you hit milestones — no action needed
- Your cohort earns points on the live leaderboard with every connection
- At the finale, achievements and the cohort champion are announced

---

## Passport Screen

Every attendee has a personal passport with four tabs:

| Tab | Content |
|---|---|
| **My QR** | Their unique QR code for others to scan |
| **Stamps** | List of everyone they've connected with — name, cohort colour dot, LinkedIn button, 🚀 future match flag |
| **🏅** | Achievements grid — locked and unlocked badges |
| **Tips** | Conversation starter cards |

### LinkedIn
Attendees can optionally add their LinkedIn handle during setup. When set:
- A LinkedIn button appears on their connection row in other people's Stamps tab
- The other person can tap it immediately after stamping to save the connection

### Future Match
Each connection row has a 🚀 button. Tapping it flags that person as someone to stay in touch with. This unlocks the **Future Match** badge and can be used post-event to identify who to follow up with.

---

## Achievements

| Badge | How to Earn |
|---|---|
| 🤝 Perfect Stranger | Your first stamp |
| 🗺️ Wanderer | Stamps from 3 different cohort years |
| ⏳ Time Traveller | Stamps from 5 different cohort years |
| 🔑 Leadership Unlock | Connect with CEO or CFO |
| 🎓 Mentored | Connect with a Coach |
| 🏆 Full House | Stamps from every cohort present + CEO & CFO |

---

## Admin Panel (`/admin`)

Accessible only to emails listed in the `admin_emails` Supabase table.  
Admins see a **⚙ Admin** link in the top-left of their passport header.

### Overview tab
- Live stat cards: registered attendees, total connections, badges earned, top connector
- Stamp activity timeline (bar chart by hour)
- Top 8 connectors
- Cohort activity breakdown
- Achievement unlock counts
- Recent connections feed

### Attendees tab
- Full list of registered attendees with name, cohort, stamp count, and badges

### Agenda tab
- Live editor for all sessions across Day 1 and Day 2
- Edit time, title, speaker, location, duration, status per session
- Add or delete sessions
- 📍 pin any session to manually highlight it on the attendee agenda
- When saving a session with a duration (e.g. "30 min"), the next session's start time auto-shifts

### Launch Finale button
- Opens `/finale` in a new tab — designed to be shown on a projector

---

## Finale Screen (`/finale`)

Public URL — no login required. Designed for full-screen display on a projector.

- Animated connection counter (auto-updates in real time)
- Pulses on each new stamp
- Most connected person + most active cohort
- Badges unlocked with counts
- Live feed of last 7 connections

---

## Agenda Highlighting

The attendee-facing agenda (`/agenda`) highlights the current session automatically:

- **Auto** — based on current time, the session that started most recently shows a cyan ring and `● Now` badge
- **Manual** — admin can pin any session with the 📍 button in the Agenda editor; this overrides auto-highlight

Manual pin clears automatically when another session is pinned.

---

## Class vs. Cohort Challenge

- Every stamp counts as a point for that person's cohort
- The leaderboard shows live rankings across all cohorts
- Connections across cohorts build the network — same-cohort stamps still count

---

## CEO & CFO — Part of the Game

- CEO and CFO participate as players, not just speakers
- They have passports and collect stamps like everyone else
- Connecting with either unlocks the **Leadership Unlock** achievement
- Both are required for the **Full House** achievement
