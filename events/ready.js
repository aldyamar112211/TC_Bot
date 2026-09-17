import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { setupRules, setupReportBug, setupReportCheater, setupSuggestion, setupPaidAsset, setupFreeAsset, setupChatNav, setupJasaWebsite, setupJasaTanya } from './setupChannels.js'
import { loadScamHashes } from '../utils/scamHash.js'
import { buildWebInfoMessages, WEBINFO_CHANNEL_ID } from '../commands/webinfo-panel.js'
import { buildToolkitPanel, TOOLKIT_CHANNEL_ID } from '../commands/toolkit-panel.js'
import { buildTCMobilePanel, TCMOBILE_CHANNEL_ID } from '../commands/tcmobile-panel.js'
import { buildGuiPanel, GUISPOOF_CHANNEL_ID } from '../commands/guispoof-panel.js'
import { CHANGELOG, CHANGELOG_CHANNEL_ID } from '../data/changelog.js'
import { EXE_MOBILE_CHANGELOG, EXE_MOBILE_CHANGELOG_CHANNEL_ID } from '../data/exeMobileChangelog.js'

// Broadcast changelog: kirim entri yang BELUM ada di channel (anti-dobel).
// Deteksi pakai id yang ditanam di footer embed. Dipakai buat channel web
// DAN channel exe/mobile (beda data, mekanisme sama).
async function broadcastChangelog(client, channelId, entries) {
  const channel = await client.channels.fetch(channelId).catch((err) => {
    console.error(`[changelog] gagal fetch channel ${channelId}:`, err.message)
    return null
  })
  if (!channel) return

  // Ambil riwayat lebih dari 100 pesan. Discord batasin 100 per request, jadi
  // di-page pakai `before`. Dulu cuma baca 100 pesan terakhir, padahal entry
  // non-draft udah 35+ -- begitu channel kelewat rame, entry lama kegeser keluar
  // jendela dan bot nganggep itu belum kekirim, terus ngirim ulang semuanya.
  const sentIds = new Set()
  let before
  for (let page = 0; page < 5; page++) {
    const batch = await channel.messages.fetch({ limit: 100, before }).catch((err) => {
      console.error('[changelog] gagal fetch riwayat pesan:', err.message)
      return null
    })
    if (!batch || batch.size === 0) break
    batch.forEach(m => {
      m.embeds.forEach(e => {
        const match = e.footer?.text?.match(/id:\s*(\S+)/)
        if (match) sentIds.add(match[1])
      })
    })
    before = batch.lastKey()
    if (batch.size < 100) break
  }
  // kirim entri yang belum ada & bukan draft, urut lama -> baru biar stacking rapi
  // draft:true = udah ditulis tapi belum siap broadcast (hapus flag pas mau kirim)
  const toSend = entries.filter(c => !sentIds.has(c.id) && !c.draft).reverse()
  if (toSend.length === 0) {
    console.log(`[changelog] ${channelId}: gak ada entry baru (${sentIds.size} id kebaca di riwayat).`)
    return
  }
  console.log(`[changelog] ${channelId}: ngirim ${toSend.length} entry baru...`)

  let ok = 0
  for (const c of toSend) {
    const embed = new EmbedBuilder()
      .setColor(0xff1f3d)
      .setAuthor({ name: `🚀 ${c.version || 'Update'}` })
      .setTitle(c.title)
      .setDescription(c.changes.map(x => x.trimStart().startsWith('#') ? `\n${x}` : `• ${x}`).join('\n'))
      .setFooter({ text: `Terakhir Community • ${c.date || ''} • id: ${c.id}` })
    if (c.image) embed.setImage(c.image)
    if (c.url) embed.addFields({ name: '🔗 Coba Sekarang', value: c.url })
    // mentionUserId (opsional): tag user tertentu di depan @everyone, misal
    // buat balas request/laporan mereka langsung di pengumuman fitur terkait.
    const content = c.mentionUserId ? `<@${c.mentionUserId}> @everyone` : '@everyone'
    const allowedMentions = c.mentionUserId
      ? { parse: ['everyone'], users: [c.mentionUserId] }
      : { parse: ['everyone'] }

    // JANGAN telen error di sini. Dulu pakai .catch(() => {}) polos, jadi kalau
    // send gagal (izin Mention Everyone dicabut, rate limit, embed kepanjangan)
    // pesannya ilang tanpa jejak dan botnya keliatan normal -- susah dilacak.
    try {
      await channel.send({ content, embeds: [embed], allowedMentions })
      ok++
    } catch (err) {
      console.error(`[changelog] GAGAL kirim "${c.id}":`, err.message)
    }

    // Jeda antar-kirim biar ga kena rate limit Discord pas entry-nya numpuk
    // banyak (kirim 7 embed + @everyone berturut-turut tanpa jeda itu rawan).
    await new Promise(r => setTimeout(r, 1500))
  }

  console.log(`[changelog] ${channelId}: ${ok}/${toSend.length} entry kekirim.`)
}

async function setupChangelog(client) {
  await broadcastChangelog(client, CHANGELOG_CHANNEL_ID, CHANGELOG)
}

async function setupExeMobileChangelog(client) {
  await broadcastChangelog(client, EXE_MOBILE_CHANGELOG_CHANNEL_ID, EXE_MOBILE_CHANGELOG)
}

// Panel Web Information standby di channel-nya. Auto-kirim sekali kalau belum ada.
async function setupWebInfoPanel(client) {
  const channel = await client.channels.fetch(WEBINFO_CHANNEL_ID).catch(() => null)
  if (!channel) return
  const messages = await channel.messages.fetch({ limit: 20 }).catch(() => null)
  const existing = messages?.find(m => m.author.id === client.user.id && m.embeds.some(e => e.title?.includes('Web Information')))
  if (existing) return
  for (const msg of buildWebInfoMessages()) {
    await channel.send(msg).catch(() => {})
  }
}

// Panel download TC-Toolkit standby. Auto-kirim sekali kalau belum ada.
// Butuh ENV TOOLKIT_CHANNEL_ID (channel) + TOOLKIT_DOWNLOAD_URL (link direct download,
// sekarang GitHub Release repo tc-releases, dulu Google Drive).
async function setupToolkitPanel(client) {
  if (!TOOLKIT_CHANNEL_ID || TOOLKIT_CHANNEL_ID === 'GANTI_CHANNEL_ID') return
  const channel = await client.channels.fetch(TOOLKIT_CHANNEL_ID).catch(() => null)
  if (!channel) return
  const messages = await channel.messages.fetch({ limit: 20 }).catch(() => null)
  const existing = messages?.find(m => m.author.id === client.user.id && m.embeds.some(e => e.title?.includes('TC-Toolkit')))
  if (existing) return
  await channel.send(buildToolkitPanel()).catch(() => {})
}

// Panel download TC Mobile standby. Auto-kirim sekali kalau belum ada. Berlaku sama
// walau TCMOBILE_DOWNLOAD_URL belum di-set (mode "coming soon", panel tetap tampil).
async function setupTCMobilePanel(client) {
  if (!TCMOBILE_CHANNEL_ID) return
  const channel = await client.channels.fetch(TCMOBILE_CHANNEL_ID).catch(() => null)
  if (!channel) return
  const messages = await channel.messages.fetch({ limit: 20 }).catch(() => null)
  const existing = messages?.find(m => m.author.id === client.user.id && m.embeds.some(e => e.title?.includes('TC Mobile')))
  if (existing) return
  await channel.send(buildTCMobilePanel()).catch(() => {})
}

// Panel GUI Emote/Animation standby. Auto-kirim sekali kalau belum ada.
async function setupGuiSpoofPanel(client) {
  if (!GUISPOOF_CHANNEL_ID) return
  const channel = await client.channels.fetch(GUISPOOF_CHANNEL_ID).catch(() => null)
  if (!channel) return
  const messages = await channel.messages.fetch({ limit: 20 }).catch(() => null)
  const existing = messages?.find(m => m.author.id === client.user.id && m.embeds.some(e => e.title?.includes('GUI Emote')))
  if (existing) return
  await channel.send(buildGuiPanel()).catch(() => {})
}

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
      setupJasaWebsite(client),
      setupJasaTanya(client),
      setupWebInfoPanel(client),
      setupToolkitPanel(client),
      setupTCMobilePanel(client),
      setupGuiSpoofPanel(client),
      setupChangelog(client),
      setupExeMobileChangelog(client),
    ])
  },
}
