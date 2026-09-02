# Guest signing at `/sign`

Jet Ski Miami check-in papers. **Legal instrument wording is TEXT FROZEN pending Prime 2026 originals.** Do not paste, rewrite, or “lock” HOME-B / HOME-C / DOCK-D-R to last year’s Tanner / RM Word file in this repo until that 2026 customer-waiver email is in hand.

WaiverForever and SmartRez v20 stay live. Cutover is a later ops hour after Prime replies. Do not email Prime from this change.

## URL to walk (staff / Prime review of the *flow*)

Guest shell (fixture, demo persist so a dead record tunnel does not block the walk):

**https://jet-ski-miami.com/sign/?gtt=GTT000243&demo=1**

- Adult + child path: `https://jet-ski-miami.com/sign/?gtt=GTT000242&demo=1`
- Dock after home papers: add `&dock=1`
- Issue unique links from a GTT: **https://jet-ski-miami.com/sign/issue.html?gtt=GTT000243**
- Launch gate: **https://jet-ski-miami.com/sign/staff.html?gtt=GTT000243**
- Pack (PDF/JSON list): **https://jet-ski-miami.com/sign/pack.html?b=GTT000243**

Cover letter to Prime waits for this year’s originals. When that file arrives, send the live `/sign` URL plus the frozen-then-updated HOME-B/C/D-R text — not before.

## How a guest gets a link

1. SmartRez booking exists (GTT id, roster, renter name/email/phone).
2. Staff opens `/sign/issue.html?gtt=GTT…`, loads the fixture or pastes the roster (`role | name | dob | phone | email`).
3. **Mint per-person links.** Each adult gets their own URL. Minors do not get a link; HOME-C opens on the renter’s home flow when anyone on the roster is under 18 (no child checkbox).
4. SMS the renter link. Forward to every other adult. Prefill query fields (`name`, `email`, `phone`, `dob`, `addr`, `city`, `state`, `zip`) so they do not retype five times.
5. This does **not** disable WaiverForever. Until Prime cutover, guests may still receive the existing WaiverForever / SmartRez papers as today.

## How they sign

Home (couch), in order:

1. E-sign consent (this booking only)
2. Photo ID (Didit). Staff walk with `demo=1` may confirm details without the camera.
3. Confirm prefilled identity once
4. **HOME-A** rental (renter only) then **HOME-B** release (every adult)
5. **HOME-C** if a minor is on the roster

Dock only (`&dock=1`):

6. Wetsuit offer → **DOCK-D-R** if they refuse (separate instrument)
7. **DOCK-D** 15-block briefing
8. Real check ride (instructor unlock)
9. **DOCK-E** FWC 313A — do not auto-tick boxes or the instructor pad

First drawn initial/signature may be reused on later boxes in that session when the guest taps the box. Staff never auto-stamps blanks.

## What gets stored

Each instrument POST `/api/record` (company copy + PDF when the record API is up) and always writes a JSON pack on the phone (`localStorage`, downloadable from the done screen). Staff gate reads the company API first, then this phone’s pack.

Do not commit ID photos, secrets, or executed signature PDFs to this repo.

## Files

| File | Role |
| --- | --- |
| `sign/index.html` | Guest shell (legal strings frozen) |
| `sign/issuance.js` | GTT → per-person URL, prefill, launch count |
| `sign/issue.html` | Staff mints links |
| `sign/staff.html` | Dock launch gate |
| `sign/pack.html` | Signed pack list |
| `sign/kyc.js` | Optional on-device KYC helper |
