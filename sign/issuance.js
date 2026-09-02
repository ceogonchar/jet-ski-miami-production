/* Issuance + URL contract for /sign.
   HOME-B / D-R / HOME-C body copy lives in index.html and stays frozen.
   Do not put waiver body copy in this file.
   Live guest URL: https://www.jet-ski-miami.com/sign/?gtt=
   /h/{GTT} and sign.jet-ski-miami.com are not wired. */
(function (root) {
  const LIVE_ORIGIN = "https://www.jet-ski-miami.com";
  const TOKEN_HOURS = 72;

  /* Local fixtures only. TODO: fetch SmartRez server-side; never put API keys here. */
  const LIVE_BOOKINGS = {
    GTT000242: {
      id: "GTT000242",
      fixture: true,
      date: "Sat, Aug 29, 2026",
      start: "11:00 AM",
      arrive: "10:30 AM",
      back: "12:00 PM",
      dock: "1819 79th Street Causeway, North Bay Village, FL 33141",
      price: "$369.00",
      paid: "$0.00",
      due: "$369.00",
      hold: "$73.80",
      vessel: "Assigned at the dock · 2 × 1 hour",
      fl: "—",
      hin: "—",
      cap: "2 per ski",
      map: "GG-MAP-2026-08-A",
      overtime: "$28 / 15 min",
      fuel: "$25 + pump",
      recovery: "$180 / hour",
      damageCap: "$5,000",
      skis: 2,
      renter: { name: "Victoria Guest", phone: "509-989-8888", email: "dmytro+victoria-test@gonchar.group" },
      roster: [
        { name: "Victoria Guest", dob: "", role: "renter", phone: "5099898888" },
        { name: "", dob: "", role: "adult", relation: "Husband" },
        { name: "", dob: "", role: "minor", relation: "Child" },
      ],
    },
    GTT000243: {
      id: "GTT000243",
      fixture: true,
      date: "Sat, Aug 29, 2026",
      start: "11:00 AM",
      arrive: "10:30 AM",
      back: "12:00 PM",
      dock: "1819 79th Street Causeway, North Bay Village, FL 33141",
      price: "$189.00",
      paid: "$37.80",
      due: "$151.20",
      hold: "$37.80",
      vessel: "Assigned at the dock · 1 × 1 hour",
      fl: "—",
      hin: "—",
      cap: "2 per ski",
      map: "GG-MAP-2026-08-A",
      overtime: "$28 / 15 min",
      fuel: "$25 + pump",
      recovery: "$180 / hour",
      damageCap: "$5,000",
      skis: 1,
      renter: { name: "Dmytro Honchar", phone: "786-863-1721", email: "dmytro@gonchar.group", dob: "03/17/1992" },
      roster: [
        { name: "Dmytro Honchar", dob: "03/17/1992", role: "renter", phone: "7868631721" },
      ],
    },
    GTT000258: {
      id: "GTT000258",
      fixture: true,
      date: "Sat, Sep 5, 2026",
      start: "10:00 AM",
      arrive: "9:30 AM",
      back: "11:00 AM",
      dock: "1819 79th Street Causeway, North Bay Village, FL 33141",
      price: "$369.00",
      paid: "$73.80",
      due: "$295.20",
      hold: "$73.80",
      vessel: "Assigned at the dock · 2 × 1 hour",
      fl: "—",
      hin: "—",
      cap: "2 per ski",
      map: "GG-MAP-2026-08-A",
      overtime: "$28 / 15 min",
      fuel: "$25 + pump",
      recovery: "$180 / hour",
      damageCap: "$5,000",
      skis: 2,
      renter: { name: "Alex Rivera", phone: "305-555-0148", email: "alex+gtt258@test.jetskimiami.local", dob: "04/11/1990" },
      roster: [
        { name: "Alex Rivera", dob: "04/11/1990", role: "renter", phone: "3055550148", email: "alex+gtt258@test.jetskimiami.local" },
        { name: "Jordan Rivera", dob: "09/02/1991", role: "adult", phone: "3055550149", email: "jordan+gtt258@test.jetskimiami.local" },
        { name: "Sam Rivera", dob: "01/15/2016", role: "minor", relation: "Child" },
      ],
    },
  };
  function booking(id) {
    if (!id) return null;
    const raw = String(id).trim();
    return LIVE_BOOKINGS[raw] || LIVE_BOOKINGS[raw.toUpperCase()] || null;
  }

  function isMinor(p) {
    if (!p) return false;
    if (p.role === "minor") return true;
    const parts = String(p.dob || "").split("/");
    if (parts.length !== 3) return false;
    const mo = +parts[0], d = +parts[1];
    let y = +parts[2];
    if (!mo || !d || y !== y) return false;
    if (y >= 0 && y < 100) y += (y > ((new Date().getFullYear() % 100) + 1)) ? 1900 : 2000;
    const dt = new Date(y, mo - 1, d);
    const now = new Date();
    let a = now.getFullYear() - dt.getFullYear();
    const m = now.getMonth() - dt.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dt.getDate())) a--;
    return a < 18;
  }

  function adultsOn(b) {
    return ((b && b.roster) || []).filter((p) => p && !isMinor(p));
  }

  function extraAdultsOn(b) {
    return ((b && b.roster) || []).filter((p) => p && !isMinor(p) && p.role !== "renter");
  }

  function driversOn(b) {
    const roster = (b && b.roster) || [];
    const renter = roster.find((p) => p.role === "renter") || roster[0];
    const extras = extraAdultsOn(b);
    const out = [];
    if (renter) out.push(renter);
    extras.forEach((p) => out.push(p));
    return out;
  }

  /* Keep who=renter|husband|adult|adult2|instructor working for fixtures.
     Opaque t= is minted client-side (gtt|who|exp) until a backend binds it. */
  function normalizeWho(who) {
    const w = String(who || "renter").toLowerCase();
    if (w === "husband" || w === "adult") return "adult2";
    if (w === "extra") return "adult2";
    return w || "renter";
  }

  function isExtraWho(who) {
    const w = normalizeWho(who);
    return w === "adult2" || /^adult\d+$/i.test(w);
  }

  function extraIndexFromWho(who, iQuery) {
    const w = String(who || "").toLowerCase();
    if (w === "husband" || w === "adult" || w === "adult2") return 0;
    const m = w.match(/^adult(\d+)$/);
    if (m) return Math.max(0, (+m[1]) - 2);
    if (iQuery != null && iQuery !== "") return Math.max(0, +iQuery);
    return 0;
  }

  function whoForExtra(n) {
    return "adult" + (n + 2);
  }

  function b64url(s) {
    try {
      return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    } catch (e) {
      return "";
    }
  }
  function unb64url(s) {
    try {
      let t = String(s || "").replace(/-/g, "+").replace(/_/g, "/");
      while (t.length % 4) t += "=";
      return atob(t);
    } catch (e) {
      return "";
    }
  }

  function makeToken(gtt, who, hours) {
    const exp = Date.now() + (hours || TOKEN_HOURS) * 3600 * 1000;
    return b64url(JSON.stringify({ gtt: gtt, who: normalizeWho(who), exp: exp }));
  }

  function parseToken(t) {
    const raw = unb64url(t);
    if (!raw) return null;
    try {
      const o = JSON.parse(raw);
      if (!o || !o.gtt) return null;
      return o;
    } catch (e) {
      return null;
    }
  }

  function tokenStatus(t, gtt, who) {
    if (!t) return { ok: true, missing: true };
    const o = parseToken(t);
    if (!o) return { ok: false, reason: "invalid" };
    if (gtt && o.gtt && String(o.gtt) !== String(gtt)) return { ok: false, reason: "mismatch" };
    if (who && o.who && normalizeWho(o.who) !== normalizeWho(who)) return { ok: false, reason: "mismatch" };
    if (o.exp && Date.now() > o.exp) return { ok: false, reason: "expired", exp: o.exp };
    return { ok: true, exp: o.exp, who: o.who, gtt: o.gtt };
  }

  function signUrl(opts) {
    const o = opts || {};
    const q = new URLSearchParams();
    if (o.gtt) q.set("gtt", o.gtt);
    const who = o.who ? String(o.who) : "";
    if (who) q.set("who", who);
    if (o.i != null && o.i !== "") q.set("i", String(o.i));
    if (o.dock) q.set("dock", "1");
    if (o.demo) q.set("demo", o.demo === true ? "1" : String(o.demo));
    if (o.t) q.set("t", o.t);
    else if (o.gtt && who && who !== "instructor" && o.token !== false) {
      q.set("t", makeToken(o.gtt, who));
    }
    const pre = o.prefill || {};
    ["name", "email", "phone", "dob", "addr", "city", "state", "zip"].forEach((k) => {
      if (pre[k]) q.set(k, pre[k]);
    });
    const path = "/sign/";
    const s = q.toString();
    return s ? path + "?" + s : path;
  }

  function absolute(path, origin) {
    const base = origin || (typeof location !== "undefined" && location.origin) || LIVE_ORIGIN;
    try {
      return new URL(path, base).href;
    } catch (e) {
      return path;
    }
  }

  function publicAbsolute(path) {
    return absolute(path, LIVE_ORIGIN);
  }

  function linksForBooking(b, demo) {
    if (!b) return [];
    const roster = (b.roster || []).map((p, idx) => Object.assign({ idx }, p));
    const out = [];
    const renter = roster.find((p) => p.role === "renter") || roster[0];
    const renterPrefill = Object.assign({}, b.renter || {}, {
      name: (renter && renter.name) || (b.renter && b.renter.name) || "",
      phone: (renter && renter.phone) || (b.renter && b.renter.phone) || "",
      email: (renter && renter.email) || (b.renter && b.renter.email) || "",
      dob: (renter && renter.dob) || (b.renter && b.renter.dob) || "",
    });
    const hasChild = roster.some(isMinor);
    out.push({
      label: "Renter · rental then release" + (hasChild ? " · guardian form if a child is on the roster" : ""),
      who: "renter",
      person: renterPrefill.name || "Renter",
      role: "renter",
      home: ["CONSENT", "HOME-A", "HOME-B"].concat(hasChild ? ["HOME-C"] : []),
      dock: ["DOCK-D", "DOCK-E"],
      href: signUrl({ gtt: b.id, who: "renter", demo: demo, prefill: renterPrefill }),
      dockHref: signUrl({ gtt: b.id, who: "renter", dock: true, demo: demo, token: false }),
    });
    extraAdultsOn(b).forEach((p, n) => {
      const who = whoForExtra(n);
      const prefill = { name: p.name, phone: p.phone, email: p.email, dob: p.dob };
      out.push({
        label: "Adult " + (n + 2) + " · own release (not the rental)",
        who: who,
        i: String(n),
        person: p.name || p.relation || ("Adult " + (n + 2)),
        role: "adult",
        home: ["CONSENT", "HOME-B", "HOME-OP"],
        dock: ["DOCK-D", "DOCK-E"],
        href: signUrl({ gtt: b.id, who: who, i: n, demo: demo, prefill: prefill }),
        dockHref: signUrl({ gtt: b.id, who: who, i: n, dock: true, demo: demo, token: false }),
        compatHref: n === 0 ? signUrl({ gtt: b.id, who: "husband", demo: demo, prefill: prefill, token: false }) : "",
      });
    });
    return out;
  }

  function instructorHref(gtt, demo) {
    return signUrl({ gtt: gtt, who: "instructor", dock: true, demo: demo, token: false });
  }

  function applyQueryPrefill(target) {
    const q = new URLSearchParams(location.search);
    const keys = ["name", "email", "phone", "dob", "addr", "city", "state", "zip"];
    keys.forEach((k) => {
      const v = (q.get(k) || "").trim();
      if (v && target && (target[k] == null || target[k] === "")) target[k] = v;
    });
    return target;
  }

  function neededAtHome(who, hasMinors) {
    const w = normalizeWho(who);
    if (w === "instructor") return [];
    if (isExtraWho(w)) return ["CONSENT", "HOME-B", "HOME-OP"];
    let list = ["CONSENT", "HOME-A", "HOME-B"];
    if (hasMinors) list.push("HOME-C");
    return list;
  }

  function neededAtDock(who) {
    const w = normalizeWho(who);
    if (w === "instructor") return ["DOCK-E"];
    return ["DOCK-D", "DOCK-E"];
  }

  function readLocalPack(gtt, who) {
    const id = gtt || "";
    const keys = [
      "jsm_pack_" + id + "_" + (who || "renter"),
      "jsm_pack_" + id + "_adult2",
      "jsm_pack_" + id + "_husband",
      "jsm_pack_" + id + "_adult",
      "jsm_pack_" + id,
    ];
    const seen = {};
    const out = [];
    keys.forEach((k) => {
      try {
        const raw = localStorage.getItem(k);
        if (!raw) return;
        const arr = JSON.parse(raw) || [];
        arr.forEach((row) => {
          const idk = (row.record_id || "") + "|" + (row.instrument_code || "") + "|" + ((row.who && row.who.role) || "");
          if (seen[idk]) return;
          seen[idk] = 1;
          out.push(row);
        });
      } catch (e) {}
    });
    return out;
  }

  function readAllLocalPacks(gtt) {
    const id = gtt || "";
    const out = [];
    const seen = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || k.indexOf("jsm_pack_" + id) !== 0) continue;
        const arr = JSON.parse(localStorage.getItem(k) || "[]") || [];
        arr.forEach((row) => {
          const idk = (row.record_id || "") + "|" + (row.instrument_code || "") + "|" + ((row.who && row.who.name) || "") + "|" + ((row.who && row.who.role) || "");
          if (seen[idk]) return;
          seen[idk] = 1;
          out.push(row);
        });
      }
    } catch (e) {}
    if (!out.length) return readLocalPack(id, "renter");
    return out;
  }

  function codesOnFile(items) {
    const have = {};
    (items || []).forEach((row) => {
      const c = row.instrument_code || (row.payload && row.payload.instrument_code);
      if (c) have[c] = row;
    });
    return have;
  }

  function roleOfRow(row) {
    return ((row && row.who && (row.who.role || row.who.who)) || row.role || "").toLowerCase();
  }

  function nameOfRow(row) {
    return ((row && row.who && row.who.name) || row.name || "").trim();
  }

  function rowsForPerson(items, person, who) {
    const wantWho = normalizeWho(who);
    const wantName = (person && person.name) || "";
    return (items || []).filter((row) => {
      const role = normalizeWho(roleOfRow(row) || "renter");
      const name = nameOfRow(row);
      if (wantName && name && name.toLowerCase() === wantName.toLowerCase()) return true;
      if (wantWho === "renter" && (role === "renter" || !role)) return !wantName || !name || name.toLowerCase() === wantName.toLowerCase();
      if (isExtraWho(wantWho) && (isExtraWho(role) || role === "husband" || role === "adult")) {
        if (!wantName || !name) return role === wantWho || role === "husband" || role === "adult" || role === "adult2";
        return name.toLowerCase() === wantName.toLowerCase();
      }
      return role === wantWho;
    });
  }

  function personHas(items, person, who, code) {
    return rowsForPerson(items, person, who).some((row) => (row.instrument_code || (row.payload && row.payload.instrument_code)) === code);
  }

  /* GO_LIVE_CHECKLIST count — do not eyeball:
     1× HOME-A per booking
     HOME-B = every adult
     HOME-C if anyone < 18
     DOCK-D per adult participant
     DOCK-E per driver + renter
     DOCK-D-R only if shorts refused (never required to launch) */
  function launchGate(b, items) {
    const roster = (b && b.roster) || [];
    const adults = adultsOn(b);
    const drivers = driversOn(b);
    const hasChild = roster.some(isMinor);
    const renter = roster.find((p) => p.role === "renter") || roster[0] || { name: "Renter", role: "renter" };
    const missing = [];
    const matrix = [];

    function mark(person, who, code, required) {
      const ok = personHas(items, person, who, code);
      matrix.push({
        person: (person && (person.name || person.relation)) || who,
        who: who,
        code: code,
        required: !!required,
        ok: ok,
      });
      if (required && !ok) missing.push(code + " · " + ((person && person.name) || who));
      return ok;
    }

    mark(renter, "renter", "HOME-A", true);
    adults.forEach((p, n) => {
      const who = p.role === "renter" ? "renter" : whoForExtra(Math.max(0, extraAdultsOn(b).indexOf(p)));
      mark(p, who, "HOME-B", true);
    });
    if (hasChild) mark(renter, "renter", "HOME-C", true);
    adults.forEach((p) => {
      const who = p.role === "renter" ? "renter" : whoForExtra(Math.max(0, extraAdultsOn(b).indexOf(p)));
      mark(p, who, "DOCK-D", true);
    });
    drivers.forEach((p) => {
      const who = p.role === "renter" ? "renter" : whoForExtra(Math.max(0, extraAdultsOn(b).indexOf(p)));
      mark(p, who, "DOCK-E", true);
    });

    const refuseRows = (items || []).filter((row) => (row.instrument_code || "") === "DOCK-DR");
    refuseRows.forEach((row) => {
      matrix.push({
        person: nameOfRow(row) || "rider",
        who: roleOfRow(row) || "renter",
        code: "DOCK-DR",
        required: false,
        ok: true,
      });
    });

    return {
      missing: missing,
      matrix: matrix,
      refuse: refuseRows.length > 0,
      refuseCount: refuseRows.length,
      needA: 1,
      needB: adults.length,
      needC: hasChild ? 1 : 0,
      needD: adults.length,
      needE: drivers.length,
      launch: missing.length === 0,
      hasChild: hasChild,
    };
  }

  function launchCall(have, opts) {
    const o = opts || {};
    const hasMinors = !!o.hasMinors;
    const who = o.who || "renter";
    const home = neededAtHome(who, hasMinors);
    const dock = neededAtDock(who);
    const missing = home.concat(dock).filter((c) => !have[c]);
    const refuse = !!have["DOCK-DR"];
    return {
      missing: missing,
      refuse: refuse,
      homeOk: home.every((c) => !!have[c]),
      dockOk: dock.every((c) => !!have[c]),
      launch: missing.length === 0,
    };
  }

  function shareCopy(b, link, kind) {
    const id = (b && b.id) || "";
    const date = (b && b.date) || "";
    const start = (b && b.start) || "";
    const arrive = (b && b.arrive) || "";
    const url = link || "";
    const renterLine = "Renter: rental then release. Other adults: your own link.";
    if (kind === "renter") {
      return (
        "Sign your papers: " +
        url +
        "\n" +
        renterLine +
        "\nJet Ski Miami | " +
        id +
        " | " +
        date +
        " " +
        start +
        "\nArrive " +
        arrive +
        ". Bring the card you paid with and the same photo ID."
      );
    }
    return (
      "Sign your papers: " +
      url +
      "\n" +
      renterLine +
      "\nThis link is yours only. Do not use the renter’s link.\nJet Ski Miami | " +
      id +
      " | " +
      date +
      " " +
      start
    );
  }

  function reminderCopy(b) {
    const id = (b && b.id) || "";
    return (
      "Reminder — Jet Ski Miami " +
      id +
      "\nSign your papers on the unique link we sent you. " +
      "Renter: rental then release. Other adults: your own link. Kids do not sign."
    );
  }

  root.JSMIssuance = {
    LIVE_ORIGIN: LIVE_ORIGIN,
    LIVE_BOOKINGS: LIVE_BOOKINGS,
    TOKEN_HOURS: TOKEN_HOURS,
    booking: booking,
    isMinor: isMinor,
    adultsOn: adultsOn,
    extraAdultsOn: extraAdultsOn,
    driversOn: driversOn,
    normalizeWho: normalizeWho,
    isExtraWho: isExtraWho,
    extraIndexFromWho: extraIndexFromWho,
    whoForExtra: whoForExtra,
    makeToken: makeToken,
    parseToken: parseToken,
    tokenStatus: tokenStatus,
    signUrl: signUrl,
    absolute: absolute,
    publicAbsolute: publicAbsolute,
    linksForBooking: linksForBooking,
    instructorHref: instructorHref,
    applyQueryPrefill: applyQueryPrefill,
    neededAtHome: neededAtHome,
    neededAtDock: neededAtDock,
    readLocalPack: readLocalPack,
    readAllLocalPacks: readAllLocalPacks,
    codesOnFile: codesOnFile,
    personHas: personHas,
    launchGate: launchGate,
    launchCall: launchCall,
    shareCopy: shareCopy,
    reminderCopy: reminderCopy,
    smsBody: function (b, href) {
      return shareCopy(b, href, "renter");
    },
  };
})(window);
