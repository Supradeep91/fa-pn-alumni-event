# FA PN Connection Challenge

> Play. Connect. Leave a Legacy.

A web-based networking game for the **FA PN Alumni Event (Mo 21.09)**.  
~150 attendees connect across classes using a digital passport and QR stamp system.

---

## What is this?

FA PN may end as a formal program — but the network doesn't have to.  
This app turns the alumni evening into a structured networking game:

- Attendees get a **digital passport** when they log in
- They **find people from other classes**, have a real conversation, and **collect a stamp**
- Achievements unlock based on who you've met
- Classes compete on a **live leaderboard**

---

## Current Status

**MVP is complete and live on Vercel.**

| Feature | Status |
|---|---|
| Email magic link login | Done |
| Profile setup (name + cohort year) | Done |
| Digital passport (QR code + stamp grid) | Done |
| QR stamping with mutual confirmation | Done |
| Conversation questions | Done |
| Class leaderboard (real-time) | Done |
| LinkedIn handle + button + icon | Done |
| Achievements (6 badges) | In progress |
| Achievement notifications | To do |
| Network wall / connection graph | To do |
| Admin panel | To do |
| Finale screen | To do |
| Future Match follow-up email | To do |

---

## Docs

| Document | Description |
|---|---|
| [MVP Scope](docs/mvp-scope.md) | The 7 features shipped for event day |
| [V1 Scope](docs/v1-scope.md) | Full feature set — achievements, admin, network wall, finale |
| [How It Works](docs/how-it-works.md) | Game mechanics, passport, stamping flow, LinkedIn |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js PWA |
| Backend / Auth / DB | Supabase |
| QR | qrcode.js + device camera API |

---

## Quick Start

> Setup instructions will be added once scaffolding is complete.

---

## Event Agenda

| Time | Activity |
|---|---|
| 15 min | Arrival — drinks, music, log in to app |
| 10 min | Welcome & game kick-off |
| 60–75 min | Connection Challenge — network, collect stamps |
| 10 min | Finale — achievement & class challenge awards |
| 45–60 min | Celebrate |
