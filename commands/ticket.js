import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} from 'discord.js'

const AUTO_CLOSE_MS = 24 * 60 * 60 * 1000
const ticketTimers = new Map()

function scheduleAutoClose(channel) {
  if (ticketTimers.has(channel.id)) clearTimeout(ticketTimers.get(channel.id))
  const timer = setTimeout(async () => {
    ticketTimers.delete(channel.id)
    await channel.send('Tiket ditutup otomatis karena tidak ada aktivitas selama 24 jam.').catch(() => {})
    setTimeout(() => channel.delete().catch(() => {}), 5000)
  }, AUTO_CLOSE_MS)
  ticketTimers.set(channel.id, timer)
}

export function resetTicketTimer(channel) {
  if (ticketTimers.has(channel.id)) scheduleAutoClose(channel)
}

export function cancelTicketTimer(channelId) {
  if (ticketTimers.has(channelId)) {
    clearTimeout(ticketTimers.get(channelId))
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

  await channel.send({ content: `${user}`, embeds: [embed], components: [row] })
  scheduleAutoClose(channel)

  await interaction.reply({
    content: `Tiket kamu sudah dibuat: ${channel}`,
    ephemeral: true,
  })
}

export async function handleCloseTicket(interaction) {
  if (!interaction.channel.name.startsWith('tiket-')) {
    await interaction.reply({ content: 'Tombol ini hanya bisa dipakai di channel tiket.', ephemeral: true })
    return
  }

  cancelTicketTimer(interaction.channel.id)
  await interaction.reply({ content: 'Menutup tiket dalam 5 detik...' })
  setTimeout(() => interaction.channel.delete().catch(() => {}), 5000)
}
