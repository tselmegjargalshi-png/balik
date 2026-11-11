(function () {
  let S = MD.load();
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const lc = (s) => (s || "").toLocaleLowerCase("tr");
  const byId = Object.fromEntries(MD.allergens.map((a) => [a.id, a]));
  const SKEY = "mavideniz_admin_ok";

  function toast(t) {
    const el = $("#toast");
    el.textContent = t;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2200);
  }
  function persist(msg) {
    try {
      MD.save(S);
      if (msg) toast(msg);
    } catch (e) {
      toast("Depolama dolu. Görselleri küçültün veya silin.");
    }
  }

  /* login */
  function enter() {
    $("#login").style.display = "none";
    $("#app").style.display = "block";
    renderAll();
  }
  function tryLogin() {
    if ($("#pin").value === String(S.info.adminPin || "1234")) {
      try { sessionStorage.setItem(SKEY, "1"); } catch (e) {}
      enter();
    } else {
      $("#err").textContent = "PIN hatalı, tekrar deneyin.";
      $("#pin").value = "";
    }
  }
  $("#go").addEventListener("click", tryLogin);
  $("#pin").addEventListener("keydown", (e) => { if (e.key === "Enter") tryLogin(); });
  $("#logout").addEventListener("click", () => { try { sessionStorage.removeItem(SKEY); } catch (e) {} location.reload(); });
  try { if (sessionStorage.getItem(SKEY)) enter(); } catch (e) {}

  /* tabs */
  document.querySelectorAll("#atabs .tab").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll("#atabs .tab").forEach((x) => x.classList.toggle("active", x === b));
    document.querySelectorAll(".pane").forEach((p) => p.classList.toggle("on", p.id === "p_" + b.dataset.p));
  }));

  /* image helper */
  function compress(file, max = 900, q = 0.78) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onerror = rej;
      r.onload = () => {
        const im = new Image();
        im.onerror = rej;
        im.onload = () => {
          const k = Math.min(1, max / Math.max(im.width, im.height));
          const c = document.createElement("canvas");
          c.width = Math.round(im.width * k);
          c.height = Math.round(im.height * k);
          c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
          res(c.toDataURL("image/jpeg", q));
        };
        im.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }

  /* items */
  function renderStats() {
    const total = S.items.length;
    const sold = S.items.filter((i) => i.soldOut).length;
    const img = S.items.filter((i) => i.img).length;
    $("#stats").innerHTML = `<div class="stat"><b>${total}</b><span>Ürün</span></div><div class="stat"><b>${sold}</b><span>Tükendi</span></div><div class="stat"><b>${img}</b><span>Fotoğraflı</span></div>`;
  }
  function renderFilterCats() {
    const cur = $("#fcat").value || "all";
    $("#fcat").innerHTML = `<option value="all">Tüm kategoriler</option>` + S.categories.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("");
    $("#fcat").value = S.categories.some((c) => c.id === cur) ? cur : "all";
  }
  function renderList() {
    renderStats();
    const cat = $("#fcat").value, q = lc($("#fq").value);
    const list = S.items.filter((i) => (cat === "all" || i.cat === cat) && (!q || lc(i.name + " " + i.desc).includes(q)));
    const catName = (id) => (S.categories.find((c) => c.id === id) || {}).name || "";
    $("#list").innerHTML = list.map((i) => `
      <div class="row" data-id="${i.id}">
        ${i.img ? `<img class="th" src="${i.img}" alt="">` : `<div class="th">🍽️</div>`}
        <div class="t"><b>${esc(i.name)}</b><small>${esc(catName(i.cat))} · ${MD.fmt(i.price)} · ${i.kcal} kcal</small></div>
        <div class="ac">
          <button class="sm ${i.soldOut ? "on" : ""}" data-a="sold">${i.soldOut ? "Tükendi" : "Mevcut"}</button>
          <button class="sm" data-a="edit">Düzenle</button>
          <button class="sm danger" data-a="del">Sil</button>
        </div>
      </div>`).join("") || `<p class="note">Ürün bulunamadı.</p>`;
  }
  $("#fcat").addEventListener("change", renderList);
  $("#fq").addEventListener("input", renderList);
  $("#list").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const id = b.closest(".row").dataset.id;
    const it = S.items.find((x) => x.id === id);
    if (b.dataset.a === "sold") { it.soldOut = !it.soldOut; persist(); renderList(); }
    if (b.dataset.a === "edit") openItem(it);
    if (b.dataset.a === "del" && confirm(`"${it.name}" silinsin mi?`)) {
      S.items = S.items.filter((x) => x.id !== id);
      persist("Ürün silindi");
      renderList();
    }
  });
  $("#addItem").addEventListener("click", () => openItem(null));

  /* modal */
  function openModal(html) { $("#modal").innerHTML = html; $("#mbg").classList.add("open"); }
  function closeModal() { $("#mbg").classList.remove("open"); }
  $("#mbg").addEventListener("click", (e) => { if (e.target.id === "mbg") closeModal(); });

  function openItem(item) {
    const it = item || { id: "u" + Date.now(), cat: S.categories[0].id, name: "", desc: "", kcal: 0, al: [], price: 0, badge: "", soldOut: false, img: "" };
    let img = it.img;
    const chosen = new Set(it.al);
    openModal(`
      <h3>${item ? "Ürünü düzenle" : "Yeni ürün"}</h3>
      <label class="f">Ürün adı<input id="m_name" value="${esc(it.name)}" placeholder="Örnek: Levrek Izgara"></label>
      <label class="f">Açıklama<textarea id="m_desc">${esc(it.desc)}</textarea></label>
      <div class="two">
        <label class="f">Kategori<select id="m_cat">${S.categories.map((c) => `<option value="${c.id}" ${c.id === it.cat ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></label>
        <label class="f">Rozet<select id="m_badge">${["", "İmza", "Şefin Önerisi", "Sezon", "Yeni", "Hafif"].map((b) => `<option ${b === it.badge ? "selected" : ""} value="${b}">${b || "Yok"}</option>`).join("")}</select></label>
      </div>
      <div class="two">
        <label class="f">Fiyat (₺)<input id="m_price" type="number" min="0" inputmode="numeric" value="${it.price}"></label>
        <label class="f">Kalori (kcal)<input id="m_kcal" type="number" min="0" inputmode="numeric" value="${it.kcal}"></label>
      </div>
      <div class="f">Alerjenler
        <div class="agrid" id="m_al">${MD.allergens.map((a) => `<label class="${chosen.has(a.id) ? "on" : ""}"><input type="checkbox" value="${a.id}" ${chosen.has(a.id) ? "checked" : ""}>${MD.chip(a)} ${a.tr}</label>`).join("")}</div>
      </div>
      <div class="f">Ürün fotoğrafı
        <div class="up">📤 Fotoğraf yükle<input type="file" accept="image/*" id="m_img"></div>
        <div class="prev" id="m_prev"></div>
      </div>
      <div class="mactions"><button class="btn ghost" id="m_cancel">Vazgeç</button><button class="btn navy" id="m_save">Kaydet</button></div>`);
    const prev = () => {
      $("#m_prev").innerHTML = img ? `<div class="p"><img src="${img}" alt=""><button class="x" id="m_rm" type="button">×</button></div>` : "";
      const rm = $("#m_rm");
      if (rm) rm.addEventListener("click", () => { img = ""; prev(); });
    };
    prev();
    $("#m_img").addEventListener("change", async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      img = await compress(f, 800, 0.76);
      prev();
    });
    $("#m_al").addEventListener("change", (e) => {
      const cb = e.target;
      cb.checked ? chosen.add(cb.value) : chosen.delete(cb.value);
      cb.closest("label").classList.toggle("on", cb.checked);
    });
    $("#m_cancel").addEventListener("click", closeModal);
    $("#m_save").addEventListener("click", () => {
      const name = $("#m_name").value.trim();
      if (!name) { toast("Ürün adı gerekli"); return; }
      Object.assign(it, {
        name,
        desc: $("#m_desc").value.trim(),
        cat: $("#m_cat").value,
        badge: $("#m_badge").value,
        price: Number($("#m_price").value) || 0,
        kcal: Number($("#m_kcal").value) || 0,
        al: MD.allergens.map((a) => a.id).filter((id) => chosen.has(id)),
        img,
      });
      if (!item) S.items.push(it);
      persist("Kaydedildi ✓");
      closeModal();
      renderList();
    });
  }

  /* categories */
  function renderCats() {
    $("#catlist").innerHTML = S.categories.map((c, i) => {
      const n = S.items.filter((x) => x.cat === c.id).length;
      return `<div class="row" data-i="${i}">
        <div class="th">${c.icon || "🍽️"}</div>
        <div class="t"><b>${esc(c.name)}</b><small>${esc(c.sub || "")} · ${n} ürün</small></div>
        <div class="ac">
          <button class="sm" data-a="up">↑</button><button class="sm" data-a="down">↓</button>
          <button class="sm" data-a="edit">Düzenle</button><button class="sm danger" data-a="del">Sil</button>
        </div></div>`;
    }).join("");
  }
  $("#catlist").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const i = Number(b.closest(".row").dataset.i);
    const a = b.dataset.a;
    if (a === "up" && i > 0) [S.categories[i - 1], S.categories[i]] = [S.categories[i], S.categories[i - 1]];
    if (a === "down" && i < S.categories.length - 1) [S.categories[i + 1], S.categories[i]] = [S.categories[i], S.categories[i + 1]];
    if (a === "edit") return openCat(S.categories[i]);
    if (a === "del") {
      const c = S.categories[i];
      const n = S.items.filter((x) => x.cat === c.id).length;
      if (n) return toast("Önce bu kategorideki ürünleri taşıyın veya silin");
      if (!confirm(`"${c.name}" silinsin mi?`)) return;
      S.categories.splice(i, 1);
    }
    persist();
    renderAll();
  });
  $("#addCat").addEventListener("click", () => openCat(null));
  function openCat(cat) {
    const c = cat || { id: "k" + Date.now(), name: "", sub: "", icon: "🍽️" };
    openModal(`
      <h3>${cat ? "Kategoriyi düzenle" : "Yeni kategori"}</h3>
      <label class="f">Kategori adı<input id="c_name" value="${esc(c.name)}"></label>
      <label class="f">Alt başlık (el yazısı)<input id="c_sub" value="${esc(c.sub)}"></label>
      <label class="f">Simge (emoji)<input id="c_icon" value="${esc(c.icon)}" maxlength="4"></label>
      <div class="mactions"><button class="btn ghost" id="c_cancel">Vazgeç</button><button class="btn navy" id="c_save">Kaydet</button></div>`);
    $("#c_cancel").addEventListener("click", closeModal);
    $("#c_save").addEventListener("click", () => {
      const name = $("#c_name").value.trim();
      if (!name) return toast("Kategori adı gerekli");
      Object.assign(c, { name, sub: $("#c_sub").value.trim(), icon: $("#c_icon").value.trim() });
      if (!cat) S.categories.push(c);
      persist("Kaydedildi ✓");
      closeModal();
      renderAll();
    });
  }

  /* media */
  function renderMedia() {
    $("#heroPrev").innerHTML = S.hero ? `<div class="p"><img src="${S.hero}" alt=""><button class="x" data-h="1">×</button></div>` : `<span class="note">Henüz kapak fotoğrafı yok.</span>`;
    $("#galPrev").innerHTML = S.gallery.map((g, i) => `<div class="p"><img src="${g}" alt=""><button class="x" data-g="${i}">×</button></div>`).join("") || `<span class="note">Galeri boş.</span>`;
  }
  $("#heroFile").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    S.hero = await compress(f, 1400, 0.8);
    persist("Kapak güncellendi ✓");
    renderMedia();
    e.target.value = "";
  });
  $("#galFile").addEventListener("change", async (e) => {
    for (const f of e.target.files) S.gallery.push(await compress(f, 1100, 0.78));
    persist("Galeri güncellendi ✓");
    renderMedia();
    e.target.value = "";
  });
  $("#p_media").addEventListener("click", (e) => {
    const b = e.target.closest(".x");
    if (!b) return;
    if (b.dataset.h) S.hero = "";
    if (b.dataset.g != null && b.dataset.g !== "") S.gallery.splice(Number(b.dataset.g), 1);
    persist("Silindi");
    renderMedia();
  });

  /* info */
  const FIELDS = [
    ["name", "Restoran adı"], ["title", "Karşılama başlığı"], ["slogan", "Slogan (el yazısı)"],
    ["address", "Adres"], ["phone", "Telefon"], ["instagram", "Instagram kullanıcı adı (@ olmadan)"],
    ["hours", "Çalışma saatleri"], ["payments", "Ödeme bilgisi"], ["note", "Alerjen ve fiyat notu"], ["adminPin", "Yönetim PIN kodu"],
  ];
  function renderInfo() {
    $("#infoForm").innerHTML = `<h3>🏠 Restoran bilgileri</h3>` + FIELDS.map(([k, l]) => `<label class="f">${l}<input data-k="${k}" value="${esc(S.info[k])}"></label>`).join("") +
      `<div class="mactions"><button class="btn navy" id="saveInfo">Kaydet</button></div>`;
    $("#saveInfo").addEventListener("click", () => {
      document.querySelectorAll("#infoForm input").forEach((i) => { S.info[i.dataset.k] = i.value.trim(); });
      persist("Bilgiler kaydedildi ✓");
    });
  }

  /* backup */
  $("#exp").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(S)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mavi_deniz_menu_yedek.json";
    a.click();
  });
  $("#impFile").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (!d.items || !d.categories) throw 0;
      S = Object.assign(MD.defaults(), d);
      persist("Yedek yüklendi ✓");
      renderAll();
    } catch (err) { toast("Geçersiz yedek dosyası"); }
    e.target.value = "";
  });
  $("#reset").addEventListener("click", () => {
    if (!confirm("Tüm değişiklikler silinsin ve başlangıç menüsüne dönülsün mü?")) return;
    MD.reset();
    S = MD.load();
    renderAll();
    toast("Menü sıfırlandı");
  });

  function renderAll() {
    renderFilterCats();
    renderList();
    renderCats();
    renderMedia();
    renderInfo();
  }
})();
