import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  AttachmentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
} from 'discord.js'
import {
  WEB_TIERS,
  WEB_PRICE_GUIDE,
  BUNDLES,
  CALC_BASE,
  CALC_PER_PAGE,
  CALC_FEATURES,
  STAFF_ROLE_NAMES,
  JASA_FAQ,
  JASA_DEMO_BASE,
  JASA_WORKFLOW,
  formatRupiah,
} from '../config/jasa.js'

const WARNING_MS = 23 * 60 * 60 * 1000 // 23 hours
const CLOSE_MS = 1 * 60 * 60 * 1000    // 1 hour after warning
const ticketTimers = new Map() // maps channel.id -> { warningTimer, closeTimer }

function scheduleAutoClose(channel) {
  cancelTicketTimer(channel.id)

  // Stage 1: Warning timer after 23 hours of inactivity
  const warningTimer = setTimeout(async () => {
    await channel.send('⚠️ **Pengingat:** Tiket ini akan ditutup otomatis dalam 1 jam karena tidak ada aktivitas. Silakan kirim pesan di sini jika kamu masih memerlukan bantuan.').catch(() => {})
    
    // Stage 2: Close timer after warning is sent (1 hour later)
    const closeTimer = setTimeout(async () => {
      ticketTimers.delete(channel.id)
      await channel.send('Tiket ditutup otomatis karena tidak ada aktivitas selama 24 jam.').catch(() => {})
      await sendTicketTranscript(channel, 'Sistem (Auto-Close)')
      setTimeout(() => channel.delete().catch(() => {}), 5000)
    }, CLOSE_MS)
    
    const timers = ticketTimers.get(channel.id)
    if (timers) {
      timers.closeTimer = closeTimer
    }
  }, WARNING_MS)

  ticketTimers.set(channel.id, { warningTimer, closeTimer: null })
}

export function resetTicketTimer(channel) {
  scheduleAutoClose(channel)
}

export function cancelTicketTimer(channelId) {
  const timers = ticketTimers.get(channelId)
  if (timers) {
    if (timers.warningTimer) clearTimeout(timers.warningTimer)
    if (timers.closeTimer) clearTimeout(timers.closeTimer)
    ticketTimers.delete(channelId)
  }
}

export async function handleTicketButton(interaction) {
  const guild = interaction.guild
  const user = interaction.user

  const existing = guild.channels.cache.find(
    c => c.name === `tiket-${user.username.toLowerCase().replace(/\s+/g, '-')}`,
  )

  if (existing) {
    await interaction.reply({
      content: `Kamu sudah punya tiket yang aktif: ${existing}`,
      ephemeral: true,
    })
    return
  }

  const categoryId = process.env.TICKET_CATEGORY_ID
  const category = categoryId ? guild.channels.cache.get(categoryId) : null
  const validCategory = category?.type === 4 ? category : null

  const channel = await guild.channels.create({
    name: `tiket-${user.username.toLowerCase().replace(/\s+/g, '-')}`,
    type: ChannelType.GuildText,
    parent: validCategory ?? undefined,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      { id: guild.members.me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
    ],
  })

  const embed = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('Tiket Dibuka')
    .setDescription(`Halo ${user}, ceritakan masalah atau pertanyaanmu di sini. Admin akan segera membantu.\n\nTiket akan otomatis ditutup setelah 24 jam tidak ada aktivitas.`)
    .setTimestamp()

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Tutup Tiket')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒'),
  )

  const faqRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('faq_cara_beli').setLabel('Cara Beli & Konfirmasi').setStyle(ButtonStyle.Primary).setEmoji('💳'),
    new ButtonBuilder().setCustomId('faq_daftar_harga').setLabel('Daftar Harga & Bundle').setStyle(ButtonStyle.Secondary).setEmoji('🛒'),
    new ButtonBuilder().setCustomId('faq_setup_summit').setLabel('Cara Install SummitKit').setStyle(ButtonStyle.Secondary).setEmoji('⚙️'),
    new ButtonBuilder().setCustomId('faq_hubungi_admin').setLabel('Hubungi Admin (Slow Res)').setStyle(ButtonStyle.Danger).setEmoji('📞'),
  )

  await channel.send({ content: `${user}`, embeds: [embed], components: [row, faqRow] })
  scheduleAutoClose(channel)

  await interaction.reply({
    content: `Tiket kamu sudah dibuat: ${channel}`,
    ephemeral: true,
  })
}

// ============ JALUR JASA WEBSITE ============

// Step 1: user klik "Mulai Order Jasa" -> tampilkan form isian
export async function handleJasaStart(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_jasa')
    .setTitle('Order Jasa Website')

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('jasa_jenis')
        .setLabel('Jenis & fitur web yang kamu mau')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Contoh: Landing page jasa, ada form order + galeri. Atau: toko online sederhana.')
        .setRequired(true),
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('jasa_budget')
        .setLabel('Kira-kira budget kamu')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Contoh: Rp 300rb - 500rb, atau "belum tau, butuh estimasi"')
        .setRequired(true),
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('jasa_deadline')
        .setLabel('Kapan butuh jadinya?')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Contoh: 2 minggu, akhir bulan, atau santai')
        .setRequired(true),
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('jasa_kontak')
        .setLabel('Kontak & link referensi (opsional)')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('WA/email biar gampang dihubungi + link web contoh yang kamu suka gayanya')
        .setRequired(false),
    ),
  )

  await interaction.showModal(modal)
}

// Step 2: user submit form -> bikin channel tiket jasa + tempel ringkasan
export async function handleJasaSubmit(interaction) {
  const guild = interaction.guild
  const user = interaction.user

  const jenis = interaction.fields.getTextInputValue('jasa_jenis')
  const budget = interaction.fields.getTextInputValue('jasa_budget')
  const deadline = interaction.fields.getTextInputValue('jasa_deadline')
  const kontak = interaction.fields.getTextInputValue('jasa_kontak') || 'Tidak disertakan'

  const channelName = `jasa-${user.username.toLowerCase().replace(/\s+/g, '-')}`

  const existing = guild.channels.cache.find(c => c.name === channelName)
  if (existing) {
    await interaction.reply({
      content: `Kamu sudah punya tiket jasa yang aktif: ${existing}`,
      ephemeral: true,
    })
    return
  }

  // Kategori khusus jasa, jatuh balik ke kategori tiket biasa kalau belum di-set
  const jasaCatId = process.env.JASA_CATEGORY_ID || process.env.TICKET_CATEGORY_ID
  const category = jasaCatId ? guild.channels.cache.get(jasaCatId) : null
  const validCategory = category?.type === 4 ? category : null

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: validCategory ?? undefined,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      { id: guild.members.me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
    ],
  })

  const intro = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('🌐 Tiket Jasa Website Dibuka')
    .setDescription(`Halo ${user}, makasih udah tertarik sama jasa pembuatan website TC.\n\nAdmin udah nerima detail di bawah dan bakal segera balas buat ngobrolin proyekmu lebih lanjut.`)
    .setTimestamp()

  const detail = new EmbedBuilder()
    .setColor(0x2c2c2c)
    .setTitle('📋 Detail Permintaan')
    .addFields(
      { name: 'Jenis & Fitur', value: jenis },
      { name: 'Budget', value: budget, inline: true },
      { name: 'Deadline', value: deadline, inline: true },
      { name: 'Kontak & Referensi', value: kontak },
    )
    .setFooter({ text: `Diajukan oleh ${user.username}` })

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Tutup Tiket')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒'),
  )

  await channel.send({ content: `${user}`, embeds: [intro, detail], components: [row] })
  scheduleAutoClose(channel)

  // Notif ke log channel biar admin langsung tau ada lead masuk
  const logChannelId = process.env.LOG_CHANNEL_ID
  if (logChannelId) {
    const logChannel = await guild.client.channels.fetch(logChannelId).catch(() => null)
    if (logChannel) {
      await logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle('🌐 Lead Jasa Website Baru')
            .setDescription(`${user} baru ngajuin order jasa di ${channel}.`)
            .addFields(
              { name: 'Budget', value: budget, inline: true },
              { name: 'Deadline', value: deadline, inline: true },
            )
            .setTimestamp(),
        ],
      }).catch(() => {})
    }
  }

  await interaction.reply({
    content: `Tiket jasa kamu sudah dibuat: ${channel}`,
    ephemeral: true,
  })
}

// Tombol "Info Harga & Paket" -> ringkasan semua paket + bundle + tombol per-paket
export async function handleJasaHarga(interaction) {
  const tierLines = WEB_TIERS.map(t =>
    `**${t.name}** — *${t.tag}* · mulai **${formatRupiah(t.startFrom)}**${t.highlight ? ' ⭐' : ''}`,
  ).join('\n')

  const bundleLines = BUNDLES.map(b =>
    `• **${b.name}** — mulai ${formatRupiah(b.startFrom)}`,
  ).join('\n')

  const embed = new EmbedBuilder()
    .setColor(0x2c2c2c)
    .setTitle('💰 Paket & Harga Jasa Website')
    .setDescription(
      `Pilih paket di bawah buat penjelasan lengkapnya, atau coba **Hitung Estimasi** buat ngira-ngira biaya sesuai kebutuhanmu.\n\n` +
      `**📦 Paket (harga mulai dari):**\n${tierLines}\n\n` +
      `**🎁 Bundle Hemat:**\n${bundleLines}\n\n` +
      `*Semua angka di atas estimasi awal — harga final nyesuain scope & kerumitan project.*`,
    )
    .setFooter({ text: 'Terakhir Community — terakhircommunity.com/jasa' })

  // Row tombol per-paket
  const pkgRow = new ActionRowBuilder().addComponents(
    ...WEB_TIERS.map(t =>
      new ButtonBuilder()
        .setCustomId(`jasa_pkg:${t.id}`)
        .setLabel(t.name)
        .setStyle(t.highlight ? ButtonStyle.Primary : ButtonStyle.Secondary),
    ),
  )

  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('jasa_calc').setLabel('Hitung Estimasi').setStyle(ButtonStyle.Success).setEmoji('🧮'),
    new ButtonBuilder().setCustomId('jasa_start').setLabel('Order Sekarang').setStyle(ButtonStyle.Primary).setEmoji('🚀'),
  )

  await interaction.reply({ embeds: [embed], components: [pkgRow, actionRow], ephemeral: true })
}

// Tombol paket (jasa_pkg:<id>) -> penjelasan paket + follow-up
export async function handleJasaPaket(interaction, pkgId) {
  const tier = WEB_TIERS.find(t => t.id === pkgId)
  if (!tier) {
    return interaction.reply({ content: 'Paket nggak ketemu.', ephemeral: true }).catch(() => {})
  }

  const embed = new EmbedBuilder()
    .setColor(tier.highlight ? 0xe74c3c : 0x2c2c2c)
    .setTitle(`📦 Paket ${tier.name} — ${tier.tag}`)
    .setDescription(
      `${tier.penjelasan.singkat}\n\n` +
      `**💵 Harga mulai:** ${formatRupiah(tier.startFrom)}\n\n` +
      `**🧩 Fitur yang didapat:**\n${tier.features.map(f => `• ${f}`).join('\n')}\n\n` +
      `${tier.contoh}\n\n` +
      `> 💡 *Klik **Lihat Contoh** buat liat demo paket ini. Inget ya, itu cuma contoh — struktur & desainnya nanti bebas disesuaiin sama selera/brand kamu pas pengerjaan. Desain custom udah termasuk harga, kok.*`,
    )
    .setFooter({ text: 'Estimasi awal — final nyesuain scope project.' })

  const demoRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Lihat Contoh').setStyle(ButtonStyle.Link).setURL(`${JASA_DEMO_BASE}/${tier.demo}`).setEmoji('🖥️'),
  )

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`jasa_ok:${tier.id}`).setLabel('Mengerti, mau order').setStyle(ButtonStyle.Success).setEmoji('✅'),
    new ButtonBuilder().setCustomId(`jasa_eli5:${tier.id}`).setLabel('Masih bingung').setStyle(ButtonStyle.Secondary).setEmoji('❓'),
    new ButtonBuilder().setCustomId('jasa_staff').setLabel('Hubungi Staff').setStyle(ButtonStyle.Danger).setEmoji('📞'),
  )

  await interaction.reply({ embeds: [embed], components: [demoRow, row], ephemeral: true })
}

// Follow-up "Mengerti, mau order" -> arahin ke Order Jasa
export async function handleJasaOk(interaction, pkgId) {
  const tier = WEB_TIERS.find(t => t.id === pkgId)
  const nama = tier ? tier.name : 'ini'
  const embed = new EmbedBuilder()
    .setColor(0x27ae60)
    .setTitle('✅ Siap!')
    .setDescription(`Mantap, kamu tertarik paket **${nama}**. Klik **Order Jasa Website** buat isi detail kebutuhanmu, nanti admin lanjut bahas harga pas + timeline-nya.`)

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('jasa_start').setLabel('Order Jasa Website').setStyle(ButtonStyle.Primary).setEmoji('🚀'),
    new ButtonBuilder().setCustomId('jasa_staff').setLabel('Hubungi Staff').setStyle(ButtonStyle.Secondary).setEmoji('📞'),
  )

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true })
}

// Follow-up "Masih bingung" -> penjelasan versi simpel
export async function handleJasaEli5(interaction, pkgId) {
  const tier = WEB_TIERS.find(t => t.id === pkgId)
  if (!tier) {
    return interaction.reply({ content: 'Paket nggak ketemu.', ephemeral: true }).catch(() => {})
  }

  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle(`❓ Paket ${tier.name} — Versi Gampang`)
    .setDescription(tier.penjelasan.simpel)
    .setFooter({ text: 'Masih bingung juga? Klik Hubungi Staff, tanya bebas — gratis kok!' })

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`jasa_ok:${tier.id}`).setLabel('Oke, ngerti sekarang').setStyle(ButtonStyle.Success).setEmoji('✅'),
    new ButtonBuilder().setCustomId('jasa_staff').setLabel('Hubungi Staff').setStyle(ButtonStyle.Danger).setEmoji('📞'),
  )

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true })
}

// Tombol "Hitung Estimasi" -> tampilkan kalkulator (select halaman + select fitur)
export async function handleJasaCalc(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x2c2c2c)
    .setTitle('🧮 Kalkulator Estimasi Web')
    .setDescription(
      `Pilih jumlah halaman + fitur yang kamu mau, nanti bot kasih perkiraan totalnya.\n\n` +
      `**Harga dasar:** ${formatRupiah(CALC_BASE)} (web 1 halaman, sudah online)\n` +
      `**Tiap halaman ekstra:** +${formatRupiah(CALC_PER_PAGE)}\n\n` +
      `*Hasilnya estimasi kasar buat ngira-ngira — bukan harga fix.*`,
    )

  const pageSelect = new StringSelectMenuBuilder()
    .setCustomId('jasa_calc_pages')
    .setPlaceholder('Berapa halaman?')
    .addOptions(
      { label: '1 halaman (landing page)', value: '1' },
      { label: '3 halaman', value: '3' },
      { label: '5 halaman', value: '5' },
      { label: '8 halaman', value: '8' },
      { label: '12+ halaman', value: '12' },
    )

  const featSelect = new StringSelectMenuBuilder()
    .setCustomId('jasa_calc_feats')
    .setPlaceholder('Pilih fitur (boleh lebih dari satu)')
    .setMinValues(0)
    .setMaxValues(CALC_FEATURES.length)
    .addOptions(
      CALC_FEATURES.map(f => ({
        label: `${f.label} (+${formatRupiah(f.price)})`,
        description: f.note.slice(0, 100),
        value: f.id,
      })),
    )

  await interaction.reply({
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(pageSelect),
      new ActionRowBuilder().addComponents(featSelect),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('jasa_calc_reset').setLabel('Reset').setStyle(ButtonStyle.Secondary).setEmoji('🔄'),
        new ButtonBuilder().setCustomId('jasa_start').setLabel('Order Jasa').setStyle(ButtonStyle.Primary).setEmoji('🚀'),
      ),
    ],
    ephemeral: true,
  })
}

// Hitung & tampilkan ulang estimasi. State disimpan di customId via select values
// yang dibaca dari komponen pesan (Discord ngirim balik value terpilih).
export async function handleJasaCalcUpdate(interaction) {
  // Ambil pilihan terkini dari kedua select di message ini
  const msg = interaction.message
  let pages = 1
  const feats = new Set()

  // Nilai yang baru saja diubah
  if (interaction.customId === 'jasa_calc_pages') {
    pages = parseInt(interaction.values[0], 10) || 1
  } else if (interaction.customId === 'jasa_calc_feats') {
    interaction.values.forEach(v => feats.add(v))
  }

  // Pertahankan pilihan lain dari komponen pesan (default values yang sudah di-set)
  for (const row of msg.components) {
    for (const comp of row.components) {
      if (comp.customId === 'jasa_calc_pages' && interaction.customId !== 'jasa_calc_pages') {
        const sel = comp.options?.find(o => o.default)
        if (sel) pages = parseInt(sel.value, 10) || 1
      }
      if (comp.customId === 'jasa_calc_feats' && interaction.customId !== 'jasa_calc_feats') {
        comp.options?.forEach(o => { if (o.default) feats.add(o.value) })
      }
    }
  }

  // Hitung total
  const extraPages = Math.max(0, pages - 1)
  let total = CALC_BASE + extraPages * CALC_PER_PAGE
  const chosen = CALC_FEATURES.filter(f => feats.has(f.id))
  chosen.forEach(f => { total += f.price })

  const breakdown =
    `• Web dasar (1 halaman): ${formatRupiah(CALC_BASE)}\n` +
    (extraPages > 0 ? `• ${extraPages} halaman ekstra: +${formatRupiah(extraPages * CALC_PER_PAGE)}\n` : '') +
    chosen.map(f => `• ${f.label}: +${formatRupiah(f.price)}`).join('\n')

  const embed = new EmbedBuilder()
    .setColor(0x27ae60)
    .setTitle('🧮 Estimasi Kamu')
    .setDescription(
      `${breakdown || '• Web dasar'}\n\n` +
      `**💵 Total estimasi: mulai ${formatRupiah(total)}**\n\n` +
      `*Ini perkiraan kasar ya — harga final tetap nyesuain detail & kerumitan. Lanjut diskusi lewat Order Jasa biar dapet angka pasti.*`,
    )
    .setFooter({ text: `${pages} halaman · ${chosen.length} fitur tambahan` })

  // Rebuild select dengan default values dipertahankan biar pilihan keliatan
  const pageSelect = new StringSelectMenuBuilder()
    .setCustomId('jasa_calc_pages')
    .setPlaceholder('Berapa halaman?')
    .addOptions(
      [
        { label: '1 halaman (landing page)', value: '1' },
        { label: '3 halaman', value: '3' },
        { label: '5 halaman', value: '5' },
        { label: '8 halaman', value: '8' },
        { label: '12+ halaman', value: '12' },
      ].map(o => ({ ...o, default: o.value === String(pages) })),
    )

  const featSelect = new StringSelectMenuBuilder()
    .setCustomId('jasa_calc_feats')
    .setPlaceholder('Pilih fitur (boleh lebih dari satu)')
    .setMinValues(0)
    .setMaxValues(CALC_FEATURES.length)
    .addOptions(
      CALC_FEATURES.map(f => ({
        label: `${f.label} (+${formatRupiah(f.price)})`,
        description: f.note.slice(0, 100),
        value: f.id,
        default: feats.has(f.id),
      })),
    )

  await interaction.update({
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(pageSelect),
      new ActionRowBuilder().addComponents(featSelect),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('jasa_calc_reset').setLabel('Reset').setStyle(ButtonStyle.Secondary).setEmoji('🔄'),
        new ButtonBuilder().setCustomId('jasa_start').setLabel('Order Jasa').setStyle(ButtonStyle.Primary).setEmoji('🚀'),
      ),
    ],
  })
}

// Tombol "Gimana Kami Kerja" -> alur kerja (ga bikin tiket, cuma reply)
export async function handleJasaCaraKerja(interaction) {
  const lines = JASA_WORKFLOW.map(w => `**${w.t}**\n${w.d}`).join('\n\n')

  const embed = new EmbedBuilder()
    .setColor(0x2c2c2c)
    .setTitle('🛠️ Gimana TC Ngerjain Web Kamu')
    .setDescription(
      `Biar kamu tenang, ini alur kerja kami dari awal sampai webmu online dan kamu pegang sendiri.\n\n` +
      `${lines}\n\n` +
      `Singkatnya, kamu nggak cuma dapet web jadi, tapi juga web yang beneran kamu miliki dan ngerti cara pakainya.`,
    )
    .setFooter({ text: 'Terakhir Community — dari ide sampai online, kami temenin' })

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('jasa_harga').setLabel('Lihat Harga & Paket').setStyle(ButtonStyle.Secondary).setEmoji('💰'),
    new ButtonBuilder().setCustomId('jasa_start').setLabel('Order Jasa').setStyle(ButtonStyle.Primary).setEmoji('🚀'),
  )

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true })
}

// Select menu FAQ (jasa_faq) -> jawab pertanyaan terpilih
export async function handleJasaFaq(interaction) {
  const idx = parseInt(interaction.values[0], 10)
  const item = JASA_FAQ[idx]
  if (!item) {
    return interaction.reply({ content: 'Pertanyaan nggak ketemu.', ephemeral: true }).catch(() => {})
  }

  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle(`❓ ${item.q}`)
    .setDescription(item.a)
    .setFooter({ text: 'Masih ada yang mau ditanya? Klik Tanya Langsung ke Staff.' })

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('jasa_harga').setLabel('Lihat Harga & Paket').setStyle(ButtonStyle.Secondary).setEmoji('💰'),
    new ButtonBuilder().setCustomId('jasa_staff').setLabel('Tanya Langsung ke Staff').setStyle(ButtonStyle.Primary).setEmoji('📞'),
  )

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true })
}

// Tombol "Hubungi Staff" -> buka tiket jasa + tag semua role staff
export async function handleJasaStaff(interaction) {
  const guild = interaction.guild
  const user = interaction.user

  const channelName = `jasa-${user.username.toLowerCase().replace(/\s+/g, '-')}`
  const existing = guild.channels.cache.find(c => c.name === channelName)
  if (existing) {
    return interaction.reply({ content: `Kamu sudah punya tiket jasa yang aktif: ${existing}`, ephemeral: true })
  }

  const jasaCatId = process.env.JASA_CATEGORY_ID || process.env.TICKET_CATEGORY_ID
  const category = jasaCatId ? guild.channels.cache.get(jasaCatId) : null
  const validCategory = category?.type === 4 ? category : null

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: validCategory ?? undefined,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      { id: guild.members.me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
    ],
  })

  // Cari role staff buat di-tag
  const staffRoles = guild.roles.cache.filter(r => STAFF_ROLE_NAMES.includes(r.name))
  const mentions = staffRoles.size > 0
    ? staffRoles.map(r => `${r}`).join(' ')
    : ''

  const embed = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('📞 Tiket Jasa — Butuh Bantuan Staff')
    .setDescription(`Halo ${user}, kamu minta dihubungkan langsung sama staff. Tim udah di-tag dan bakal segera respon.\n\nSambil nunggu, boleh ceritain dulu kebutuhan web kamu di sini ya.`)
    .setTimestamp()

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('close_ticket').setLabel('Tutup Tiket').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
  )

  await channel.send({ content: `${user} ${mentions}`.trim(), embeds: [embed], components: [row], allowedMentions: { parse: ['roles', 'users'] } })
  scheduleAutoClose(channel)

  await interaction.reply({ content: `Tiket kamu sudah dibuat & staff udah dipanggil: ${channel}`, ephemeral: true })
}

// Tombol "Tanya-tanya / Bantuan" -> buka tiket bantuan jasa tanpa form
export async function handleJasaTanya(interaction) {
  const guild = interaction.guild
  const user = interaction.user

  const channelName = `jasa-${user.username.toLowerCase().replace(/\s+/g, '-')}`

  const existing = guild.channels.cache.find(c => c.name === channelName)
  if (existing) {
    await interaction.reply({
      content: `Kamu sudah punya tiket jasa yang aktif: ${existing}`,
      ephemeral: true,
    })
    return
  }

  const jasaCatId = process.env.JASA_CATEGORY_ID || process.env.TICKET_CATEGORY_ID
  const category = jasaCatId ? guild.channels.cache.get(jasaCatId) : null
  const validCategory = category?.type === 4 ? category : null

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: validCategory ?? undefined,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      { id: guild.members.me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
    ],
  })

  const embed = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('💬 Tiket Bantuan Jasa Dibuka')
    .setDescription(`Halo ${user}, mau tanya-tanya soal jasa website? Tulis pertanyaanmu di sini, admin bakal segera bantu.\n\nKalau udah yakin mau order, kamu bisa langsung kasih detail kebutuhanmu di sini juga.`)
    .setTimestamp()

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Tutup Tiket')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒'),
  )

  await channel.send({ content: `${user}`, embeds: [embed], components: [row] })
  scheduleAutoClose(channel)

  await interaction.reply({
    content: `Tiket bantuan kamu sudah dibuat: ${channel}`,
    ephemeral: true,
  })
}

export async function sendTicketTranscript(channel, closedBy) {
  const logChannelId = process.env.LOG_CHANNEL_ID
  if (!logChannelId) return

  try {
    let messages = []
    let lastId = null
    while (true) {
      const options = { limit: 100 }
      if (lastId) options.before = lastId
      const fetched = await channel.messages.fetch(options)
      if (fetched.size === 0) break
      messages.push(...fetched.values())
      lastId = fetched.lastKey()
      if (fetched.size < 100) break
    }

    messages.reverse()

    const closedByName = typeof closedBy === 'object' ? closedBy.tag : closedBy
    let transcriptText = `=== TRANSKRIP TIKET: ${channel.name} ===\n`
    transcriptText += `Ditutup oleh: ${closedByName}\n`
    transcriptText += `Waktu Penutupan: ${new Date().toISOString()}\n`
    transcriptText += `========================================\n\n`

    for (const msg of messages) {
      const timestamp = msg.createdAt.toISOString()
      const author = msg.author.tag
      let content = msg.content
      
      if (msg.attachments.size > 0) {
        const urls = [...msg.attachments.values()].map(a => a.url).join(', ')
        content += ` [Attachments: ${urls}]`
      }
      
      if (msg.embeds.length > 0) {
        content += ` [Embeds: ${msg.embeds.length} embeds]`
      }

      transcriptText += `[${timestamp}] ${author}: ${content}\n`
    }

    const buffer = Buffer.from(transcriptText, 'utf-8')
    const attachment = new AttachmentBuilder(buffer, { name: `transcript-${channel.name}.txt` })

    const logChannel = await channel.client.channels.fetch(logChannelId).catch(() => null)
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('🎫 Tiket Ditutup')
        .setDescription(`Channel tiket **#${channel.name}** telah ditutup dan dihapus.`)
        .addFields(
          { name: 'Nama Tiket', value: channel.name, inline: true },
          { name: 'Ditutup oleh', value: typeof closedBy === 'object' ? `${closedBy}` : closedBy, inline: true }
        )
        .setTimestamp()

      await logChannel.send({ embeds: [embed], files: [attachment] })
    }
  } catch (error) {
    console.error('Gagal mengirim transkrip tiket:', error)
  }
}

export async function handleCloseTicket(interaction) {
  const chName = interaction.channel.name
  if (!chName.startsWith('tiket-') && !chName.startsWith('jasa-')) {
    await interaction.reply({ content: 'Tombol ini hanya bisa dipakai di channel tiket.', ephemeral: true })
    return
  }

  cancelTicketTimer(interaction.channel.id)
  await interaction.reply({ content: 'Menutup tiket dalam 5 detik...' })
  await sendTicketTranscript(interaction.channel, interaction.user)
  setTimeout(() => interaction.channel.delete().catch(() => {}), 5000)
}
