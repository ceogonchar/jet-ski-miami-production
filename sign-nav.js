(function () {
  if ((location.pathname || "").indexOf("/sign") === 0) return;
  function makeLink(from) {
    var a = document.createElement("a");
    a.href = "/sign/";
    a.setAttribute("data-jsm-sign", "1");
    if (from && from.className) a.className = from.className;
    a.textContent = "Sign papers";
    a.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.assign("/sign/");
    });
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
