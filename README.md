# Terakhir Community Bot

Bot Discord untuk komunitas TC. Fitur: welcome/goodbye member, sistem tiket.

## Setup

### 1. Install dependency
```bash
cd bot
npm install
```

### 2. Buat file .env
Copy `.env.example` jadi `.env`, lalu isi:
```
BOT_TOKEN=       # Token bot dari Discord Developer Portal
CLIENT_ID=       # Application ID bot (bukan token)
GUILD_ID=        # ID server Discord kamu (klik kanan server > Copy Server ID)
WELCOME_CHANNEL_ID=   # ID channel untuk pesan welcome/goodbye
TICKET_CATEGORY_ID=   # ID category untuk channel tiket (opsional)
LOG_CHANNEL_ID=       # ID channel log (opsional, belum dipakai)
```

### 3. Cara dapat TOKEN & CLIENT_ID
1. Buka https://discord.com/developers/applications
2. Klik "New Application", beri nama
3. Buka tab **Bot** > klik "Add Bot"
4. Copy **Token** (klik Reset Token kalau belum keliatan)
5. CLIENT_ID = angka di tab **General Information > Application ID**

### 4. Aktifkan Privileged Intents
Di tab **Bot** > scroll ke bawah, aktifkan:
- Server Members Intent
- Message Content Intent

### 5. Invite bot ke server
Di tab **OAuth2 > URL Generator**:
- Scopes: `bot`, `applications.commands`
- Bot Permissions: `Send Messages`, `Manage Channels`, `View Channels`

Copy URL yang dihasilkan, buka di browser, pilih server.

### 6. Deploy slash commands
Jalankan sekali sebelum start:
```bash
node deploy-commands.js
```

### 7. Jalankan bot
```bash
npm start
```

## Struktur Folder
```
bot/
├── commands/
│   ├── ticket.js       # /tiket - buka panel tiket + handler tombol
│   └── tutuptiket.js   # /tutuptiket - tutup tiket aktif
├── events/
│   ├── ready.js        # Bot online
│   ├── welcome.js      # Member join
│   ├── goodbye.js      # Member keluar
│   └── interactionCreate.js  # Router semua interaksi
├── index.js            # Entry point
├── deploy-commands.js  # Script deploy slash commands
├── .env.example
└── package.json
```

## Cara pakai fitur tiket
1. Ketik `/tiket` di channel manapun
2. Muncul embed dengan tombol "Buka Tiket"
3. User klik tombol > channel tiket pribadi otomatis terbuat
4. Setelah selesai, ketik `/tutuptiket` di channel tiket tersebut
