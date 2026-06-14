const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js')

const SUPPORT_ROLES = [
  '1410673000025686149', // Manager
  '1430067174848073870', // Moderator
]

const AUTO_CLOSE_MS = 10 * 60 * 1000 // 10 menit
const ticketTimers = new Map() // channelId → timeout

function resetAutoClose(channel) {
  if (ticketTimers.has(channel.id)) clearTimeout(ticketTimers.get(channel.id))
  const timer = setTimeout(async () => {
    try {
      await channel.send('⏰ Tiket ditutup otomatis karena tidak ada aktivitas selama 10 menit.')
      await new Promise((r) => setTimeout(r, 3000))
      await channel.delete()
    } catch {}
    ticketTimers.delete(channel.id)
  }, AUTO_CLOSE_MS)
  ticketTimers.set(channel.id, timer)
}

const TICKET_CATEGORY_NAME = 'Tickets'

async function sendTicketPanel(channel) {
  const embed = new EmbedBuilder()
    .setTitle('🎫 Open Tiket')
    .setDescription(
      'Butuh bantuan atau ada pertanyaan?\nKlik tombol di bawah untuk membuka tiket.\n\n' +
      '> Tim kami akan segera membantu kamu!'
    )
    .setColor(0xcc0000)
    .setFooter({ text: 'Terakhir Community • Support' })

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_open')
      .setLabel('Buka Tiket')
      .setEmoji('🎫')
      .setStyle(ButtonStyle.Danger)
  )

  await channel.send({ embeds: [embed], components: [row] })
}

async function handleTicketOpen(interaction) {
  await interaction.deferReply({ ephemeral: true })

  const guild = interaction.guild
  const member = interaction.member

  // Cek tiket yang sudah ada
  const existing = guild.channels.cache.find(
    (c) => c.name === `tiket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}` ||
           c.topic === `ticket-${member.id}`
  )

  if (existing) {
    return interaction.editReply({
      content: `Kamu sudah punya tiket yang aktif: ${existing}`,
    })
  }

  // Cari atau buat category Tickets
  let category = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildCategory && c.name === TICKET_CATEGORY_NAME
  )

  if (!category) {
    category = await guild.channels.create({
      name: TICKET_CATEGORY_NAME,
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      ],
    })
  }

  // Permission overwrites
  const permOverwrites = [
    { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: member.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
      ],
    },
  ]

  for (const roleId of SUPPORT_ROLES) {
    const role = guild.roles.cache.get(roleId)
    if (role) {
      permOverwrites.push({
        id: roleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageMessages,
        ],
      })
    }
  }

  // Buat channel tiket
  const ticketChannel = await guild.channels.create({
    name: `tiket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    type: ChannelType.GuildText,
    parent: category.id,
    topic: `ticket-${member.id}`,
    permissionOverwrites: permOverwrites,
  })

  // Embed di dalam tiket
  const ticketEmbed = new EmbedBuilder()
    .setTitle(`🎫 Tiket — ${member.user.username}`)
    .setDescription(
      `Halo ${member}! Tim support akan segera membantu kamu.\n\n` +
      '**Jelaskan keperluanmu di sini.**\n\n' +
      '> Klik tombol **Tutup Tiket** jika sudah selesai.'
    )
    .setColor(0xcc0000)
    .setTimestamp()

  const storeEmbed = new EmbedBuilder()
    .setTitle('🛒 Produk Tersedia')
    .setDescription('Klik link di bawah untuk melihat detail produk yang ingin kamu beli.')
    .setColor(0x1a1a2e)
    .addFields(
      { name: '📦 Satuan', value: '> Rasengan Ability System — Rp 85.000\n> Blackhole Coil System — Rp 65.000\n> Hammer Coil — Rp 50.000' },
      { name: '🎁 Bundle', value: '> Paket Rasengan + Blackhole — Rp 135.000\n> Paket Rasengan + Hammer — Rp 120.000\n> Paket Blackhole + Hammer — Rp 100.000\n> Take All (3 item) — Rp 185.000' }
    )

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_close')
      .setLabel('Tutup Tiket')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('ticket_cara_order')
      .setLabel('Cara Order')
      .setEmoji('📋')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('ticket_hubungi_admin')
      .setLabel('Hubungi Admin')
      .setEmoji('💬')
      .setStyle(ButtonStyle.Success),
  )

  const satuan = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Rasengan Coil').setStyle(ButtonStyle.Link).setURL('https://terakhircommunity.com/store/rasengan-coil'),
    new ButtonBuilder().setLabel('Blackhole Coil').setStyle(ButtonStyle.Link).setURL('https://terakhircommunity.com/store/blackhole-coil'),
    new ButtonBuilder().setLabel('Hammer Coil').setStyle(ButtonStyle.Link).setURL('https://terakhircommunity.com/store/hammer-coil'),
  )

  const bundle = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Rasengan + Blackhole').setStyle(ButtonStyle.Link).setURL('https://terakhircommunity.com/store/coil-pack-rasengan-blackhole'),
    new ButtonBuilder().setLabel('Rasengan + Hammer').setStyle(ButtonStyle.Link).setURL('https://terakhircommunity.com/store/coil-pack-rasengan-hammer'),
    new ButtonBuilder().setLabel('Blackhole + Hammer').setStyle(ButtonStyle.Link).setURL('https://terakhircommunity.com/store/coil-pack-blackhole-hammer'),
    new ButtonBuilder().setLabel('Take All 🔥').setStyle(ButtonStyle.Link).setURL('https://terakhircommunity.com/store/coil-take-all'),
  )

  await ticketChannel.send({
    content: `${member} | <@&${SUPPORT_ROLES[0]}>`,
    embeds: [ticketEmbed, storeEmbed],
    components: [satuan, bundle, closeRow],
  })

  resetAutoClose(ticketChannel)

  await interaction.editReply({
    content: `Tiket kamu sudah dibuat: ${ticketChannel}`,
  })
}

async function handleTicketClose(interaction) {
  await interaction.deferReply({ ephemeral: true })

  const channel = interaction.channel
  const member = interaction.member

  // Cek apakah yang nutup punya role support atau pemilik tiket
  const isSupport = SUPPORT_ROLES.some((id) => member.roles.cache.has(id))
  const isOwner = channel.topic === `ticket-${member.id}`

  if (!isSupport && !isOwner) {
    return interaction.editReply({ content: 'Kamu tidak bisa menutup tiket ini.' })
  }

  const closeEmbed = new EmbedBuilder()
    .setDescription(`🔒 Tiket ditutup oleh ${member.user.username}. Channel akan dihapus dalam 5 detik.`)
    .setColor(0x555555)

  await interaction.editReply({ content: 'Menutup tiket...' })
  await channel.send({ embeds: [closeEmbed] })

  if (ticketTimers.has(channel.id)) {
    clearTimeout(ticketTimers.get(channel.id))
    ticketTimers.delete(channel.id)
  }
  setTimeout(() => channel.delete().catch(() => {}), 5000)
}

async function handleCaraOrder(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('📋 Cara Order di Terakhir Community')
    .setColor(0xcc0000)
    .addFields(
      { name: '1️⃣ Pilih Produk', value: 'Buka store di website dan pilih produk yang kamu mau. Klik tombol link produk di atas.' },
      { name: '2️⃣ Isi Form Order', value: 'Di halaman produk, isi form:\n• Nama pembeli\n• Email aktif\n• Username Roblox kamu\n• Metode pembayaran (DANA / OVO / GoPay / BCA / BNI / BRI / Mandiri)' },
      { name: '3️⃣ Upload Bukti Transfer', value: 'Setelah transfer, upload screenshot bukti bayar di form yang sama.' },
      { name: '4️⃣ Submit & Tunggu Konfirmasi', value: 'Klik Submit. Tim kami akan verifikasi pembayaran dan konfirmasi via email + notif website.' },
      { name: '5️⃣ Terima Asset', value: 'Setelah dikonfirmasi, link download akan dikirim ke email kamu secara otomatis.' },
      { name: '⚠️ Penting', value: '• Pastikan username Roblox benar\n• Simpan email konfirmasi untuk klaim ulang jika perlu\n• Proses konfirmasi biasanya 1–24 jam' },
    )
    .setFooter({ text: 'Terakhir Community • Store' })

  await interaction.reply({ embeds: [embed], ephemeral: true })
}

async function handleHubungiAdmin(interaction) {
  const member = interaction.member
  await interaction.reply({
    content: `<@&${SUPPORT_ROLES[0]}> — ${member} membutuhkan bantuan langsung!`,
  })
}

module.exports = { sendTicketPanel, handleTicketOpen, handleTicketClose, handleCaraOrder, handleHubungiAdmin, resetAutoClose }
