# Guest signing at `/sign`

**https://www.jet-ski-miami.com/sign/?gtt=GTT000243**

See **[FLOW.md](FLOW.md)** for issuance, renter vs extra-adult vs dock, staff gate, and the record API stub.

Legal copy on HOME-B / HOME-C / DOCK-D-R stays frozen (Tanner 2025-08-20 Word file). WaiverForever stays live. Do not email Prime from this change.

## Staff walk (flow / UI — not a Prime cutover)

- Issue links: https://www.jet-ski-miami.com/sign/issue.html?gtt=GTT000243
- Renter: https://www.jet-ski-miami.com/sign/?gtt=GTT000243&demo=1
- Extra adult (2-ski + child fixture): https://www.jet-ski-miami.com/sign/?gtt=GTT000258&who=adult2&demo=1
- HOME-C: https://www.jet-ski-miami.com/sign/?gtt=GTT000242&demo=1
- Dock QR: add `&dock=1`
- Gate: https://www.jet-ski-miami.com/sign/staff.html?gtt=GTT000243

A2P SMS is blocked. Copy email / iMessage / WhatsApp from the issue page. GitHub Pages serves `main` — merge before sending a live www URL.

## Files

| File | Role |
| --- | --- |
| `sign/FLOW.md` | Issuance + paths + launch count |
| `sign/index.html` | Guest shell |
| `sign/issuance.js` | GTT fixtures, URLs, launch matrix |
| `sign/issue.html` | Mint links + QR |
| `sign/staff.html` | Roster / launch gate |
| `sign/pack.html` | Signed pack |
| `sign/record-api.js` | POST /api/record host + JSON shape |
| `sign/kyc.js` | Optional on-device KYC helper |
