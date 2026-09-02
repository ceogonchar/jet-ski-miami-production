/* Record API pointer for /sign.
   TODO: replace this trycloudflare hostname with a stable Gonchar host
   (same path + JSON shape). Until then keep posting here.
   Fail closed on HTTP 5xx. localStorage pack is the guest cache.
   Do not put SmartRez or Didit production keys in this repo. */
(function (root) {
  root.JSM_RECORD_API = root.JSM_RECORD_API || "https://margin-villas-retrieved-couples.trycloudflare.com";
  root.JSM_RECORD_API_TODO = "Stable host for POST /api/record and GET /api/records?booking=";
  root.JSM_RECORD_SHAPE = {
    POST: "/api/record",
    GET: "/api/records?booking={GTT}",
    body: {
      instrument_code: "HOME-A | HOME-B | HOME-C | HOME-OP | DOCK-DR | DOCK-D | DOCK-E | CONSENT",
      booking_id: "GTT000243",
      displayed_text: "string",
      displayed_text_sha256: "hex",
      who: { person_id: "uuid", name: "string", role: "renter | adult2 | instructor" },
      tz_offset_minutes: 0,
      marks: [{ field_id: "Bsig", mark_type: "signature", png: "data:image/png;base64,…", signed_at_utc: "ISO" }],
      fields: {},
      consent_esign_at_utc: "ISO",
      page_url: "/sign/?gtt=GTT000243#homeB",
    },
    ok: { ok: true, record_id: "string", signed_at_utc: "ISO", pdf_url: "string|null" },
  };
})(window);
