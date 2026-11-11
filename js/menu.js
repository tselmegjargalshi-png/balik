(function () {
  const S = MD.load();
  const $ = (s) => document.querySelector(s);
  const byId = Object.fromEntries(MD.allergens.map((a) => [a.id, a]));
  const FKEY = "mavideniz_filter_v1";
  let selected = new Set();
  try { selected = new Set(JSON.parse(localStorage.getItem(FKEY)) || []); } catch (e) {}
  let query = "";

  const lc = (s) => (s || "").toLocaleLowerCase("tr");
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const telHref = (p) => "tel:" + p.replace(/[^\d+]/g, "");

  function visible(it) {
    if (it.al.some((a) => selected.has(a))) return false;
    if (query) {
      const t = lc(it.name + " " + it.desc);
      if (!t.includes(lc(query))) return false;
    }
    return true;
  }

  function cardHtml(it, i) {
    const als = it.al.map((a) => MD.chip(byId[a])).join("");
    const names = it.al.length ? it.al.map((a) => byId[a].tr).join(", ") : "Bilinen alerjen içermez";
    const badge = it.soldOut ? '<span class="badge sold">Tükendi</span>' : it.badge ? `<span class="badge">${esc(it.badge)}</span>` : "";
    const photo = it.img ? `<img class="photo" loading="lazy" src="${it.img}" alt="${esc(it.name)}">` : "";
    return `<article class="card ${it.soldOut ? "sold" : ""}" style="animation-delay:${Math.min(i, 8) * 45}ms" data-id="${it.id}">
      ${badge}
      <div class="top ${badge ? "hasbadge" : ""}">
        <div style="min-width:0"><h3>${esc(it.name)}</h3><p>${esc(it.desc)}</p></div>
        ${photo}
      </div>
      <div class="bottom">
        <div class="meta"><span class="kcal">🔥 ${it.kcal} kcal</span>${als}</div>
        <div class="price">${MD.fmt(it.price)}</div>
      </div>
      <div class="detail"><b>Alerjenler:</b> ${esc(names)}</div>
    </article>`;
  }

  function renderMenu() {
    let html = "";
    let any = false;
    S.categories.forEach((c) => {
      const list = S.items.filter((it) => it.cat === c.id && visible(it));
      if (!list.length) return;
      any = true;
      html += `<section class="cat" id="cat_${c.id}" data-cat="${c.id}">
        <div class="head"><h2><span class="ico">${c.icon || ""}</span>${esc(c.name)}</h2><div class="sub script">${esc(c.sub || "")}</div></div>
        ${list.map(cardHtml).join("")}
      </section>`;
    });
    if (!any) html = `<div class="empty"><div class="big">🐚</div><h3>Sonuç bulunamadı</h3><p>Arama veya alerjen filtresini değiştirmeyi deneyin.</p></div>`;
    $("#menu").innerHTML = html;
    renderTabs();
    observe();
  }

  function renderTabs() {
    const vis = S.categories.filter((c) => S.items.some((it) => it.cat === c.id && visible(it)));
    $("#tabs").innerHTML = vis.map((c, i) => `<button class="tab ${i === 0 ? "active" : ""}" data-c="${c.id}">${esc(c.name)}</button>`).join("");
    document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => {
      const el = document.getElementById("cat_" + b.dataset.c);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
  }

  let io;
  function observe() {
    if (io) io.disconnect();
    io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.dataset.cat;
          document.querySelectorAll(".tab").forEach((t) => {
            const on = t.dataset.c === id;
            t.classList.toggle("active", on);
            if (on) t.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
          });
        }
      });
    }, { rootMargin: "-160px 0px -65% 0px" });
    document.querySelectorAll(".cat").forEach((c) => io.observe(c));
  }

  function renderHero() {
    const i = S.info;
    $("#heroTitle").textContent = i.title;
    $("#heroSlogan").textContent = i.slogan;
    if (S.hero) {
      const h = $(".hero");
      h.classList.add("hasimg");
      h.style.backgroundImage = `url(${S.hero})`;
    }
    const total = S.items.filter((x) => !x.soldOut).length;
    $("#heroStats").innerHTML = `<span>🍽️ ${total} çeşit</span><span>⏰ ${esc(i.hours)}</span>`;
    const m = new Date().getMonth();
    $("#seasonTitle").textContent = `${MD.months[m]} ayında denizde`;
    $("#seasonChips").innerHTML = MD.season[m].map((s) => `<span class="chip live">${s}</span>`).join("") +
      `<div style="width:100%;font-size:13px;color:var(--muted);margin-top:2px">Günün balığı için garsonumuza sorun.</div>`;
    if (S.gallery.length) {
      $("#galleryBox").style.display = "block";
      $("#gallery").innerHTML = S.gallery.map((g) => `<img loading="lazy" src="${g}" alt="Mavi Deniz">`).join("");
    }
  }

  function renderFooter() {
    const i = S.info;
    const mapQ = encodeURIComponent(i.name + " " + i.address);
    $("#footer").innerHTML = `
      <div class="legendsub script">Alerjen rehberi</div>
      <h3>Bilmeniz gerekenler</h3>
      <div class="legend">${MD.allergens.map((a) => `<div>${MD.chip(a)}${a.tr}</div>`).join("")}</div>
      <div class="box"><div class="line">⚠️ <span>${esc(i.note)}</span></div></div>
      <div class="box">
        <h4>${esc(i.name)}</h4>
        <div class="line">📍 <span>${esc(i.address)}</span></div>
        <div class="line">⏰ <span>${esc(i.hours)}</span></div>
        <div class="line">💳 <span>${esc(i.payments)}</span></div>
        <div class="pills">
          <a class="pill map" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${mapQ}">🧭 Yol tarifi</a>
          <a class="pill call" href="${telHref(i.phone)}">📞 ${esc(i.phone)}</a>
          <a class="pill ig" target="_blank" rel="noopener" href="https://instagram.com/${esc(i.instagram)}">📸 @${esc(i.instagram)}</a>
        </div>
      </div>
      <div class="foot"><img src="assets/logo.png" alt="Mavi Deniz"><div class="script" style="font-size:22px;color:var(--lemon)">${esc(i.slogan)}</div><div style="margin-top:6px">Afiyet olsun 🌊</div></div>`;
  }

  /* filter sheet */
  function buildFilter() {
    $("#fgrid").innerHTML = MD.allergens.map((a) => `<button class="fopt ${selected.has(a.id) ? "sel" : ""}" data-a="${a.id}">${MD.chip(a)}${a.tr}</button>`).join("");
    document.querySelectorAll(".fopt").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.a;
      selected.has(id) ? selected.delete(id) : selected.add(id);
      b.classList.toggle("sel");
    }));
  }
  function updateBadge() {
    const n = selected.size;
    $("#fcount").textContent = n;
    $("#btnFilter").classList.toggle("on", n > 0);
  }
  function applyFilter() {
    try { localStorage.setItem(FKEY, JSON.stringify([...selected])); } catch (e) {}
    updateBadge();
    $("#sheetBg").classList.remove("open");
    renderMenu();
    toast(selected.size ? `${selected.size} alerjen filtresi aktif` : "Filtre temizlendi");
  }

  /* surprise */
  function pick(cats) {
    const pool = S.items.filter((it) => cats.includes(it.cat) && !it.soldOut && visible(it));
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  }
  function surprise() {
    const parts = [
      ["Meze", pick(["soguk", "sicak"])],
      ["Ana yemek", pick(["izgara", "firin", "deniz"])],
      ["Tatlı", pick(["tatli"])],
      ["İçecek", pick(["soguki"])],
    ].filter((p) => p[1]);
    const box = $("#combo");
    if (!parts.length) { box.innerHTML = "Filtrenize uygun bir sofra bulunamadı."; box.classList.add("show"); return; }
    const kcal = parts.reduce((s, p) => s + p[1].kcal, 0);
    const price = parts.reduce((s, p) => s + p[1].price, 0);
    box.classList.remove("show");
    void box.offsetWidth;
    box.innerHTML = parts.map((p) => `<div class="l"><span>${esc(p[1].name)}<small>${p[0]}</small></span><span>${MD.fmt(p[1].price)}</span></div>`).join("") +
      `<div class="tot"><span>🔥 ${kcal} kcal</span><span>${MD.fmt(price)}</span></div>`;
    box.classList.add("show");
  }

  function toast(t) {
    const el = $("#toast");
    el.textContent = t;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  /* events */
  $("#btnSearch").addEventListener("click", () => {
    const r = $("#searchRow");
    r.classList.toggle("open");
    if (r.classList.contains("open")) $("#q").focus();
    else { $("#q").value = ""; query = ""; renderMenu(); }
  });
  $("#q").addEventListener("input", (e) => { query = e.target.value.trim(); renderMenu(); });
  $("#btnFilter").addEventListener("click", () => { buildFilter(); $("#sheetBg").classList.add("open"); });
  $("#sheetBg").addEventListener("click", (e) => { if (e.target.id === "sheetBg") $("#sheetBg").classList.remove("open"); });
  $("#fApply").addEventListener("click", applyFilter);
  $("#fClear").addEventListener("click", () => { selected.clear(); buildFilter(); });
  $("#btnSurprise").addEventListener("click", surprise);
  $("#menu").addEventListener("click", (e) => {
    const c = e.target.closest(".card");
    if (c) c.classList.toggle("open");
  });
  const tt = $("#totop");
  window.addEventListener("scroll", () => tt.classList.toggle("show", window.scrollY > 700), { passive: true });
  tt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  document.title = S.info.name + " | Dijital Menü";
  renderHero();
  renderFooter();
  updateBadge();
  renderMenu();
})();
