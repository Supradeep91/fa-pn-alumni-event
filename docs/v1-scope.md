# V1 Scope

**Goal:** Full event experience — achievements, network wall, admin control, post-event follow-up.  
**Target timeline:** ~4 weeks total (MVP + 2.5 additional weeks)

---

## Everything in MVP (features 1–7), plus:

| # | Feature | Detail |
|---|---|---|
| 8 | **Achievements** | 6 badges that auto-unlock based on stamp/connection logic |
| 9 | **Achievement notifications** | In-app alert + haptic when a badge unlocks |
| 10 | **Network wall** | Visual graph of all connections, nodes coloured by class year |
| 11 | **Admin panel** | Manage attendees, view live activity, trigger finale screen |
| 12 | **Finale screen** | Full-screen display for the projector — shows achievement winners & class champion |
| 13 | **Future Match follow-up** | Post-event email summarising who you connected with and their contact details |

---

## Achievements

| Badge | Unlock Condition |
|---|---|
| **Time Traveller** | Collect stamps from 5+ different class years |
| **Leadership Unlock** | Connect with the CEO or CFO |
| **Perfect Stranger** | Connect with someone you didn't know before the event |
| **Connector** | Introduce two people who don't know each other (self-reported) |
| **Future Match** | Mark at least one connection as someone to stay in touch with |
| **Full House** | Collect stamps from every present class + CEO & CFO |

---

## Network Wall

- Each attendee = a node, coloured by class year
- A connection line appears between two nodes when they stamp each other
- Visible on a shared screen / projector during the networking phase
- Clicking a node shows the person's name and class

> Fallback if graph is too complex to build in time: a live connection count list grouped by class pair (e.g. "Class '21 ↔ Class '23: 12 connections").

---

## Admin Panel

- View all registered attendees and their class
- See live stamp counts and achievement unlocks
- Manually trigger the **Finale Screen** on the projector display
- Export attendee connection data post-event (CSV)

---

## Finale Screen

Designed to be shown on a projector at the end of the 60–75 min networking phase.

- Class vs. Class winner (most connections)
- Achievement winners per badge category
- Total connections made across the entire event

---

## Future Match Follow-up

- During the event, users can flag a connection as a "Future Match"
- 24 hours after the event, an automated email goes out to each attendee
- Email includes: list of everyone they stamped, Future Match contacts with name + class + (optional) LinkedIn

---

## Open Questions

- [ ] Who operates the admin panel on event day?
- [ ] What are the prizes for achievement winners?
- [ ] Should CEO/CFO profiles show a special indicator on the network wall?
- [ ] Keep the app live after the event, or shut it down?
- [ ] Does "Perfect Stranger" require verification, or is self-reported fine?

---

## Effort Breakdown

| Feature | Estimated Days |
|---|---|
| MVP (features 1–7, including LinkedIn) | 7–8 days ✓ done |
| Achievements engine | 2 days |
| Achievement notifications | 0.5 day |
| Network wall (graph) | 2 days |
| Admin panel | 2 days |
| Finale screen | 1 day |
| Future Match follow-up email | 1 day |
| **Total** | **~18–20 days** |
