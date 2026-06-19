import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js'
import { handleTicketButton, handleCloseTicket } from '../commands/ticket.js'
import { acceptOrder, rejectOrder } from '../utils/webApi.js'

const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID
const ROLE_MALE_NAME = 'Male'
const ROLE_FEMALE_NAME = 'Female'

function isModerator(member) {
  return member.permissions.has(PermissionFlagsBits.ModerateMembers)
}

async function handleRoleSelect(interaction, gender) {
  const guild = interaction.guild
  const member = interaction.member

  const roleName = gender === 'male' ? ROLE_MALE_NAME : ROLE_FEMALE_NAME
  const oppositeName = gender === 'male' ? ROLE_FEMALE_NAME : ROLE_MALE_NAME

  let role = guild.roles.cache.find(r => r.name === roleName)
  if (!role) {
    role = await guild.roles.create({ name: roleName, reason: 'Auto-created by TC_Bot' })
  }

  const oppositeRole = guild.roles.cache.find(r => r.name === oppositeName)
  if (oppositeRole && member.roles.cache.has(oppositeRole.id)) {
    await member.roles.remove(oppositeRole).catch(() => {})
  }

  if (member.roles.cache.has(role.id)) {
    return interaction.reply({ content: `Kamu udah punya role **${roleName}**.`, ephemeral: true })
  }

  await member.roles.add(role)
  await interaction.reply({ content: `Role **${roleName}** berhasil ditambahkan!`, ephemeral: true })
}

async function handleReportBug(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_report_bug')
    .setTitle('Laporkan Bug')

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_location').setLabel('Di mana bug-nya?').setStyle(TextInputStyle.Short).setPlaceholder('Contoh: Mount Fein, halaman store, dsb').setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_desc').setLabel('Apa yang terjadi?').setStyle(TextInputStyle.Paragraph).setPlaceholder('Jelaskan bug dengan detail').setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_reproduce').setLabel('Cara reproduce (langkah-langkah)').setStyle(TextInputStyle.Paragraph).setRequired(false)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_evidence').setLabel('Link bukti (screenshot/video)').setStyle(TextInputStyle.Short).setRequired(false)
    ),
  )

  await interaction.showModal(modal)
}

async function handleReportCheater(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_report_cheater')
    .setTitle('Laporkan Cheater')

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('cheater_username').setLabel('Username Roblox pelaku').setStyle(TextInputStyle.Short).setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('cheater_map').setLabel('Map/game tempat kejadian').setStyle(TextInputStyle.Short).setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('cheater_desc').setLabel('Jenis kecurangan yang dilakukan').setStyle(TextInputStyle.Paragraph).setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('cheater_evidence').setLabel('Link bukti (wajib)').setStyle(TextInputStyle.Short).setRequired(true)
    ),
  )

  await interaction.showModal(modal)
}

async function handleSuggestion(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_suggestion')
    .setTitle('Kirim Saran')

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('suggestion_title').setLabel('Judul saran').setStyle(TextInputStyle.Short).setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('suggestion_desc').setLabel('Jelaskan saranmu').setStyle(TextInputStyle.Paragraph).setRequired(true)
    ),
  )

  await interaction.showModal(modal)
}

async function handleOrderAcceptPrompt(interaction, userId, channelId) {
  if (!isModerator(interaction.member)) {
    return interaction.reply({ content: 'Hanya moderator yang bisa mengkonfirmasi order.', ephemeral: true })
  }

  const modal = new ModalBuilder()
    .setCustomId(`modal_order_accept:${userId}:${channelId}`)
    .setTitle('Konfirmasi Order')

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('order_id')
        .setLabel('Order ID (dari website TC)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Contoh: abc123-xxxx-xxxx')
        .setRequired(true)
    ),
  )

  await interaction.showModal(modal)
}

async function handleOrderRejectPrompt(interaction, userId, channelId) {
  if (!isModerator(interaction.member)) {
    return interaction.reply({ content: 'Hanya moderator yang bisa menolak order.', ephemeral: true })
  }

  const modal = new ModalBuilder()
    .setCustomId(`modal_order_reject:${userId}:${channelId}`)
    .setTitle('Tolak Order')

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('order_id')
        .setLabel('Order ID (dari website TC)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('reject_reason')
        .setLabel('Alasan penolakan')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
    ),
  )

  await interaction.showModal(modal)
}

async function handleModalSubmit(interaction, client) {
  const id = interaction.customId
  const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null)

  if (id === 'modal_report_bug') {
    const location = interaction.fields.getTextInputValue('bug_location')
    const desc = interaction.fields.getTextInputValue('bug_desc')
    const reproduce = interaction.fields.getTextInputValue('bug_reproduce') || 'Tidak disertakan'
    const evidence = interaction.fields.getTextInputValue('bug_evidence') || 'Tidak ada'

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle('🐛 Bug Report Baru')
      .addFields(
        { name: 'Pelapor', value: `${interaction.user}`, inline: true },
        { name: 'Lokasi', value: location, inline: true },
        { name: 'Deskripsi', value: desc },
        { name: 'Cara Reproduce', value: reproduce },
        { name: 'Bukti', value: evidence },
      )
      .setTimestamp()

    await interaction.reply({ content: 'Laporan bug kamu sudah diterima. Tim admin akan segera mengecek.', ephemeral: true })
    if (logChannel) await logChannel.send({ embeds: [embed] })
  }

  if (id === 'modal_report_cheater') {
    const username = interaction.fields.getTextInputValue('cheater_username')
    const map = interaction.fields.getTextInputValue('cheater_map')
    const desc = interaction.fields.getTextInputValue('cheater_desc')
    const evidence = interaction.fields.getTextInputValue('cheater_evidence')

    const embed = new EmbedBuilder()
      .setColor(0x8e44ad)
      .setTitle('🚨 Cheater Report Baru')
      .addFields(
        { name: 'Pelapor', value: `${interaction.user}`, inline: true },
        { name: 'Username Pelaku', value: username, inline: true },
        { name: 'Map/Game', value: map, inline: true },
        { name: 'Kecurangan', value: desc },
        { name: 'Bukti', value: evidence },
      )
      .setTimestamp()

    await interaction.reply({ content: 'Laporan kamu sudah diterima. Admin akan menindaklanjuti secepatnya.', ephemeral: true })
    if (logChannel) await logChannel.send({ embeds: [embed] })
  }

  if (id === 'modal_suggestion') {
    const title = interaction.fields.getTextInputValue('suggestion_title')
    const desc = interaction.fields.getTextInputValue('suggestion_desc')

    const embed = new EmbedBuilder()
      .setColor(0x27ae60)
      .setTitle(`💡 ${title}`)
      .setDescription(desc)
      .setFooter({ text: `Dari ${interaction.user.username}` })
      .setTimestamp()

    await interaction.reply({ content: 'Saran kamu sudah masuk. Makasih udah peduli dengan TC!', ephemeral: true })

    const suggChannel = await client.channels.fetch(process.env.SUGGESTION_CHANNEL_ID).catch(() => null)
    if (suggChannel) {
      const msg = await suggChannel.send({ embeds: [embed] })
      await msg.react('👍')
      await msg.react('👎')
    }
    if (logChannel) await logChannel.send({ embeds: [embed] })
  }

  // Accept order modal
  if (id.startsWith('modal_order_accept:')) {
    const [, userId, channelId] = id.split(':')
    const orderId = interaction.fields.getTextInputValue('order_id').trim()

    await interaction.deferReply({ ephemeral: true })

    const result = await acceptOrder(orderId).catch(e => ({ error: e.message }))

    if (result?.error || !result?.success) {
      return interaction.editReply({ content: `Gagal accept order: ${result?.error || 'Unknown error'}` })
    }

    await interaction.editReply({ content: `Order \`${orderId}\` berhasil di-accept. Email konfirmasi sudah dikirim ke buyer.` })

    const ticketChannel = await client.channels.fetch(channelId).catch(() => null)
    if (ticketChannel) {
      const embed = new EmbedBuilder()
        .setColor(0x27ae60)
        .setTitle('Order Dikonfirmasi')
        .setDescription(`Pembayaran kamu telah dikonfirmasi oleh ${interaction.user}.\n\nCek email untuk link download. Tiket ini akan ditutup otomatis.`)
        .setTimestamp()
      await ticketChannel.send({ embeds: [embed] })
    }

    if (logChannel) {
      await logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x27ae60)
            .setTitle('Order Accepted')
            .addFields(
              { name: 'Order ID', value: orderId, inline: true },
              { name: 'Dikonfirmasi oleh', value: `${interaction.user}`, inline: true },
            )
            .setTimestamp()
        ]
      })
    }
  }

  // Reject order modal
  if (id.startsWith('modal_order_reject:')) {
    const [, userId, channelId] = id.split(':')
    const orderId = interaction.fields.getTextInputValue('order_id').trim()
    const reason = interaction.fields.getTextInputValue('reject_reason').trim()

    await interaction.deferReply({ ephemeral: true })

    const result = await rejectOrder(orderId, reason).catch(e => ({ error: e.message }))

    if (result?.error || !result?.success) {
      return interaction.editReply({ content: `Gagal reject order: ${result?.error || 'Unknown error'}` })
    }

    await interaction.editReply({ content: `Order \`${orderId}\` berhasil di-reject.` })

    const ticketChannel = await client.channels.fetch(channelId).catch(() => null)
    if (ticketChannel) {
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('Order Ditolak')
        .setDescription(`Maaf, pembayaran kamu tidak bisa dikonfirmasi.\n\n**Alasan:** ${reason}\n\nHubungi admin jika ada pertanyaan.`)
        .setTimestamp()
      await ticketChannel.send({ embeds: [embed] })
    }

    if (logChannel) {
      await logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle('Order Rejected')
            .addFields(
              { name: 'Order ID', value: orderId, inline: true },
              { name: 'Ditolak oleh', value: `${interaction.user}`, inline: true },
              { name: 'Alasan', value: reason },
            )
            .setTimestamp()
        ]
      })
    }
  }
}

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName)
      if (!command) return
      try {
        await command.execute(interaction)
      } catch (err) {
        const msg = { content: 'Terjadi error saat menjalankan command.', ephemeral: true }
        if (interaction.replied || interaction.deferred) await interaction.followUp(msg)
        else await interaction.reply(msg)
      }
      return
    }

    if (interaction.isButton()) {
      const customId = interaction.customId

      // Dynamic button handlers (pakai prefix)
      if (customId.startsWith('order_accept_prompt:')) {
        const [, userId, channelId] = customId.split(':')
        await handleOrderAcceptPrompt(interaction, userId, channelId).catch(() => {})
        return
      }
      if (customId.startsWith('order_reject_prompt:')) {
        const [, userId, channelId] = customId.split(':')
        await handleOrderRejectPrompt(interaction, userId, channelId).catch(() => {})
        return
      }

      const handlers = {
        open_ticket: () => handleTicketButton(interaction),
        close_ticket: () => handleCloseTicket(interaction),
        report_bug: () => handleReportBug(interaction),
        report_cheater: () => handleReportCheater(interaction),
        submit_suggestion: () => handleSuggestion(interaction),
        role_male: () => handleRoleSelect(interaction, 'male'),
        role_female: () => handleRoleSelect(interaction, 'female'),
      }
      const handler = handlers[customId]
      if (handler) {
        try {
          await handler()
        } catch (err) {
          const msg = { content: 'Terjadi error: ' + err.message, ephemeral: true }
          if (interaction.replied || interaction.deferred) await interaction.followUp(msg).catch(() => {})
          else await interaction.reply(msg).catch(() => {})
        }
      }
      return
    }

    if (interaction.isModalSubmit()) {
      await handleModalSubmit(interaction, client)
    }
  },
}
