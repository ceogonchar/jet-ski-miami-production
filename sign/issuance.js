/* Issuance + URL contract for /sign.
   Legal instrument strings live in index.html and are TEXT FROZEN pending Prime 2026 originals.
   Do not put waiver body copy in this file. */
(function (root) {
  const LIVE_BOOKINGS = {
    GTT000242: {
      id: "GTT000242",
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
  };

  const HOME_FOR = {
    renter: ["CONSENT", "HOME-A", "HOME-B", "HOME-C"],
    husband: ["CONSENT", "HOME-B", "HOME-OP"],
    adult: ["CONSENT", "HOME-B", "HOME-OP"],
    instructor: ["DOCK-E"],
  };
  const DOCK_FOR = {
    renter: ["DOCK-D", "DOCK-E"],
    husband: ["DOCK-D", "DOCK-E"],
    adult: ["DOCK-D", "DOCK-E"],
  };

  function booking(id) {
    if (!id) return null;
    const raw = String(id);
    return LIVE_BOOKINGS[raw] || LIVE_BOOKINGS[raw.toUpperCase()] || null;
  }

  function signUrl(opts) {
    const o = opts || {};
    const q = new URLSearchParams();
    if (o.gtt) q.set("gtt", o.gtt);
    if (o.who) q.set("who", o.who);
    if (o.i != null && o.i !== "") q.set("i", String(o.i));
    if (o.dock) q.set("dock", "1");
    if (o.demo) q.set("demo", o.demo === true ? "1" : String(o.demo));
    const pre = o.prefill || {};
    ["name", "email", "phone", "dob", "addr", "city", "state", "zip"].forEach((k) => {
      if (pre[k]) q.set(k, pre[k]);
    });
    const path = "/sign/";
    const s = q.toString();
    return s ? path + "?" + s : path;
  }

  function absolute(path) {
    try {
      return new URL(path, location.origin).href;
    } catch (e) {
      return path;
    }
  }

  function isMinor(p) {
    return p && (p.role === "minor" || (function () {
      const parts = String(p.dob || "").split("/");
      if (parts.length !== 3) return false;
      const mo = +parts[0], d = +parts[1], y = +parts[2];
      if (!mo || !d || !y) return false;
      const dt = new Date(y, mo - 1, d);
      const now = new Date();
      let a = now.getFullYear() - dt.getFullYear();
      const m = now.getMonth() - dt.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dt.getDate())) a--;
      return a < 18;
    })());
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
    out.push({
      label: "Renter · home (A then B" + (roster.some(isMinor) ? ", C if child on roster" : "") + ")",
      who: "renter",
      person: renterPrefill.name || "Renter",
      role: "renter",
      home: ["CONSENT", "HOME-A", "HOME-B"].concat(roster.some(isMinor) ? ["HOME-C"] : []),
      dock: ["DOCK-D", "DOCK-E"],
      href: signUrl({ gtt: b.id, who: "renter", demo: demo, prefill: renterPrefill }),
      dockHref: signUrl({ gtt: b.id, who: "renter", dock: true, demo: demo }),
    });
    roster.filter((p) => p.role === "adult" || /husband/i.test(p.relation || "")).forEach((p, n) => {
      const who = n === 0 ? "husband" : "adult";
      const prefill = { name: p.name, phone: p.phone, email: p.email, dob: p.dob };
      out.push({
        label: (p.relation || "Adult passenger") + " · own release (not the rental)",
        who: who,
        i: n === 0 ? "" : String(n),
        person: p.name || p.relation || "Adult",
        role: "adult",
        home: ["CONSENT", "HOME-B", "HOME-OP"],
        dock: ["DOCK-D", "DOCK-E"],
        href: signUrl({ gtt: b.id, who: who, i: n === 0 ? "" : n, demo: demo, prefill: prefill }),
        dockHref: signUrl({ gtt: b.id, who: who, i: n === 0 ? "" : n, dock: true, demo: demo }),
      });
    });
    out.push({
      label: "Instructor · Florida 313A pad (after a real check ride)",
      who: "instructor",
      person: "Staff",
      role: "instructor",
      home: [],
      dock: ["DOCK-E"],
      href: signUrl({ gtt: b.id, who: "instructor", dock: true, demo: demo }),
      dockHref: signUrl({ gtt: b.id, who: "instructor", dock: true, demo: demo }),
    });
    return out;
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
    const w = who || "renter";
    let list = (HOME_FOR[w] || HOME_FOR.renter).slice();
    if (w === "renter" && !hasMinors) list = list.filter((x) => x !== "HOME-C");
    return list;
  }

  function neededAtDock(who) {
    return (DOCK_FOR[who || "renter"] || DOCK_FOR.renter).slice();
  }

  function readLocalPack(gtt, who) {
    const id = gtt || "";
    const keys = [
      "jsm_pack_" + id + "_" + (who || "renter"),
      "jsm_pack_" + id,
    ];
    for (let i = 0; i < keys.length; i++) {
      try {
        const raw = localStorage.getItem(keys[i]);
        if (raw) return JSON.parse(raw) || [];
      } catch (e) {}
    }
    return [];
  }

  function codesOnFile(items) {
    const have = {};
    (items || []).forEach((row) => {
      const c = row.instrument_code || (row.payload && row.payload.instrument_code);
      if (c) have[c] = row;
    });
    return have;
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

  function smsBody(b, href) {
    const id = (b && b.id) || "";
    const date = (b && b.date) || "";
    const start = (b && b.start) || "";
    const arrive = (b && b.arrive) || "";
    return (
      "Jet Ski Miami | " +
      date +
      " " +
      start +
      "\nSign your papers (names filled from the booking):\n" +
      href +
      "\nForward to every adult. Kids don't sign. Arrive " +
      arrive +
      ".\nBring the card you paid with + the same photo ID."
    );
  }

  root.JSMIssuance = {
    LIVE_BOOKINGS: LIVE_BOOKINGS,
    booking: booking,
    signUrl: signUrl,
    absolute: absolute,
    isMinor: isMinor,
    linksForBooking: linksForBooking,
    applyQueryPrefill: applyQueryPrefill,
    neededAtHome: neededAtHome,
    neededAtDock: neededAtDock,
    readLocalPack: readLocalPack,
    codesOnFile: codesOnFile,
    launchCall: launchCall,
    smsBody: smsBody,
  };
})(window);
