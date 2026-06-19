import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

async function sendIfNotExist(channel, embeds, components = []) {
  const messages = await channel.messages.fetch({ limit: 10 })
  const exists = messages.find(m => m.author.bot && m.embeds.length > 0)
  if (exists) return
  await channel.send({ embeds, components })
}

export async function setupRules(client) {
  const channel = await client.channels.fetch(process.env.RULES_CHANNEL_ID).catch(() => null)
  if (!channel) return

  const messages = await channel.messages.fetch({ limit: 20 })
  const existing = messages.find(m => m.author.bot && m.embeds.some(e => e.title?.includes('Peraturan')))
  if (existing) return

  const embed1 = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('📋 Peraturan Terakhir Community')
    .setDescription('Baca sampai habis. Satu kesempatan buat semua orang, jangan sampe disia-siain.')
    .addFields(
      { name: '1. Jaga omongan', value: 'Ga ada tempat buat toxic, ngehina, atau nyindir seseorang di sini. Beda pendapat boleh, tapi tetap sopan.' },
      { name: '2. Ga ada spam', value: 'Kirim pesan berulang, mention ga jelas, atau flood channel itu ganggu semua orang. Jangan.' },
      { name: '3. Konten itu tanggung jawab kamu', value: 'Apapun yang kamu kirim, itu pilihan kamu. Konten NSFW, scam, atau link berbahaya langsung kena kick/ban tanpa peringatan.' },
      { name: '4. Jangan promosi sembarangan', value: 'Mau share server lain, produk, atau konten? Izin dulu ke admin. Promo tanpa izin langsung dihapus.' },
      { name: '5. Bug, cheater, atau ada masalah?', value: 'Ada channel khusus buat itu. Jangan ribut di chat umum.' },
      { name: '6. Hormati semua orang', value: 'Member, admin, atau siapapun. Ga peduli rank — semua diperlakukan sama di sini.' },
    )
    .setFooter({ text: 'Terakhir Community — Built To Be The Last' })

  const embed2 = new EmbedBuilder()
    .setColor(0x2c2c2c)
    .setTitle('📌 Panduan Channel')
    .addFields(
      { name: '💬 Chatting', value: 'Ngobrol bebas, tapi tetap dalam batas wajar.' },
      { name: '🐛 Report Bug', value: 'Ketemu bug di game? Lapor di sini dengan detail yang jelas.' },
      { name: '🚨 Report Cheater', value: 'Ketemu cheater/hacker? Sertakan bukti, jangan main hakim sendiri.' },
      { name: '💡 Criticism & Suggestion', value: 'Kritik dan saran selalu diterima. Kalau membangun, pasti dipertimbangin.' },
      { name: '🎫 Help Center', value: 'Butuh bantuan personal dari admin? Buka tiket di sana.' },
    )
    .setFooter({ text: 'Melanggar aturan = konsekuensi. Udah tau, jangan pura-pura ga tau.' })

  await channel.send({ embeds: [embed1, embed2] })
}

export async function setupReportBug(client) {
  const channel = await client.channels.fetch(process.env.REPORT_BUG_CHANNEL_ID).catch(() => null)
  if (!channel) return

  const embed = new EmbedBuilder()
    .setColor(0xe67e22)
    .setTitle('🐛 Report Bug')
    .setDescription('Nemu bug di game atau website TC? Lapor di sini.\n\nKlik tombol di bawah, isi formnya. Laporan yang ga jelas ga bakal diproses.')
    .addFields(
      { name: 'Yang perlu disertakan', value: '- Di mana bug-nya (map/website/fitur)\n- Apa yang terjadi\n- Langkah buat nge-reproduce-nya\n- Screenshot/video kalau ada' },
    )
    .setFooter({ text: 'Terakhir Community' })

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('report_bug').setLabel('Laporkan Bug').setStyle(ButtonStyle.Danger).setEmoji('🐛'),
  )

  await sendIfNotExist(channel, [embed], [row])
}

export async function setupReportCheater(client) {
  const channel = await client.channels.fetch(process.env.REPORT_CHEATER_CHANNEL_ID).catch(() => null)
  if (!channel) return

  const embed = new EmbedBuilder()
    .setColor(0x8e44ad)
    .setTitle('🚨 Report Cheater')
    .setDescription('Ketemu cheater atau hacker di game?\n\nJangan main hakim sendiri, lapor aja di sini. Admin yang handle.')
    .addFields(
      { name: 'Yang perlu disertakan', value: '- Username Roblox pelaku\n- Map/game tempat kejadian\n- Jenis kecurangannya\n- Bukti (screenshot/video/recording)' },
      { name: 'Penting', value: 'Laporan tanpa bukti yang valid kemungkinan besar ga bakal ditindak.' },
    )
    .setFooter({ text: 'Terakhir Community' })

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('report_cheater').setLabel('Laporkan Cheater').setStyle(ButtonStyle.Danger).setEmoji('🚨'),
  )

  await sendIfNotExist(channel, [embed], [row])
}

export async function setupPaidAsset(client) {
  const channel = await client.channels.fetch(process.env.PAID_ASSET_CHANNEL_ID).catch(() => null)
  if (!channel) return

  const messages = await channel.messages.fetch({ limit: 10 })
  const exists = messages.find(m => m.author.bot && m.embeds.length > 0)
  if (exists) return

  const embed1 = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('🛒 Paid Assets — Terakhir Community')
    .setDescription('Semua produk di bawah dibuat dan dijual langsung oleh TC. Kalau ada pertanyaan soal produk, buka tiket di help center.')

  const embed2 = new EmbedBuilder()
    .setColor(0x2c2c2c)
    .setTitle('SummitKit System V2.2')
    .setDescription('Framework modular Roblox buat bikin sistem game dengan cepat dan rapi. Cek detail dan harga langsung di website.')
    .addFields(
      { name: 'Kategori', value: 'Framework / System', inline: true },
      { name: 'Info Harga', value: 'terakhircommunity.com/store', inline: true },
    )

  const embed3 = new EmbedBuilder()
    .setColor(0x2c2c2c)
    .setTitle('Rasengan Ability System')
    .setDescription('Ability system Rasengan siap pakai untuk game Roblox kamu.')
    .addFields(
      { name: 'Harga', value: 'Rp 85.000', inline: true },
      { name: 'Kategori', value: 'Ability / Combat', inline: true },
    )

  const embed4 = new EmbedBuilder()
    .setColor(0x2c2c2c)
    .setTitle('Blackhole Coil System')
    .setDescription('Efek coil blackhole dengan visual dan mekanik yang udah jadi.')
    .addFields(
      { name: 'Harga', value: 'Rp 65.000', inline: true },
      { name: 'Kategori', value: 'VFX / Coil', inline: true },
    )

  const embed5 = new EmbedBuilder()
    .setColor(0x2c2c2c)
    .setTitle('Hammer Coil')
    .setDescription('Coil Hammer dengan animasi dan sistem serangan yang smooth.')
    .addFields(
      { name: 'Harga', value: 'Rp 50.000', inline: true },
      { name: 'Kategori', value: 'VFX / Coil', inline: true },
    )

  const embed6 = new EmbedBuilder()
    .setColor(0xf39c12)
    .setTitle('Bundle Deal')
    .addFields(
      { name: 'Rasengan + Blackhole', value: 'Rp 135.000', inline: true },
      { name: 'Rasengan + Hammer', value: 'Rp 120.000', inline: true },
      { name: 'Blackhole + Hammer', value: 'Rp 100.000', inline: true },
      { name: 'Take All Deal (3 Coil)', value: 'Rp 185.000', inline: false },
    )

  const { ActionRowBuilder: ARB, ButtonBuilder: BB, ButtonStyle: BS } = await import('discord.js')
  const row = new ARB().addComponents(
    new BB().setLabel('Lihat Store').setStyle(BS.Link).setURL('https://terakhircommunity.com/store').setEmoji('🌐'),
    new BB().setCustomId('open_ticket').setLabel('Beli / Tanya').setStyle(BS.Primary).setEmoji('🎫'),
  )

  await channel.send({ embeds: [embed1, embed2, embed3, embed4, embed5, embed6], components: [row] })
}

export async function setupFreeAsset(client) {
  const channel = await client.channels.fetch(process.env.FREE_ASSET_CHANNEL_ID).catch(() => null)
  if (!channel) return

  const messages = await channel.messages.fetch({ limit: 10 })
  const exists = messages.find(m => m.author.bot && m.embeds.length > 0)
  if (exists) return

  const embed = new EmbedBuilder()
    .setColor(0x27ae60)
    .setTitle('🆓 Free Assets — Terakhir Community')
    .setDescription('Asset gratis dari TC buat komunitas. Semua bisa langsung dipakai tanpa perlu bayar.\n\nAsset baru bakal dipost di sini kalau ada yang dirilis. Stay tuned.')
    .setFooter({ text: 'Terakhir Community — Built To Be The Last' })

  const { ActionRowBuilder: ARB, ButtonBuilder: BB, ButtonStyle: BS } = await import('discord.js')
  const row = new ARB().addComponents(
    new BB().setLabel('Cek Website').setStyle(BS.Link).setURL('https://terakhircommunity.com/store').setEmoji('🌐'),
  )

  await channel.send({ embeds: [embed], components: [row] })
}

export async function setupChatNav(client) {
  const channel = await client.channels.fetch(process.env.CHAT_CHANNEL_ID).catch(() => null)
  if (!channel) return

  const messages = await channel.messages.fetch({ limit: 20 })
  const existing = messages.find(m => m.author.bot && m.pinned && m.embeds.length > 0)
  if (existing) return

  const embed = new EmbedBuilder()
    .setColor(0x2c2c2c)
    .setTitle('Navigasi Channel')
    .setDescription('Butuh sesuatu? Langsung ke channel yang sesuai.')
    .addFields(
      { name: '📋 Peraturan', value: `<#${process.env.RULES_CHANNEL_ID}>`, inline: true },
      { name: '🎫 Help Center', value: `<#${process.env.TICKET_PANEL_CHANNEL_ID}>`, inline: true },
      { name: '🐛 Report Bug', value: `<#${process.env.REPORT_BUG_CHANNEL_ID}>`, inline: true },
      { name: '🚨 Report Cheater', value: `<#${process.env.REPORT_CHEATER_CHANNEL_ID}>`, inline: true },
      { name: '💡 Saran', value: `<#${process.env.SUGGESTION_CHANNEL_ID}>`, inline: true },
      { name: '🛒 Store', value: `<#${process.env.PAID_ASSET_CHANNEL_ID}>`, inline: true },
    )
    .setFooter({ text: 'Terakhir Community — Built To Be The Last' })

  const msg = await channel.send({ embeds: [embed] })
  await msg.pin().catch(() => {})
}

export async function setupSuggestion(client) {
  const channel = await client.channels.fetch(process.env.SUGGESTION_CHANNEL_ID).catch(() => null)
  if (!channel) return

  const embed = new EmbedBuilder()
    .setColor(0x27ae60)
    .setTitle('💡 Kritik & Saran')
    .setDescription('Ada ide buat bikin TC lebih baik? Atau ada yang menurut lo perlu diperbaiki?\n\nSemua masukan yang serius bakal dipertimbangin. Klik tombol di bawah buat submit.')
    .setFooter({ text: 'Terakhir Community — Built To Be The Last' })

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('submit_suggestion').setLabel('Kirim Saran').setStyle(ButtonStyle.Success).setEmoji('💡'),
  )

  await sendIfNotExist(channel, [embed], [row])
}
