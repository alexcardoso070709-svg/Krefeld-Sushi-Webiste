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
    EMAIL: "david.loewnerxu8@gmail.com"
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


  /* Motion-Paket: Fortschrittsbalken, Parallax, Wort-Reveal, Staffelung, Tilt, Button-Glanz */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    body.appendChild(bar);

    var heroBg = document.querySelector(".hero-bg");
    var plx = [].slice.call(document.querySelectorAll(".image-strip img, .showcase-img img, .post-img img, .dish-card-img img"));
    plx.forEach(function (img) { img.classList.add("parallax-img"); });
    var ticking = false;
    function motion() {
      ticking = false;
      var y = window.scrollY, vh = window.innerHeight;
      var max = document.documentElement.scrollHeight - vh;
      bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
      if (heroBg && y < vh * 1.2) heroBg.style.setProperty("--py", (y * 0.35).toFixed(1) + "px");
      plx.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh; /* -1..1 */
        img.style.setProperty("--py", (p * -40).toFixed(1) + "px");
      });
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(motion); } }, { passive: true });
    window.addEventListener("resize", motion);
    motion();

    /* Überschriften Wort für Wort einblenden */
    var splitIO = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-visible"); splitIO.unobserve(e.target); } });
    }, { threshold: 0.2 }) : null;
    document.querySelectorAll(".section-heading h2, .page-hero h1").forEach(function (h) {
      var i = 0;
      (function walk(node) {
        [].slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var w = document.createElement("span"); w.className = "split-word";
              var inner = document.createElement("span"); inner.textContent = part; inner.style.setProperty("--i", i++);
              w.appendChild(inner); frag.appendChild(w);
            });
            n.parentNode.replaceChild(frag, n);
          } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
        });
      })(h);
      h.classList.add("is-split");
      if (splitIO) splitIO.observe(h); else h.classList.add("is-visible");
    });

    /* Listen gestaffelt einblenden */
    document.querySelectorAll(".category-row, .post-grid, .card-grid, .feature-grid, .price-grid, .rules-grid, .team-list, .location-list, .gallery-grid, .hours-list").forEach(function (list) {
      [].slice.call(list.children).forEach(function (c, i) {
        if (!c.classList.contains("reveal")) c.classList.add("reveal");
        c.style.setProperty("--i", i);
      });
      list.classList.add("stagger");
    });
    document.querySelectorAll(".stagger > .reveal:not(.is-visible)").forEach(function (el) {
      if (typeof io !== "undefined") io.observe(el); else el.classList.add("is-visible");
    });

    /* 3D-Tilt auf Karten (nur Maus) */
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.querySelectorAll(".dish-card, .post-card").forEach(function (card) {
        card.classList.add("tilt");
        card.addEventListener("mousemove", function (ev) {
          var r = card.getBoundingClientRect();
          var x = (ev.clientX - r.left) / r.width - 0.5, yy = (ev.clientY - r.top) / r.height - 0.5;
          card.style.transform = "perspective(900px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-yy * 6).toFixed(2) + "deg) translateY(-4px)";
        });
        card.addEventListener("mouseleave", function () { card.style.transform = ""; });
      });
    }

    /* Glanz über Buttons */
    document.querySelectorAll(".btn").forEach(function (b) {
      var s = document.createElement("span"); s.className = "shine"; s.setAttribute("aria-hidden", "true"); b.appendChild(s);
    });
  }

  /* Aktuelles Jahr im Footer */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
