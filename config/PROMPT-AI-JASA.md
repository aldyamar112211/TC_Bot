# Prompt buat AI Luar — Sistem Tanya-Jawab & Penjelasan Paket Jasa Website (Bot Discord Terakhir Community)

> Copy bagian di dalam blok di bawah ke AI lain (ChatGPT/Claude/dll). Sudah berisi konteks lengkap biar hasilnya nyambung sama bot. Setelah dapat hasil, tinggal tempel ke `bot/config/jasa.js` di field yang sesuai (lihat bagian "Format Output" di bawah).

---

## PROMPT (copy dari sini)

```
Kamu adalah copywriter untuk bot Discord "Terakhir Community" (TC) — sebuah komunitas/brand Roblox & web development asal Indonesia. Bot ini menjual JASA PEMBUATAN WEBSITE. Aku butuh kamu menulis teks penjelasan paket & sistem tanya-jawab yang akan ditampilkan bot ke calon klien di Discord.

## KONTEKS BRAND & GAYA
- Bahasa: Indonesia santai-profesional (pakai "kamu", bukan "Anda"). Gaul tipis tapi tetap meyakinkan, BUKAN kaku korporat.
- Audiens: anak muda / pemilik usaha kecil / komunitas Roblox yang AWAM soal teknis web. Banyak yang belum paham istilah "database", "auth", "hosting".
- Tujuan: bikin mereka NGERTI bedanya tiap paket, MERASA cocok, lalu mau buka tiket order.
- JANGAN over-promise. Selalu tegaskan harga = ESTIMASI, final nyesuain scope.
- Hindari jargon. Kalau terpaksa pakai istilah teknis, langsung kasih analogi sederhana.

## PAKET YANG ADA (HARUS KONSISTEN, JANGAN UBAH NAMA/FITUR)
1. BASIC — "Landing / Profile"
   - Fitur: 1-5 halaman, desain responsif (mobile-friendly), form kontak, deploy + setup domain
   - Contoh: halaman promosi event, profil usaha/komunitas, linktree premium
2. STANDARD — "Full-stack" (PALING POPULER)
   - Fitur: semua fitur Basic, auth & user system, database + admin panel, integrasi (payment/Discord/dll)
   - Contoh: toko online sederhana, web komunitas dengan member login, platform dengan data tersimpan
3. PREMIUM — "Custom App"
   - Fitur: semua fitur Standard, tool interaktif custom, sistem skala besar, optimasi & keamanan lanjutan
   - Contoh: web app dengan tools custom, dashboard kompleks, sistem multi-user besar
4. MOBILE APP — "Android / iOS"
   - Fitur: app Android/iOS, konek ke backend/web existing, push notification, publish ke store (opsional)
   - Contoh: app Android komunitas, versi mobile dari web yang sudah ada

## ESTIMASI HARGA (referensi, JANGAN ditulis sebagai harga pasti)
- Landing Page: Rp 500rb - 3jt
- Company Profile: Rp 1jt - 7jt
- Web App / Toko (starter): Rp 3jt - 15jt
- Custom / Premium: Rp 15jt ke atas
(Angka di atas mengikuti kisaran pasaran jasa web Indonesia. Estimasi kalkulator: base Rp 500rb + ~Rp 350rb per halaman ekstra + per fitur: login Rp 1,5jt / admin+database Rp 2jt / payment Rp 2jt / tool custom Rp 2,5jt / integrasi API Rp 1jt / domain+hosting Rp 500rb.)

## YANG AKU BUTUH KAMU TULIS

Untuk SETIAP paket (Basic, Standard, Premium, Mobile App), tulis 2 versi teks:

A) "singkat" — 1-2 kalimat. Jawaban pertama bot saat user klik tombol paket itu. Jelaskan paket ini COCOK BUAT SIAPA & kapan dipilih. Jelas, langsung kena.

B) "simpel" — 2-4 kalimat. Ini muncul kalau user klik tombol "Tidak Mengerti" setelah baca versi singkat. WAJIB pakai analogi sehari-hari yang gampang banget (misal: "database itu kayak lemari arsip yang nyimpen semua data"). Anggap kamu lagi jelasin ke orang yang sama sekali nggak ngerti teknologi. Sabar, ramah, nggak ngerendahin.

Lalu, tulis juga:

C) 5-8 PASANGAN tanya-jawab (FAQ) umum yang sering ditanyain calon klien jasa web, misal:
   - "Bedanya Basic sama Standard apa?"
   - "Harga segini udah termasuk domain belum?"
   - "Berapa lama pengerjaannya?"
   - "Bisa revisi nggak?"
   - "Pembayaran gimana?"
   - dll (tambahkan yang relevan)
   Jawaban: santai, jujur, dan kalau menyangkut hal yang harus didiskusi, arahkan halus untuk buka tiket / hubungi staff.

## FORMAT OUTPUT (PENTING — biar gampang aku tempel ke kode)
Kasih hasil dalam bentuk yang gampang disalin. Untuk tiap paket, format begini:

[BASIC]
singkat: <teks>
simpel: <teks>

[STANDARD]
singkat: <teks>
simpel: <teks>

...dst untuk Premium & Mobile.

Lalu untuk FAQ:
[FAQ]
Q: <pertanyaan>
A: <jawaban>
(ulang untuk tiap pasangan)

Tulis semua dalam Bahasa Indonesia. Jangan tambahkan basa-basi pembuka/penutup, langsung ke hasil.
```

---

## Cara pakai hasilnya (setelah AI luar jawab)

1. **Teks `singkat` & `simpel` tiap paket** → tempel ke `bot/config/jasa.js`, di tiap objek `WEB_TIERS[].penjelasan.singkat` dan `.simpel` (ganti yang `[PLACEHOLDER ...]`).
2. **FAQ** → kasih balik ke Claude (aku), nanti aku bikinin jadi tombol/menu FAQ di bot.

Kalau hasil AI luar formatnya beda, nggak masalah — kasih aja mentahnya ke aku, aku rapihin & tempel ke kode.
