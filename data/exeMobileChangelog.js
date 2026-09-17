// ============================================================
//  Changelog khusus TC-Toolkit (exe) & TC Mobile (app) — TERPISAH
//  dari changelog.js (yang itu buat web). Di-broadcast bot ke
//  channel khusus update exe/mobile.
//  CARA PAKAI (buat dev/owner):
//   1. Tiap rilis fitur/perubahan di exe atau mobile, TAMBAH entri BARU di paling ATAS array.
//   2. Kasih `id` unik (mis. tanggal-slug). Bot pakai id ini biar ga kirim dobel.
//   3. Push ke Railway. Bot bakal otomatis kirim entri yang belum ada di channel pas restart.
//
//  Channel update exe/mobile: 1522924676622319697 (hardcode di bawah).
// ============================================================

export const EXE_MOBILE_CHANGELOG_CHANNEL_ID = '1522924676622319697'

// Entri TERBARU di atas. Jangan ubah id entri lama (nanti ke-kirim ulang).
// draft:true = ditulis tapi ditahan, bot ga broadcast. Hapus flag pas siap kirim.
export const EXE_MOBILE_CHANGELOG = [
  {
    id: '2026-07-04-devtools-companion',
    version: 'Fitur Baru (TC Mobile)',
    title: 'Dev Tools: Kelola Game Roblox dari HP',
    date: '',
    changes: [
      'Kill Switch: nyalain/matiin akses game (Public/Private) langsung dari HP.',
      'Rank Manager: cek dan ubah rank member grup Roblox, atau keluarkan member.',
      'Asset Uploader: upload gambar/decal dari galeri HP langsung ke Roblox.',
      'Command Hub: kirim perintah ke server game yang lagi jalan, tanpa buka Studio.',
      'Butuh API Key Roblox sendiri, disimpan aman di HP kalian, TC ga pernah simpan API key kalian di server.',
    ],
    url: 'https://terakhircommunity.com/tc-mobile',
  },
]
