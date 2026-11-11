/* Mavi Deniz Balık Restoranı: varsayılan veri */
(function () {
  const A = (id, tr, icon, color, text) => ({ id, tr, icon, color, text: text || "#fff" });

  const sesameSvg =
    '<svg viewBox="0 0 24 24"><g fill="#fff"><ellipse cx="8" cy="8" rx="2.2" ry="3.4" transform="rotate(-30 8 8)"/><ellipse cx="16" cy="8" rx="2.2" ry="3.4" transform="rotate(30 16 8)"/><ellipse cx="12" cy="16" rx="2.2" ry="3.4"/></g></svg>';

  const allergens = [
    A("peanut", "Yer fıstığı", "🥜", "#f2b84b", "#3a2500"),
    A("treenut", "Sert kabuklu yemişler", "🌰", "#ee9a3d"),
    A("crustacean", "Kabuklu deniz ürünleri", "🦐", "#2a74c9"),
    A("mollusc", "Yumuşakçalar", "🐚", "#33b3a6"),
    A("fish", "Balık", "🐟", "#1ea1e0"),
    A("egg", "Yumurta", "🥚", "#f1d21c", "#3a3000"),
    A("milk", "Süt", "🥛", "#d9a6cf", "#3a1534"),
    A("gluten", "Gluten", "🌾", "#a8532d"),
    A("soy", "Soya", "🫘", "#33a853"),
    A("sesame", "Susam", sesameSvg, "#f08a24"),
    A("celery", "Kereviz", "🥬", "#8fcb7b", "#17361a"),
    A("mustard", "Hardal", "🧴", "#c99a3f"),
    A("lupin", "Acı bakla", "🌸", "#9a86c9"),
    A("sulphite", "Sülfitler", "🍷", "#8b1e2a"),
  ];

  const categories = [
    { id: "soguk", name: "Soğuk Mezeler", sub: "Sofranın ilk selamı", icon: "🫒" },
    { id: "sicak", name: "Sıcak Mezeler", sub: "Közden, tavadan taze", icon: "🔥" },
    { id: "salata", name: "Salatalar", sub: "Bahçenin ferahlığı", icon: "🥗" },
    { id: "izgara", name: "Izgara Balıklar", sub: "Günün tazesi, közün lezzeti", icon: "🐟" },
    { id: "firin", name: "Fırın ve Tava", sub: "Usta ellerden", icon: "🍋" },
    { id: "deniz", name: "Deniz Mahsulleri", sub: "Mavinin hazineleri", icon: "🦐" },
    { id: "garni", name: "Garnitürler", sub: "Tabağın dostları", icon: "🍟" },
    { id: "tatli", name: "Tatlılar", sub: "Güzel bir final", icon: "🍮" },
    { id: "soguki", name: "Soğuk İçecekler", sub: "Serin yudumlar", icon: "🥤" },
    { id: "sicaki", name: "Sıcak İçecekler", sub: "Boğaz manzarasına eşlik", icon: "☕" },
  ];

  // [kategori, ad, açıklama, kcal, alerjenler, fiyat, rozet]
  const raw = [
    ["soguk", "Haydari", "Süzme yoğurt, sarımsak, nane, dereotu", 190, ["milk"], 165],
    ["soguk", "Atom", "Acılı yoğurt, kırmızı biber, ceviz", 240, ["milk", "treenut"], 185],
    ["soguk", "Deniz Börülcesi", "Zeytinyağı, limon, sarımsak", 120, [], 195],
    ["soguk", "Barbunya Pilaki", "Zeytinyağlı, havuç, patates", 260, ["celery"], 175],
    ["soguk", "Ahtapot Salatası", "Haşlanmış ahtapot, roka, zeytinyağı, limon", 280, ["mollusc", "sulphite"], 520, "Şefin Önerisi"],
    ["soguk", "Levrek Marin", "Zeytinyağı, dereotu, limon, nar ekşisi", 250, ["fish", "mustard"], 390],
    ["soguk", "Girit Ezmesi", "Beyaz peynir, ceviz, zeytinyağı", 330, ["milk", "treenut"], 210],
    ["soguk", "Yaprak Sarma", "Zeytinyağlı, nane ve limon ile", 230, [], 180],
    ["soguk", "Mavi Deniz Meze Tabağı", "Altı çeşit soğuk meze, iki kişilik", 890, ["milk", "treenut", "celery", "fish"], 650, "İmza"],

    ["sicak", "Kalamar Tava", "Çıtır kalamar, tartar sos", 460, ["mollusc", "gluten", "egg", "mustard"], 460],
    ["sicak", "Karides Güveç", "Tereyağı, kaşar, domates", 410, ["crustacean", "milk"], 580],
    ["sicak", "Midye Tava", "Çıtır midye, tarator sos", 430, ["mollusc", "gluten", "egg", "treenut", "sesame"], 380],
    ["sicak", "Paçanga Böreği", "Kaşar, pastırma, domates, yufka", 480, ["gluten", "milk", "egg"], 290],
    ["sicak", "Hamsi Tava", "Mısır unu, taze Karadeniz hamsisi", 500, ["fish", "gluten"], 360, "Sezon"],
    ["sicak", "Ahtapot Izgara", "Közlenmiş patates püresi, zeytinyağı", 340, ["mollusc", "milk"], 720],

    ["salata", "Roka Salatası", "Roka, parmesan, cherry domates, nar ekşisi", 210, ["milk"], 220],
    ["salata", "Çoban Salata", "Domates, salatalık, biber, soğan, zeytinyağı", 130, [], 170],
    ["salata", "Akdeniz Salata", "Mevsim yeşillikleri, susam, hardal sosu", 190, ["sesame", "mustard"], 210],
    ["salata", "Mevsim Salata", "Marul, havuç, mısır, limon", 100, [], 160],
    ["salata", "Karidesli Salata", "Izgara karides, yeşillik, limonlu sos", 320, ["crustacean", "mustard"], 380],

    ["izgara", "Çipura Izgara", "Tek kişilik, limon ve roka ile", 520, ["fish"], 780],
    ["izgara", "Levrek Izgara", "Tek kişilik, zeytinyağı ve limon", 480, ["fish"], 760],
    ["izgara", "Somon Izgara", "Dereotlu, buharda sebze eşliğinde", 640, ["fish"], 890],
    ["izgara", "Lüfer Izgara", "Boğazın efsane balığı", 560, ["fish"], 1150, "Sezon"],
    ["izgara", "Barbun Izgara", "Çıtır kızarmış, limonlu", 450, ["fish"], 690],
    ["izgara", "Kılıç Şiş", "Defne yaprağı, domates, biber", 590, ["fish"], 920],
    ["izgara", "Karışık Balık Tabağı", "Çipura, somon, karides, kalamar, iki kişilik", 1180, ["fish", "crustacean", "mollusc"], 1650, "İmza"],

    ["firin", "Tuzda Levrek", "Kaya tuzunda pişer, masanızda açılır", 540, ["fish", "egg"], 1250, "İmza"],
    ["firin", "Fırında Somon", "Tereyağı, dereotu, limon", 660, ["fish", "milk"], 940],
    ["firin", "Kalkan Tava", "Mısır unu, limon, roka", 620, ["fish", "gluten"], 1390],
    ["firin", "Levrek Buğulama", "Beyaz şarap, mevsim sebzeleri", 510, ["fish", "sulphite", "celery"], 820],
    ["firin", "Hamsi Pilavı", "Fırında, dereotu, kuş üzümü, çam fıstığı", 580, ["fish", "treenut"], 520, "Sezon"],

    ["deniz", "Izgara Karides", "Sarımsak, tereyağı, limon", 360, ["crustacean", "milk"], 640],
    ["deniz", "Kalamar Izgara", "Zeytinyağı, kekik, limon", 300, ["mollusc"], 560],
    ["deniz", "Midye Dolma", "Baharatlı pilav, limon", 280, ["mollusc"], 340],
    ["deniz", "Deniz Mahsulleri Güveç", "Karides, midye, kalamar, domates sosu", 560, ["crustacean", "mollusc", "milk", "celery"], 780],

    ["garni", "Patates Kızartması", "Çıtır, ince kesim", 380, [], 150],
    ["garni", "Tereyağlı Pilav", "Şehriyeli", 300, ["milk", "gluten"], 140],
    ["garni", "Fırın Sebze", "Kabak, patlıcan, biber", 190, [], 170],
    ["garni", "Közlenmiş Biber", "Sarımsak, zeytinyağı", 90, [], 130],

    ["tatli", "Kabak Tatlısı", "Tahin ve ceviz ile", 410, ["sesame", "treenut"], 230],
    ["tatli", "Künefe", "Hatay peyniri, antep fıstığı, şerbet", 640, ["gluten", "milk", "treenut"], 290, "İmza"],
    ["tatli", "İrmik Helvası", "Dondurma eşliğinde", 390, ["gluten", "milk"], 220],
    ["tatli", "Revani", "Portakal şerbetli", 450, ["gluten", "egg"], 210],
    ["tatli", "Limonlu Sorbe", "Ferah ve hafif", 160, [], 160, "Hafif"],
    ["tatli", "Fırın Sütlaç", "Bakır sahanda, kızarmış yüzey", 320, ["milk"], 190],

    ["soguki", "Ayran", "Bol köpüklü", 90, ["milk"], 70],
    ["soguki", "Ev Yapımı Limonata", "Taze nane ile", 120, [], 110],
    ["soguki", "Şalgam Suyu", "Acılı veya acısız", 40, [], 80],
    ["soguki", "Taze Portakal Suyu", "Sıkma", 110, [], 140],
    ["soguki", "Soda", "Maden suyu", 0, [], 60],
    ["soguki", "Kola", "33 cl", 140, [], 90],
    ["soguki", "Beyaz Şarap", "Kadeh", 120, ["sulphite"], 260],
    ["soguki", "Fıçı Bira", "50 cl", 210, ["gluten"], 180],

    ["sicaki", "Demli Çay", "İnce belli bardakta", 5, [], 40],
    ["sicaki", "Türk Kahvesi", "Közde, lokum ile", 20, [], 110],
    ["sicaki", "Sahlep", "Tarçınlı", 220, ["milk"], 150],
    ["sicaki", "Adaçayı", "Taze yaprak", 5, [], 90],
    ["sicaki", "Filtre Kahve", "Günün çekirdeği", 5, [], 100],
  ];

  const items = raw.map((r, i) => ({
    id: "u" + (i + 1),
    cat: r[0],
    name: r[1],
    desc: r[2],
    kcal: r[3],
    al: r[4],
    price: r[5],
    badge: r[6] || "",
    soldOut: false,
    img: "",
  }));

  const info = {
    name: "Mavi Deniz Balık Restoranı",
    slogan: "Denizin mavisi, sofranın tazesi.",
    title: "Boğazın kıyısında, her lokmada deniz.",
    address: "Kemankeş Mahallesi, Mavi Sokak No 12, Karaköy, Beyoğlu, İstanbul",
    phone: "+90 212 555 01 42",
    instagram: "mavidenizbalik",
    hours: "Her gün 12.00 ile 00.00 arası",
    note: "Alerjiniz varsa lütfen siparişte garsonumuza bildirin. Fiyatlara KDV dahildir.",
    payments: "Tüm kredi kartları ve nakit geçerlidir.",
    adminPin: "1234",
  };

  const season = [
    ["Hamsi", "Mezgit", "Barbun", "İstavrit"],
    ["Hamsi", "Palamut", "Mezgit", "Kalkan"],
    ["Kalkan", "Lüfer", "Mezgit", "Çipura"],
    ["Kalkan", "Levrek", "Mercan", "Dil Balığı"],
    ["Levrek", "Çipura", "Barbun", "Kalamar"],
    ["Levrek", "Çipura", "Ahtapot", "Karides"],
    ["Levrek", "Çipura", "Mercan", "Kalamar"],
    ["Çipura", "Levrek", "Barbun", "Ahtapot"],
    ["İstavrit", "Lüfer", "Palamut", "Levrek"],
    ["Lüfer", "Palamut", "Hamsi", "Levrek"],
    ["Hamsi", "Palamut", "Lüfer", "Çipura"],
    ["Hamsi", "Mezgit", "Lüfer", "Barbun"],
  ];
  const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

  const KEY = "mavideniz_state_v1";

  function defaults() {
    return JSON.parse(JSON.stringify({ categories, items, info, hero: "", gallery: [] }));
  }

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.items && s.categories) {
        s.info = Object.assign({}, info, s.info || {});
        s.gallery = s.gallery || [];
        s.hero = s.hero || "";
        return s;
      }
    } catch (e) {}
    return defaults();
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  const fmt = (n) => new Intl.NumberFormat("tr-TR").format(n) + " ₺";

  function chip(a) {
    const isSvg = a.icon.startsWith("<svg");
    return `<span class="al" title="${a.tr}" style="background:${a.color};color:${a.text}">${a.icon}</span>`;
  }

  window.MD = { allergens, season, months, KEY, defaults, load, save, reset, fmt, chip };
})();
