import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { setupRules, setupReportBug, setupReportCheater, setupSuggestion, setupPaidAsset, setupFreeAsset, setupChatNav } from './setupChannels.js'
import { loadScamHashes } from '../utils/scamHash.js'

async function setupTicketPanel(client) {
  const channelId = process.env.TICKET_PANEL_CHANNEL_ID
  if (!channelId) return
  const channel = await client.channels.fetch(channelId).catch(() => null)
  if (!channel) return

  const messages = await channel.messages.fetch({ limit: 20 })
  const existing = messages.find(m => m.author.id === client.user.id && m.components.length > 0)
  if (existing) return

  const embed = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('Terakhir Community — Help Center')
    .setDescription('Butuh bantuan atau ada urusan sama admin? Buka tiket di sini.\n\nTim akan balas secepatnya. Jangan spam tiket ya.')
    .setFooter({ text: 'Terakhir Community' })

  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('open_ticket').setLabel('Buka Tiket').setStyle(ButtonStyle.Primary).setEmoji('🎫'),
  )

  const linkRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Peraturan').setStyle(ButtonStyle.Link).setEmoji('📋').setURL('https://discord.com/channels/' + process.env.GUILD_ID + '/' + process.env.RULES_CHANNEL_ID),
    new ButtonBuilder().setLabel('Report Bug').setStyle(ButtonStyle.Link).setEmoji('🐛').setURL('https://discord.com/channels/' + process.env.GUILD_ID + '/' + process.env.REPORT_BUG_CHANNEL_ID),
    new ButtonBuilder().setLabel('Report Cheater').setStyle(ButtonStyle.Link).setEmoji('🚨').setURL('https://discord.com/channels/' + process.env.GUILD_ID + '/' + process.env.REPORT_CHEATER_CHANNEL_ID),
    new ButtonBuilder().setLabel('Saran').setStyle(ButtonStyle.Link).setEmoji('💡').setURL('https://discord.com/channels/' + process.env.GUILD_ID + '/' + process.env.SUGGESTION_CHANNEL_ID),
  )

  await channel.send({ embeds: [embed], components: [navRow, linkRow] })
}

async function setupRoleSelection(client) {
  const channelId = process.env.RULES_CHANNEL_ID
  if (!channelId) return
  const channel = await client.channels.fetch(channelId).catch(() => null)
  if (!channel) return

  const messages = await channel.messages.fetch({ limit: 20 })
  const existing = messages.find(m => m.author.id === client.user.id && m.customId === 'role_select' || (m.author.id === client.user.id && m.components.length > 0 && m.embeds.some(e => e.title?.includes('Gender'))))
  if (existing) return

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Pilih Gender Kamu')
    .setDescription('Klik salah satu di bawah buat dapet role. Bisa diganti kapan aja.')

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('role_male').setLabel('Male').setStyle(ButtonStyle.Primary).setEmoji('👦'),
    new ButtonBuilder().setCustomId('role_female').setLabel('Female').setStyle(ButtonStyle.Danger).setEmoji('👧'),
  )

  await channel.send({ embeds: [embed], components: [row] })
}

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Bot online: ${client.user.tag}`)
    await loadScamHashes()
    await Promise.all([
      setupTicketPanel(client),
      setupRules(client),
      setupReportBug(client),
      setupReportCheater(client),
      setupSuggestion(client),
      setupRoleSelection(client),
      setupPaidAsset(client),
      setupFreeAsset(client),
      setupChatNav(client),
    ])
  },
}
