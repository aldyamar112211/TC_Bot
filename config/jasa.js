// Data jasa website buat bot Discord.
// Teks penjelasan dari Gemini (versi Roblox), harga disesuaikan market Roblox ID.
// Kalau harga/paket berubah, samain juga di web (config/site.js) biar konsisten.

export const JASA_DISCORD_LINK = 'https://discord.gg/UKc3zEQPnA'
export const JASA_WEB_URL = 'https://terakhircommunity.com/jasa'

// Base URL demo (GitHub Pages). Tiap paket nunjuk ke file HTML-nya.
export const JASA_DEMO_BASE = 'https://aldyamar112211.github.io/tc-jasa-demo'

// Role/nama staff yang di-tag pas user klik "Hubungi Staff".
// Pakai NAMA ROLE (case-sensitive sesuai di Discord, termasuk titik/spasi). Bot nyari & nge-tag.
export const STAFF_ROLE_NAMES = ['Manager', 'Secret Management.', 'Moderator']

// ── PAKET / TIER ────────────────────────────────────────────────
// id dipakai buat customId tombol (jasa_pkg:<id>). Jangan pakai spasi.
// penjelasan.singkat = jawaban pertama. penjelasan.simpel = tombol "Tidak Mengerti".
// startFrom = harga mulai (angka, dipakai juga di info harga & bundle).
export const WEB_TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    tag: 'Landing / Profile',
    startFrom: 500000,
    demo: 'basic.html',
    desc: 'Website company profile atau landing page. Responsif, cepat, siap online.',
    features: ['1-5 halaman', 'Desain responsif (mobile-friendly)', 'Form kontak', 'Deploy + setup domain'],
    contoh: 'Contoh: web portofolio builder, showcase game Roblox, rekrutmen Clan/Group, atau landing page promo.',
    penjelasan: {
      singkat: 'Cocok buat kamu yang butuh web portofolio builder, showcase game Roblox, rekrutmen Clan/Group, atau landing page promo. Fokusnya ngasih info ke pengunjung, belum butuh fitur login atau simpan data.',
      simpel: 'Ibarat brosur digital yang keren banget. Pengunjung cuma bisa baca info tentang studio/game kamu atau klik tombol link Discord, tapi nggak bisa bikin akun atau belanja di sana. Pas banget buat kenalin siapa komunitasmu atau majang hasil karya 3D/scripting kamu ke klien!',
    },
  },
  {
    id: 'standard',
    name: 'Standard',
    tag: 'Full-stack',
    startFrom: 1500000,
    demo: 'standard.html',
    highlight: true,
    desc: 'Web dengan database, login, dan admin panel. Cocok buat komunitas, toko, atau platform.',
    features: ['Semua fitur Basic', 'Auth & user system', 'Database + admin panel', 'Integrasi (payment/Discord/dll)'],
    contoh: 'Contoh: toko top-up Robux/asset, web komunitas dengan Discord login, atau platform turnamen.',
    penjelasan: {
      singkat: 'Pilihan paling favorit! Pas buat kamu yang mau bikin toko top-up Robux/asset, web komunitas dengan fitur Discord login, atau platform turnamen yang butuh sistem penyimpanan data.',
      simpel: 'Kalau paket Basic itu cuma brosur, paket Standard ini ibarat markas atau toko beneran. Player bisa login (misalnya pakai akun Discord), masukin item ke keranjang belanja, dan kita buatin "lemari arsip" (database) otomatis buat nyimpen data member dan riwayat transaksi mereka dengan aman.',
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    tag: 'Custom App',
    startFrom: 2500000,
    demo: 'premium.html',
    desc: 'Aplikasi web kompleks dengan tools/fitur custom sesuai kebutuhan, level kayak web ini.',
    features: ['Semua fitur Standard', 'Tool interaktif custom', 'Sistem skala besar', 'Optimasi & keamanan lanjutan'],
    contoh: 'Contoh: dashboard admin game Roblox, sistem automasi transaksi, marketplace asset, atau web app super kompleks.',
    penjelasan: {
      singkat: 'Buat kamu yang punya ide spesifik skala besar, kayak dashboard admin untuk game Roblox-mu, sistem automasi transaksi, marketplace asset, atau web app custom yang super kompleks.',
      simpel: 'Ini ibarat ngebangun pabrik robot lengkap dengan mesin custom sesuai keinginanmu. Cocok banget kalau kamu butuh fitur rumit yang nyambung langsung ke API Roblox, bisa nampung ribuan member aktif sekaligus, dan butuh tingkat keamanan tinggi biar nggak gampang dijebol.',
    },
  },
  {
    id: 'mobile',
    name: 'Mobile App',
    tag: 'Android / iOS',
    startFrom: 3000000,
    demo: 'mobile.html',
    desc: 'Aplikasi mobile, bisa berdiri sendiri atau nyambung ke web yang udah ada.',
    features: ['App Android / iOS', 'Konek ke backend / web existing', 'Push notification', 'Publish ke store (opsional)'],
    contoh: 'Contoh: app komunitas atau toko top-up di HP, atau versi mobile dari web yang udah jalan.',
    penjelasan: {
      singkat: 'Mau punya aplikasi komunitas atau toko top-up sendiri di HP? Paket ini cocok untuk bikin versi Android/iOS dari web kamu biar user makin gampang akses tanpa buka browser.',
      simpel: 'Kita bikinin aplikasi khusus yang bisa di-download dan nongkrong di layar HP member kamu. Enaknya, kamu bisa ngirim "Notifikasi" (Push Notification) langsung ke HP mereka pas ada event mabar, promo Robux, atau update game terbaru!',
    },
  },
]

// ── BUNDLE HEMAT ────────────────────────────────────────────────
// Mulai dari Basic + Mobile. Harga "mulai dari", hemat vs beli terpisah.
export const BUNDLES = [
  { name: 'Basic + Mobile App',    startFrom: 3000000, note: 'Web profil/showcase + app HP. Hemat dari beli terpisah.' },
  { name: 'Standard + Mobile App', startFrom: 4000000, note: 'Web full-stack + app HP. Paling pas buat komunitas yang serius.' },
  { name: 'Premium + Mobile App',  startFrom: 5000000, note: 'Web custom skala besar + app HP. Paket lengkap.' },
]

// ── ESTIMASI KISARAN HARGA (tampil di Info Harga) ───────────────
export const WEB_PRICE_GUIDE = [
  { type: 'Landing Page',             range: 'mulai Rp 500rb',  note: 'Satu halaman fokus, cocok buat promosi atau showcase.' },
  { type: 'Web Komunitas / Toko',     range: 'mulai Rp 1,5jt',  note: 'Ada login, database, admin, atau jualan.' },
  { type: 'Custom / Premium',         range: 'mulai Rp 2,5jt',  note: 'Fitur kompleks, tools custom, integrasi API Roblox.' },
  { type: 'Mobile App',               range: 'mulai Rp 3jt',    note: 'Aplikasi Android/iOS + push notification.' },
]

// ── KALKULATOR ESTIMASI ─────────────────────────────────────────
// Diturunkan dari harga paket di atas. SEMUA estimasi, final nyesuain scope.
export const CALC_BASE = 500000          // titik mulai (1 halaman, sudah deploy)
export const CALC_PER_PAGE = 250000      // tiap halaman ekstra

// Fitur tambahan — tiap fitur nambah ke total.
export const CALC_FEATURES = [
  { id: 'auth',        label: 'Login & User System',       price: 700000,  note: 'User daftar/login (bisa pakai Discord).' },
  { id: 'admin',       label: 'Admin Panel + Database',    price: 900000,  note: 'Panel kelola konten + data tersimpan.' },
  { id: 'payment',     label: 'Integrasi Pembayaran',      price: 800000,  note: 'Checkout / top-up / payment gateway.' },
  { id: 'custom_tool', label: 'Tool Interaktif Custom',    price: 1000000, note: 'Fitur unik dibangun dari nol.' },
  { id: 'roblox_api',  label: 'Integrasi API Roblox',      price: 900000,  note: 'Deteksi role group, game pass, dll.' },
  { id: 'domain',      label: 'Domain + Hosting Setup',    price: 400000,  note: 'Domain .com/.id + hosting 1 tahun.' },
]

// ── ALUR KERJA / CARA KERJA (buat tombol "Gimana Kami Kerja") ───
export const JASA_WORKFLOW = [
  { t: '1. Diskusi & Brief', d: 'Ceritain kebutuhanmu di tiket. Kita sepakatin paket, fitur, harga, sama timeline-nya. Mulai pengerjaan setelah DP.' },
  { t: '2. Pengerjaan', d: 'Web dibangun sambil dikasih update progres. Kamu bisa pantau perkembangannya, bukan tau-tau jadi.' },
  { t: '3. Domain Atas Nama Kamu', d: 'Domain (mis. namakamu.com) didaftarin atas nama kamu sendiri, bukan punya kami. Jadi webmu beneran milik kamu, aman.' },
  { t: '4. Online & Aman', d: 'Web di-setup biar cepat diakses, pakai HTTPS (ada gembok ijo), dan dites dulu di HP maupun laptop sebelum diserahin.' },
  { t: '5. Serah Terima', d: 'Setelah lunas, kamu dapet akses penuh: domain, panel admin (kalau ada), plus panduan cara ngelola sendiri.' },
  { t: '6. Maintenance (Opsional)', d: 'Males ngurus sendiri? Ada paket rawatan bulanan: kami yang jagain web tetap nyala, update konten, sama perpanjang domain tiap tahun.' },
]

// ── BIAYA BERJALAN (domain/hosting) + free vs berbayar ─────────
export const JASA_BIAYA = {
  intro: 'Harga paket itu buat **bikin web + setup + domain & hosting tahun pertama**. Mulai tahun ke-2, ada biaya berjalan yang dijelasin di bawah biar nggak ada kejutan.',
  items: [
    { t: '🏷️ Domain (.com / .id)', d: 'Sekitar Rp 150rb-200rb/tahun, diperpanjang tiap tahun. Didaftarin atas nama kamu sendiri, jadi beneran milik kamu. Tahun pertama udah termasuk paket.' },
    { t: '🌐 Hosting (Vercel)', d: 'Tahun pertama include. Pakai versi gratis yang cukup buat kebanyakan web. Kalau web kamu rame banget sampai nembus batas gratis, baru kita obrolin upgrade.' },
    { t: '🗄️ Database (Supabase)', d: 'Cuma buat paket Standard ke atas (yang ada login/data). Versi gratis cukup buat ribuan user. Kalau datanya gede banget, ada opsi upgrade.' },
  ],
  footer: 'Singkatnya: tahun pertama tenang, semua jalan. Tahun berikutnya kamu cuma perlu perpanjang domain + maintenance kalau mau dibantu.',
}

// Penjelasan plus-minus free vs berbayar
export const JASA_FREE_VS_PAID = {
  hosting: {
    nama: 'Hosting (Vercel)',
    free: ['Gratis selamanya', 'Cukup buat web komunitas/toko skala kecil-menengah', 'Limit kunjungan bulanan; kalau viral bisa kena batas', 'Kalau limit kena, web melambat / sementara nggak bisa diakses sampai bulan depan'],
    paid: ['~$20/bln', 'Limit jauh lebih gede, aman buat web rame', 'Lebih cepat & stabil'],
  },
  database: {
    nama: 'Database (Supabase)',
    free: ['Gratis, cukup buat ribuan user & data', 'Limit storage & ukuran database', 'Database "tidur" kalau seminggu nggak ada aktivitas (bangun lagi pas diakses, agak lambat di awal)'],
    paid: ['~$25/bln', 'Storage gede, database nggak tidur, ada backup harian'],
  },
}

// Format angka ke Rupiah singkat: 500000 -> "Rp 500rb", 2500000 -> "Rp 2,5jt"
export function formatRupiah(n) {
  if (n >= 1000000) {
    const jt = n / 1000000
    const s = Number.isInteger(jt) ? String(jt) : jt.toFixed(1).replace('.', ',')
    return `Rp ${s}jt`
  }
  if (n >= 1000) return `Rp ${Math.round(n / 1000)}rb`
  return `Rp ${n}`
}

// ── FAQ (dari Gemini, versi Roblox) ─────────────────────────────
export const JASA_FAQ = [
  {
    q: 'Bedanya paket Basic sama Standard apa sih?',
    a: 'Gampangnya, Basic itu web buat dibaca aja (kayak profil Roblox Group, showcase game, atau landing page). Kalau Standard, webnya udah interaktif—player bisa login (misal pakai akun Discord), daftar turnamen, beli item/top-up, dan ada database buat nyimpen datanya.',
  },
  {
    q: 'Patokan harga awal tiap paket berapa?',
    a: 'Harga mulai dari: Basic (Rp 500rb), Standard (Rp 1,5jt), Premium Custom (Rp 2,5jt), dan Mobile App (Rp 3jt). Ini baru estimasi awal ya — harga aslinya nyesuain sama kerumitan fitur yang kamu minta!',
  },
  {
    q: 'Ada paketan bundle Web + Mobile App nggak biar hemat?',
    a: 'Ada! Bundle mulai dari Basic + Mobile App (Rp 3jt), Standard + Mobile App (Rp 4jt), sampai Premium + Mobile App (Rp 5jt). Lebih hemat dibanding beli terpisah. Langsung obrolin di tiket buat perhitungan pasnya!',
  },
  {
    q: 'Harga segitu udah termasuk domain, hosting, sama database belum?',
    a: 'Untuk estimasi awal, biasanya udah masuk biaya setup domain (.com/.id) dan hosting dasar untuk tahun pertama. Tapi kalau trafik komunitasmu gede banget dan butuh server "monster", nanti kita sesuaikan lagi kapasitas dan harganya bareng-bareng.',
  },
  {
    q: 'Fitur login bisa nyambung ke Discord atau Roblox nggak?',
    a: 'Bisa banget! Di paket Standard & Premium, kita bisa bikinin login pakai Discord (OAuth) biar member nggak usah bikin password baru. Untuk API khusus Roblox (deteksi role group/game pass), itu masuk fitur custom di paket Premium ya.',
  },
  {
    q: 'Berapa lama pengerjaannya?',
    a: 'Web Basic (portofolio) biasanya 1-2 minggu. Standard (login/toko) sekitar 3-4 minggu. Premium atau Mobile App bisa 1-3 bulan tergantung kerumitan. Timeline pastinya dikasih sebelum mulai!',
  },
  {
    q: 'Kalau ada yang kurang pas, bisa revisi nggak?',
    a: 'Pasti! Ada jatah revisi minor biar hasilnya sesuai ekspektasi. Tapi kalau revisinya nambah fitur baru di luar kesepakatan awal, baru deh biayanya disesuaikan lagi.',
  },
  {
    q: 'Sistem pembayarannya gimana? Bisa nyicil?',
    a: 'Pakai sistem DP (Down Payment) di awal biar pengerjaan langsung jalan, sisanya dilunasin pas web siap rilis. Detail persentase DP / termin cicilan, langsung tanya staff di tiket aja.',
  },
  {
    q: 'Aku awam soal coding tapi punya ide, mending pilih yang mana?',
    a: 'Santai, nggak usah pusing istilah teknis! Buka tiket konsultasi aja, ceritain idemu pakai bahasa sehari-hari (misal: "mau bikin web buat jual item Adopt Me"), nanti tim TC yang bantu milihin paket & fitur paling pas. Tanya-tanya gratis kok!',
  },
]
