/* All in 1 Sport Pub – načítanie obsahu z /content/*.json (upravuje sa v /admin) */
(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const load = (name) => fetch(`content/${name}.json`, { cache: "no-cache" }).then((r) => {
    if (!r.ok) throw new Error(name);
    return r.json();
  });

  const MONTHS = ["jan", "feb", "mar", "apr", "máj", "jún", "júl", "aug", "sep", "okt", "nov", "dec"];
  const WEEKDAYS = ["nedeľa", "pondelok", "utorok", "streda", "štvrtok", "piatok", "sobota"];
  const WEEKDAYS_ACC = ["v nedeľu", "v pondelok", "v utorok", "v stredu", "vo štvrtok", "v piatok", "v sobotu"];

  const ICONS = {
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    Kvíz: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11h-9l-5 4v-4H4z"/><path d="M10 9a2 2 0 1 1 2.5 2c-.5.2-.5.5-.5 1.2M12 14v.2"/></svg>',
    Šípky: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="13" r="8"/><circle cx="11" cy="13" r="4"/><path d="M12 12l8-8m0 0 .5-2.5M20 4l2.5-.5"/></svg>',
    "Športový prenos": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    Párty: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></svg>',
    Iné: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.3C16.7 2.3 15.7 2 14.6 2 12.2 2 10.6 3.5 10.6 6.2v2.3H8v3.6h2.6V22H14v-9.9h2.7l.4-3.6z"/></svg>',
  };

  const price = (n) => Number(n).toLocaleString("sk-SK", { style: "currency", currency: "EUR" });
  const toMin = (t) => {
    const [h, m] = String(t || "0:0").split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const fmtTime = (t) => String(t || "").trim();
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  /* ---------- Nastavenia ---------- */
  function renderSettings(s) {
    if (s.oznam && s.oznam.zobrazit && s.oznam.text) {
      $("#notice-text").textContent = s.oznam.text;
      $("#notice").hidden = false;
    }
    if (s.telefon) {
      const href = "tel:" + s.telefon.replace(/[^\d+]/g, "");
      document.querySelectorAll("[data-tel]").forEach((a) => (a.href = href));
      $("#phone-big").textContent = s.telefon;
      document.querySelectorAll("[data-tel-text]").forEach((a) => (a.textContent = s.telefon));
    }
    if (s.adresa) {
      $("#address").textContent = s.adresa;
      const q = encodeURIComponent("All in 1 Sport Pub, " + s.adresa);
      $("#maps-link").href = "https://www.google.com/maps/search/?api=1&query=" + q;
      $("#maps-link2").href = $("#maps-link").href;
      $("#map-address").textContent = s.adresa;
      // Google mapa sa vloží nad ilustráciu; ak sa nenačíta, ostane vidieť ilustrácia s adresou
      const frame = document.createElement("iframe");
      frame.className = "map__frame";
      frame.title = "Mapa – All in 1 Sport Pub";
      frame.loading = "lazy";
      frame.referrerPolicy = "no-referrer-when-downgrade";
      frame.src = "https://www.google.com/maps?q=" + encodeURIComponent("All in 1 Sport Pub, " + s.adresa) + "&z=16&output=embed";
      $("#map-box").appendChild(frame);
    }

    const k = s.katering;
    if (k && k.zobrazit) {
      if (k.nadpis) $("#kat-title").textContent = k.nadpis;
      $("#kat-text").textContent = k.text || "";
      const photos = (k.fotky || []).map((f) => (typeof f === "string" ? f : f && f.foto)).filter(Boolean).slice(0, 2);
      $("#kat-photos").innerHTML = photos.map((src) => `<img src="${esc(src)}" alt="Párty misa z All in 1" loading="lazy">`).join("");
      $("#katering").hidden = false;
    } else {
      $("#katering").remove();
      const navLink = document.querySelector('.nav__links a[href="#katering"]');
      if (navLink) navLink.remove();
    }
    const wolt = $("#wolt-link");
    if (s.wolt) wolt.href = s.wolt; else wolt.remove();

    const socials = [
      ["instagram", "Instagram", s.instagram],
      ["facebook", "Facebook", s.facebook],
    ].filter((x) => x[2]);
    $("#social").innerHTML = socials.map(([k, label, url]) =>
      `<a class="social-btn" href="${esc(url)}" target="_blank" rel="noopener">${ICONS[k]} Napísať na ${label}</a>`).join("");
    $("#footer-social").innerHTML = socials.map(([k, label, url]) =>
      `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${label}">${ICONS[k]}</a>`).join("");
  }

  /* ---------- Otváracie hodiny ---------- */
  function renderHours(h) {
    const days = h.dni || [];
    const now = new Date();
    const todayIdx = (now.getDay() + 6) % 7; // 0 = pondelok

    $("#hours").innerHTML = days.map((d, i) => {
      const closed = d.zatvorene || !d.od || !d.do;
      const cls = [closed ? "is-closed" : "", i === todayIdx ? "is-today" : ""].join(" ").trim();
      return `<li class="${cls}">
        <span class="hours__clock">${ICONS.clock}</span>
        <span class="hours__day">${esc(d.den)}${i === todayIdx ? '<span class="hours__today">dnes</span>' : ""}</span>
        <span class="hours__time">${closed ? "Zatvorené" : `${esc(fmtTime(d.od))} – ${esc(fmtTime(d.do))}`}</span>
      </li>`;
    }).join("");
    if (h.poznamka) $("#hours-note").textContent = h.poznamka;

    // Stav „otvorené / zatvorené“ v hlavičke
    if (days.length !== 7) return;
    const mins = now.getHours() * 60 + now.getMinutes();
    const win = (i) => {
      const d = days[(i + 7) % 7];
      if (d.zatvorene || !d.od || !d.do) return null;
      const o = toMin(d.od);
      let c = toMin(d.do);
      if (c <= o) c += 24 * 60; // zatvárame po polnoci
      return [o, c, d];
    };
    let open = null;
    const t = win(todayIdx);
    if (t && mins >= t[0] && mins < t[1]) open = t[2];
    const y = win(todayIdx - 1);
    if (!open && y && y[1] > 24 * 60 && mins < y[1] - 24 * 60) open = y[2];

    const status = $("#status");
    if (open) {
      status.classList.add("is-open");
      $("#status-text").textContent = `Teraz otvorené · do ${fmtTime(open.do)}`;
    } else {
      let text = "Teraz zatvorené";
      for (let k = 0; k < 7; k++) {
        const w = win(todayIdx + k);
        if (!w) continue;
        if (k === 0 && mins >= w[0]) continue;
        const when = k === 0 ? "dnes" : k === 1 ? "zajtra" : WEEKDAYS_ACC[(now.getDay() + k) % 7];
        text += ` · otvárame ${when} o ${fmtTime(w[2].od)}`;
        break;
      }
      $("#status-text").textContent = text;
    }
    status.hidden = false;
  }

  /* ---------- Program / akcie ---------- */
  function renderEvents(a) {
    const today = ymd(new Date());
    const list = (a.akcie || [])
      .filter((e) => e.nazov && (!e.datum || String(e.datum).slice(0, 10) >= today))
      .sort((x, y) => String(x.datum).localeCompare(String(y.datum)))
      .slice(0, 9);

    if (!list.length) {
      $("#events").innerHTML = `<div class="events__empty"><strong>Program pripravujeme</strong><p class="muted">Najnovšie akcie a kvízy nájdeš na našom Instagrame a Facebooku.</p></div>`;
      return;
    }
    $("#events").innerHTML = list.map((e) => {
      const d = e.datum ? new Date(String(e.datum).slice(0, 10) + "T12:00:00") : null;
      const isToday = String(e.datum).slice(0, 10) === today;
      const icon = ICONS[e.typ] || ICONS["Iné"];
      const when = d ? `${isToday ? "dnes" : WEEKDAYS[d.getDay()]} ${d.getDate()}. ${d.getMonth() + 1}.${e.cas ? " · od " + esc(fmtTime(e.cas)) : ""}` : esc(e.cas || "");
      const img = e.foto ? `<img class="event__img" src="${esc(e.foto)}" alt="" loading="lazy">` : "";
      return `<article class="event${img ? " event--with-img" : ""}${isToday ? " is-today" : ""}">
        ${img}
        <div style="display:flex;gap:inherit">
          ${d ? `<div class="event__date"><span class="event__day">${d.getDate()}</span><span class="event__month">${MONTHS[d.getMonth()]}</span></div>` : ""}
          <div class="event__body">
            <span class="event__type">${icon}${esc(e.typ || "Akcia")}${isToday ? '<span class="event__today">Dnes</span>' : ""}</span>
            <h3>${esc(e.nazov)}</h3>
            <p class="event__when">${when}</p>
            ${e.popis ? `<p class="event__desc">${esc(e.popis)}</p>` : ""}
          </div>
        </div>
      </article>`;
    }).join("");
  }

  /* ---------- Menu ---------- */
  function renderMenu(m) {
    const cats = (m.kategorie || []).filter((c) => (c.polozky || []).length);
    const tabs = $("#menu-tabs");
    const listEl = $("#menu-list");

    const show = (i) => {
      tabs.querySelectorAll(".tab").forEach((b, j) => b.setAttribute("aria-selected", String(i === j)));
      const c = cats[i];
      listEl.innerHTML = c.polozky.map((p) => {
        const meta = [p.gramaz, p.alergeny ? `alergény: ${p.alergeny}` : ""].filter(Boolean).join(" · ");
        return `<div class="dish">
          ${p.foto ? `<img class="dish__img" src="${esc(p.foto)}" alt="${esc(p.nazov)}" loading="lazy">` : ""}
          <div class="dish__body">
            <div class="dish__top">
              <span class="dish__name">${esc(p.nazov)}${p.oblubene ? '<span class="badge">Obľúbené</span>' : ""}</span>
              <span class="dish__dots"></span>
              <span class="dish__price">${p.cena !== "" && p.cena != null ? price(p.cena) : ""}</span>
            </div>
            ${meta ? `<p class="dish__meta">${esc(meta)}</p>` : ""}
            ${p.popis ? `<p class="dish__desc">${esc(p.popis)}</p>` : ""}
          </div>
        </div>`;
      }).join("");
      listEl.style.animation = "none";
      void listEl.offsetWidth;
      listEl.style.animation = "";
    };

    tabs.innerHTML = cats.map((c, i) =>
      `<button class="tab" role="tab" aria-selected="false" data-i="${i}">${c.ikona ? `<span class="tab__emoji" aria-hidden="true">${esc(c.ikona)}</span>` : ""}${esc(c.nazov)}</button>`).join("");
    tabs.addEventListener("click", (ev) => {
      const b = ev.target.closest(".tab");
      if (!b) return;
      show(Number(b.dataset.i));
      b.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
    if (cats.length) show(0);
    if (m.poznamka) $("#menu-note").textContent = m.poznamka;

    // Galéria – všetky jedlá, ktoré majú v admine nahratú fotku
    const withPhoto = cats.flatMap((c) => c.polozky).filter((p) => p.foto);
    const gallery = $("#gallery");
    if (withPhoto.length) {
      gallery.innerHTML = withPhoto.map((p) =>
        `<figure><img src="${esc(p.foto)}" alt="${esc(p.nazov)}" loading="lazy"><figcaption>${esc(p.nazov)}<span>${p.cena != null && p.cena !== "" ? price(p.cena) : ""}</span></figcaption></figure>`).join("");
    } else {
      gallery.remove();
    }
  }

  /* ---------- Rezervácia ---------- */
  // Na mobile tlačidlá „Rezervovať“ rovno vytočia číslo, na počítači posunú na kartu s číslom.
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-reserve]");
    if (!btn) return;
    const card = $("#rezervacie");
    if (isTouch) {
      const tel = $("#phone-big").getAttribute("href");
      if (tel) { ev.preventDefault(); window.location.href = tel; return; }
    }
    ev.preventDefault();
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.remove("flash");
    void card.offsetWidth;
    card.classList.add("flash");
  });
  const copyBtn = $("#copy-phone");
  copyBtn.addEventListener("click", () => {
    const num = $("#phone-big").textContent.trim();
    const done = () => { copyBtn.textContent = "Skopírované ✓"; setTimeout(() => (copyBtn.textContent = "Kopírovať číslo"), 2000); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(num).then(done, () => window.prompt("Číslo na rezerváciu:", num));
    } else {
      window.prompt("Číslo na rezerváciu:", num);
    }
  });

  /* ---------- Navigácia ---------- */
  const burger = $("#burger");
  const links = $("#nav-links");
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      links.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Štart ---------- */
  const safe = (p, fn) => p.then(fn).catch((err) => console.warn("Obsah sa nenačítal:", err));
  safe(load("nastavenia"), renderSettings);
  safe(load("hodiny"), renderHours);
  safe(load("akcie"), renderEvents);
  safe(load("menu"), renderMenu);
})();
