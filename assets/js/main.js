/* Keyaki Sushi & Grill – Interaktionen */
(function () {
  "use strict";

  /* Kontaktdaten für Reservierungsanfragen.
     WHATSAPP: internationale Nummer ohne +/Leerzeichen, z. B. "4915112345678".
     EMAIL: z. B. "info@sushi-grill-keyaki.de". Leer lassen = Option ausblenden. */
  var CONFIG = {
    PHONE: "+4921519756668",
    PHONE_LABEL: "02151 - 9756668",
    WHATSAPP: "",
    EMAIL: ""
  };

  var body = document.body;
  var header = document.querySelector(".header");

  /* Mobile Navigation */
  var toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".nav-link").forEach(function (l) {
      l.addEventListener("click", function () { body.classList.remove("nav-open"); });
    });
  }

  /* Sticky Header + Back-to-top */
  var toTop = document.querySelector(".back-to-top");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-sticky", y > 160);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0 }); });

  /* Scroll-Reveal */
  var revealEls = document.querySelectorAll(".reveal, .reveal-img");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Tabs */
  document.querySelectorAll("[data-tabs]").forEach(function (wrap) {
    var links = wrap.querySelectorAll(".tab-link");
    var panes = wrap.querySelectorAll(".tab-pane");
    function activate(id, scroll) {
      links.forEach(function (l) {
        var on = l.dataset.tab === id;
        l.classList.toggle("is-active", on);
        l.setAttribute("aria-selected", on ? "true" : "false");
      });
      panes.forEach(function (p) { p.classList.toggle("is-active", p.id === id); });
      if (scroll) wrap.scrollIntoView({ block: "start" });
    }
    links.forEach(function (l) {
      l.addEventListener("click", function () {
        activate(l.dataset.tab);
        if (wrap.hasAttribute("data-tabs-hash")) history.replaceState(null, "", "#" + l.dataset.tab);
      });
    });
    function fromHash() {
      var id = decodeURIComponent(location.hash.slice(1));
      if (id && wrap.querySelector(".tab-pane#" + CSS.escape(id))) activate(id, true);
    }
    if (wrap.hasAttribute("data-tabs-hash")) {
      fromHash();
      window.addEventListener("hashchange", fromHash);
    }
  });

  /* Lightbox */
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  if (items.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.innerHTML = '<img alt=""><button class="lb-close" aria-label="Schließen">&times;</button>' +
      '<button class="lb-prev" aria-label="Vorheriges Bild">&#8249;</button><button class="lb-next" aria-label="Nächstes Bild">&#8250;</button>';
    body.appendChild(lb);
    var img = lb.querySelector("img");
    var idx = 0;
    function show(i) {
      idx = (i + items.length) % items.length;
      img.src = items[idx].getAttribute("href");
      img.alt = (items[idx].querySelector("img") || {}).alt || "";
    }
    function close() { lb.classList.remove("is-open"); body.style.overflow = ""; }
    items.forEach(function (a, i) {
      a.addEventListener("click", function (e) {
        e.preventDefault(); show(i); lb.classList.add("is-open"); body.style.overflow = "hidden";
      });
    });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* Karussell */
  document.querySelectorAll("[data-slider]").forEach(function (s) {
    var track = s.querySelector(".slider-track");
    var n = track.children.length;
    var i = 0;
    function go(k) {
      i = (k + n) % n;
      track.style.transform = "translateX(" + (-100 * i) + "%)";
      var sync = s.getAttribute("data-slider");
      if (sync) {
        document.querySelectorAll("[data-slider-sync='" + sync + "'] .slider-track").forEach(function (t) {
          t.style.transform = "translateX(" + (-100 * i) + "%)";
        });
      }
    }
    var root = s.closest("[data-slider-root]") || s;
    var prev = root.querySelector("[data-prev]");
    var next = root.querySelector("[data-next]");
    if (prev) prev.addEventListener("click", function () { go(i - 1); });
    if (next) next.addEventListener("click", function () { go(i + 1); });
    var timer = setInterval(function () { go(i + 1); }, 6000);
    root.addEventListener("mouseenter", function () { clearInterval(timer); });
  });

  /* Team-/Bereichsliste mit Bildwechsel */
  document.querySelectorAll("[data-swap]").forEach(function (list) {
    var target = document.querySelector(list.getAttribute("data-swap"));
    list.querySelectorAll("li[data-img]").forEach(function (li) {
      li.addEventListener("mouseenter", function () {
        list.querySelectorAll("li").forEach(function (x) { x.classList.remove("is-active"); });
        li.classList.add("is-active");
        target.style.opacity = 0;
        setTimeout(function () { target.src = li.dataset.img; target.style.opacity = 1; }, 200);
      });
    });
  });

  /* Google Maps erst nach Zustimmung laden (DSGVO) */
  document.querySelectorAll("[data-map-consent]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var wrap = btn.closest(".map-wrap");
      var f = document.createElement("iframe");
      f.src = wrap.dataset.src;
      f.loading = "lazy";
      f.title = "Anfahrt Restaurant Keyaki";
      f.referrerPolicy = "no-referrer-when-downgrade";
      wrap.innerHTML = "";
      wrap.appendChild(f);
    });
  });

  /* Reservierungs-/Kontaktformulare */
  function formatDate(v) {
    if (!v) return "";
    var p = v.split("-");
    return p.length === 3 ? p[2] + "." + p[1] + "." + p[0] : v;
  }
  document.querySelectorAll("form[data-request]").forEach(function (form) {
    var status = form.querySelector(".form-status");
    var waBtn = form.querySelector("[data-send='whatsapp']");
    var mailBtn = form.querySelector("[data-send='mail']");
    if (waBtn && !CONFIG.WHATSAPP) waBtn.hidden = true;
    if (mailBtn && !CONFIG.EMAIL) mailBtn.hidden = true;

    function message() {
      var d = new FormData(form);
      var type = form.dataset.request;
      var lines = [type === "reservation" ? "Tischreservierung – Keyaki Sushi & Grill" : "Anfrage – Keyaki Sushi & Grill", ""];
      if (d.get("name")) lines.push("Name: " + d.get("name"));
      if (d.get("phone")) lines.push("Telefon: " + d.get("phone"));
      if (d.get("email")) lines.push("E-Mail: " + d.get("email"));
      if (d.get("date")) lines.push("Datum: " + formatDate(d.get("date")));
      if (d.get("time")) lines.push("Uhrzeit: " + d.get("time") + " Uhr");
      if (d.get("persons")) lines.push("Personen: " + d.get("persons"));
      if (d.get("message")) lines.push("", d.get("message"));
      return lines.join("\n");
    }

    function send(channel) {
      if (!form.reportValidity()) return;
      var text = message();
      if (channel === "whatsapp" && CONFIG.WHATSAPP) {
        window.open("https://wa.me/" + CONFIG.WHATSAPP + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      } else if (channel === "mail" && CONFIG.EMAIL) {
        location.href = "mailto:" + CONFIG.EMAIL + "?subject=" + encodeURIComponent(text.split("\n")[0]) + "&body=" + encodeURIComponent(text);
      } else {
        if (status) {
          status.innerHTML = 'Vielen Dank! Bitte bestätigen Sie Ihre Reservierung telefonisch unter <a href="tel:' +
            CONFIG.PHONE + '"><strong>' + CONFIG.PHONE_LABEL + "</strong></a>.";
        }
        location.href = "tel:" + CONFIG.PHONE;
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      send(CONFIG.WHATSAPP ? "whatsapp" : (CONFIG.EMAIL ? "mail" : "phone"));
    });
    form.querySelectorAll("[data-send]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); send(b.dataset.send); });
    });

    var date = form.querySelector("input[type='date']");
    if (date) {
      var t = new Date();
      date.min = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
    }
  });

  /* Aktuelles Jahr im Footer */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
