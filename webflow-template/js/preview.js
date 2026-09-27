/* Static-preview helper only. In Webflow the Navbar component handles the mobile menu natively. */
document.querySelectorAll(".menu-button").forEach(function (b) {
  b.addEventListener("click", function () {
    var m = document.querySelector(".nav-menu");
    var open = m.style.display === "flex";
    Object.assign(m.style, open ? { display: "" } : { display: "flex", position: "absolute", top: "84px", left: "0", right: "0", flexDirection: "column", background: "#f2ede4", padding: "24px", gap: "16px", borderBottom: "1px solid rgba(20,22,19,.1)" });
  });
});
document.querySelectorAll("[data-tabs]").forEach(function (w) {
  w.querySelectorAll("[data-tab]").forEach(function (l) {
    l.addEventListener("click", function () {
      w.querySelectorAll("[data-tab]").forEach(function (x) { x.classList.toggle("w--current", x === l); });
      w.querySelectorAll("[data-pane]").forEach(function (p) { p.style.display = p.dataset.pane === l.dataset.tab ? "" : "none"; });
    });
  });
});
