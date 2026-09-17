# SOP Jasa Web Terakhir Community (Internal)

Pegangan langkah-langkah ngerjain jasa web, dari klien deal sampai serah terima.
Model bisnis: **HIBRIDA** — domain atas nama klien, hosting TC setup + maintenance opsional.

---

## 0. Sebelum mulai (deal & brief)
- [ ] Klien udah isi form order (lewat bot) / udah ngobrol di tiket
- [ ] Catat: jenis web, fitur, deadline, budget, referensi
- [ ] Sepakati paket + harga + jumlah revisi (mis. 2-3x minor gratis)
- [ ] DP dibayar dulu sebelum mulai ngerjain
- [ ] Catat siapa yang beli domain (klien sendiri / TC beliin pakai email klien)

## 1. Setup proyek (Git)
- [ ] Bikin repo GitHub baru, **private**, 1 repo per klien (mis. `web-klien-budi`)
- [ ] Tentuin hosting sesuai jenis web:
  - Basic (statis) → GitHub Pages / Vercel (gratis)
  - Standard/Premium (login+database) → Vercel + Supabase (gratis tier)
  - Mobile App → build APK / publish store (Play Store $25 sekali)
- [ ] Connect repo ke hosting biar auto-deploy tiap push

## 2. Pengerjaan
- [ ] Kerjain per bagian, tiap selesai: `git commit` + `git push` (auto-deploy)
- [ ] Update progres ke klien berkala di tiket
- [ ] Cek checklist kelengkapan web sebelum lanjut:
  - Responsive (HP/tablet/desktop)
  - SEO dasar (meta title/description)
  - HTTPS aktif
  - Form/tombol beneran jalan
  - Halaman 404 rapi
  - Privacy Policy + Terms (kalau ada data user)
  - Dites di beberapa browser

## 3. Domain (model hibrida)
- [ ] Pastikan domain **atas nama klien** (beli di Niagahoster/Cloudflare/dll pakai akun/email klien)
- [ ] Di dashboard hosting → Add Domain → masukin domain klien
- [ ] Hosting kasih DNS record → masukin ke registrar domain klien
- [ ] Tunggu propagasi DNS (menit - jam), cek web nyala di domain
- [ ] Pastikan HTTPS/SSL aktif di domain custom

## 4. Serah terima
- [ ] Pelunasan sisa pembayaran
- [ ] Serahin akses: domain (atas nama klien), repo/hosting (transfer atau kasih akses)
- [ ] Kalau ada admin panel: ajarin cara update konten
- [ ] Kasih dokumentasi singkat (cara login admin, cara update, kontak support)
- [ ] Tawarin paket maintenance bulanan

## 5. Maintenance (income berulang, opsional)
- [ ] Tawarin paket bulanan (mis. Rp 100rb-300rb/bln) berisi:
  - Web down → cek & benerin
  - Update konten / fitur kecil
  - Perpanjang domain & hosting tiap tahun
  - Backup berkala
- [ ] Catat tanggal expired domain & hosting tiap klien biar nggak kelewat perpanjang

---

## Lapisan teknis web (biar paham apa yang dikerjain)
1. Front-end/UI (tampilan) 2. Interaksi/UX 3. API 4. Autentikasi
5. Back-end/logika 6. Database 7. Storage 8. Hosting 9. Domain/DNS
10. HTTPS/SSL 11. CDN/caching 12. Monitoring 13. Backup

## Biaya berjalan (WAJIB dijelasin ke klien di awal)
Harga paket = bikin web + setup + **domain & hosting TAHUN PERTAMA**. Tahun ke-2 dst terpisah.
- **Domain** ~Rp 150-200rb/tahun, atas nama klien, diperpanjang tiap tahun.
- **Hosting (Vercel)**: free tier dulu (cukup buat kebanyakan). Kalau rame & nembus limit → upgrade Pro ~$20/bln (dibahas terpisah ke klien).
- **Database (Supabase)**: cuma Standard ke atas. Free cukup buat ribuan user. Upgrade ~$25/bln kalau data gede.
- Catat tanggal expired domain tiap klien biar nggak telat perpanjang.

**Cara jelasin free vs berbayar ke klien:** "Web jalan di free tier dulu, gratis & cukup. Kalau nanti rame banget sampai nembus batas, baru kita obrolin upgrade. Jadi kamu nggak bayar lebih sebelum beneran butuh."

## Harga jasa (sinkron dgn bot/web)
Basic 500rb · Standard 1,5jt · Premium 2,5jt · Mobile 3jt.
Bundle: Basic+Mobile 3jt, Standard+Mobile 4jt, Premium+Mobile 5jt.
