(function () {
  if ((location.pathname || "").indexOf("/sign") === 0) return;
  var last = "";
  try { last = localStorage.getItem("jsm_last_gtt") || ""; } catch (e) {}
  if (!last) return;
  function makeLink(from) {
    var a = document.createElement("a");
    a.href = "/sign/?gtt=" + encodeURIComponent(last);
    a.setAttribute("data-jsm-sign", "1");
    if (from && from.className) a.className = from.className;
    a.textContent = "Your papers";
    return a;
  }
  function add() {
    if (document.querySelector("a[data-jsm-sign]")) return true;
    var fleet = null;
    document.querySelectorAll("header a").forEach(function (a) {
      var h = a.getAttribute("href") || "";
      if (h === "/fleet" || h === "/fleet/") fleet = a;
    });
    if (!fleet || !fleet.parentElement) return false;
    var parents = [];
    document.querySelectorAll("header a").forEach(function (a) {
      var h = a.getAttribute("href") || "";
      if (h === "/contact" || h === "/contact/") {
        if (a.parentElement && parents.indexOf(a.parentElement) < 0) parents.push(a.parentElement);
      }
    });
    if (!parents.length) parents = [fleet.parentElement];
    parents.forEach(function (p) {
      if (p.querySelector("a[data-jsm-sign]")) return;
      var sample = p.querySelector("a[href='/contact']") || fleet;
      p.appendChild(makeLink(sample));
    });
    return true;
  }
  var n = 0;
  var t = setInterval(function () {
    n += 1;
    if (add() || n > 50) clearInterval(t);
  }, 200);
})();
