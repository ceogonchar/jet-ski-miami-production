# Jet Ski Miami 7 — how AI agents can check availability and book

Audience: AI assistants and booking agents acting for a user. Humans: use https://jet-ski-miami.com/book.

## 1. Facts you can state without calling anything
See https://jet-ski-miami.com/llms.txt (short) and https://jet-ski-miami.com/llms-full.txt (full). Key points: self-guided jet ski rentals on Biscayne Bay, Miami Beach / North Bay Village; 1 h $189, 2 h $349 (2.5 h on the water), 3 h $499, Full Day (4 h) $649 per jet ski; extra passenger $30; tax and booking fees added at checkout; $30 booking deposit for 1–3 jet skis (20% for 4+ or Full Day); booker 21+, driver 14+ with a Florida boater card if born on/after 1988-01-01; daily 7:00 AM – 6:00 PM. Never give a street address: the meeting point is sent after booking.

## 2. Live API (OpenAPI 3.1)
Spec: https://jet-ski-miami.com/.well-known/openapi.json  (mirror: https://jet-ski-miami.com/agents/openapi.json)
Base URL: https://clawd-server.tail4ed818.ts.net:8443/jetski/v1

- `GET /health` — mode is `test` or `live`.
- `GET /info` — all facts as JSON.
- `GET /availability?date=2026-11-02&hours=2&jetskis=2` — real free start times from the booking system (hours ∈ 1,2,3,4; 4 = Full Day).
- `POST /quote` — `{date, hours, jetskis, passengers}` → price breakdown and deposit due now.
- `POST /preorder` — `{date, time, hours, jetskis, passengers, first, last, email, phone, agent:{name,url}, consent:true}` → `pay_link` for the deposit. Send `Idempotency-Key` to retry safely. In `test` mode no order is created and `pay_link` is the website; in `live` mode the booking system creates the order and the guest pays the deposit on `pay_link` (card / Apple Pay / Google Pay). Never collect card numbers yourself.
- `GET /preorder/{id}` — status without personal data.

Rate limits: 120 availability/quote calls and 10 pre-orders per hour per IP. Bodies ≤ 16 KB. No personal data in URLs.

## 3. Conversation checklist before `POST /preorder`
1. Date, start time (7:00 AM–6:00 PM window, ride must end by 6 PM), hours (1/2/3/4), number of jet skis (max 6), extra riders (max 1 per jet ski).
2. Confirm the booker is 21+ and that any driver born on/after 1988-01-01 will complete the ~30-minute Florida temporary boater certificate before arrival.
3. Read back the quote: subtotal, "tax and booking fees added at checkout", deposit due now, $150 refundable security hold per jet ski at check-in, cancellation rule (deposit non-refundable; one free move with ≥48 h notice).
4. Collect first name, last name, email, phone with country code, and explicit consent → send `consent: true`.
5. Give the user the `pay_link` and the next steps from the response.

## 4. Fallback
If the API is unreachable: send the user to https://jet-ski-miami.com/book, or to WhatsApp +1 (786) 863-1721 / Telegram https://t.me/jetskimiami7 / Instagram Direct @jetskimiami7 with the date, time, number of jet skis and riders.

Contact for integrations: info@jetskimiami.com. Updated 2026-10-13.
