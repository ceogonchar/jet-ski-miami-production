# `/sign` flow

Live guest URL (GitHub Pages on `main`):

`https://www.jet-ski-miami.com/sign/?gtt=GTT000258`

`/h/{GTT}` is **not** wired. `sign.jet-ski-miami.com` currently 500 — do not issue there.

Paying guests still use WaiverForever (`waiver.fr/p-X54J2`, `p-SGuJB`) until Prime cutover. Do not email Prime from this change. Legal instrument wording on HOME-B / HOME-C / DOCK-D-R stays frozen.

## How a staffer issues a link

1. Open **https://www.jet-ski-miami.com/sign/issue.html?gtt=GTT000258** (or GTT000243 / GTT000242 fixtures).
2. Load the local fixture or paste the SmartRez roster (`role | name | dob | phone | email`).
3. **Mint per-adult links.** One URL per adult. Minors do not get a link.
4. A2P SMS is blocked (Twilio 30034). Copy the confirmation into **email, iMessage, or WhatsApp**. Walk-ups: copy-link + QR on that page.
5. Confirmation copy:

   `Sign your papers: {url}. Renter: rental then release. Other adults: your own link.`

Do not tell the renter to forward one link to a spouse.

Format (compatible with the current parser):

```
https://www.jet-ski-miami.com/sign/?gtt=GTT000258&who=renter
https://www.jet-ski-miami.com/sign/?gtt=GTT000258&who=adult2
https://www.jet-ski-miami.com/sign/?gtt=GTT000258&who=renter&dock=1
```

`?who=husband` still works on fixture GTT000242 (alias of `adult2`). Links also carry an opaque `?t=` (72h, client-side) until a backend binds it. Do not block issuance on `t=`.

Instructor 313A is **not** a guest URL. Open it from the dock gate after a real check ride.

## Guest paths

| Who | Home | Dock |
| --- | --- | --- |
| Renter `?who=renter` | consent → ID → identity → HOME-A → HOME-B → HOME-C if anyone <18 | `?dock=1` arrive → D-R if shorts refused → D → check ride → E |
| Extra adult `?who=adult2` | consent → ID → identity → HOME-B → HOME-OP | same dock QR with their `who=` |
| Instructor (staff device) | — | dock gate → `?who=instructor&dock=1` → E only |

Progress in the header is **remaining steps for this `who=`**. Identity is confirmed once and reused on A/B/C. A and B are separate screens.

Empty / error states: missing `gtt`, unknown GTT, expired `t=`, already signed (home pack on this phone, not in `demo=1`).

## Staff gate

**https://www.jet-ski-miami.com/sign/staff.html?gtt=GTT000258**

Roster matrix: who signed A, B, C, D, D-R, E.

Launch **count** (do not eyeball):

- 1× HOME-A per booking
- HOME-B = every adult
- HOME-C if anyone <18
- DOCK-D per adult participant
- DOCK-E per driver + renter
- DOCK-D-R only if shorts refused (never required to launch)

Unlock 313A **on this phone** from the gate after the check ride. The guest file has no instructor PIN.

## Persistence

`POST {JSM_RECORD_API}/api/record` with the JSON shape in `sign/record-api.js`. Fail closed on HTTP 5xx unless `demo=1` (staff walk). Always write `localStorage` pack `jsm_pack_{GTT}_{who}`. `pack.html` reads the company list first, then the same local pack.

TODO: replace the trycloudflare hostname with a stable Gonchar host. Same path + JSON. Do not put SmartRez or Didit production keys in this public repo. Fixtures: `sign/issuance.js` + `sign/fixtures/bookings.json` (GTT000242, GTT000243, GTT000258).

## Files

| File | Role |
| --- | --- |
| `sign/index.html` | Guest wizard (legal copy frozen) |
| `sign/issuance.js` | GTT → per-adult URL, token, launch count |
| `sign/issue.html` | Staff mints links + QR + share copy |
| `sign/staff.html` | Dock roster / launch gate |
| `sign/pack.html` | Signed pack list |
| `sign/record-api.js` | Record host + POST shape |
| `sign-nav.js` | Header “Your papers” only if this phone already has a GTT |
