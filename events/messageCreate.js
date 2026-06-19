import { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js'
import { generateWarningCard } from '../utils/generateCard.js'
import { isScamImage } from '../utils/scamHash.js'

const LOG_CHANNEL_ID = '1409225485493207228'
const TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID

const SCAM_PATTERNS = [
  /casino/i, /crypto\s*casino/i, /withdraw/i, /withdrawal/i,
  /promo\s*code/i, /claim\s*your/i, /register\s*now/i,
  /free\s*\$\d+/i, /giving\s*away\s*\$\d+/i, /\$\d+.*bonus/i,
  /rakeback/i, /vip.club/i,
  /discord\.gift\/[a-zA-Z0-9]+/i,
  /steamcommunity\.(?!com)/i,
  /nitro\s*free/i, /free\s*nitro/i,
  /airdrop/i,
  /will\s*be\s*deleted\s*(in\s*)?\d+\s*hour/i,
  /this\s*post\s*will\s*be\s*deleted/i,
  /limited\s*time\s*offer/i,
]

const SCAM_DOMAINS = [
  'foekax', 'dlscord', 'discorcl', 'disocrd', 'discrod',
  'steamcomunity', 'steampowerd', 'csgofast', 'csgobig',
  'crypto-gift', 'free-robux', 'nitro-gift',
]

function isScamText(content) {
  if (!content) return false
  for (const pattern of SCAM_PATTERNS) {
    if (pattern.test(content)) return true
  }
  const lower = content.toLowerCase()
  for (const domain of SCAM_DOMAINS) {
    if (lower.includes(domain)) return true
  }
  return false
}

function isForwardWithMedia(message) {
  // Forward via Discord forward button
  if (message.messageSnapshots?.size > 0) return true
  // Forward manual: ada attachment/embed tapi ga ada teks
  const hasMedia = message.attachments.size > 0 || message.embeds.length > 0
  const noText = !message.content || message.content.trim() === ''
  return hasMedia && noText
}

function isTicketChannel(message) {
  if (!TICKET_CATEGORY_ID) return false
  return message.channel.parentId === TICKET_CATEGORY_ID
}

function hasPaymentProof(message) {
  if (message.attachments.size === 0) return false
  const imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
  return [...message.attachments.values()].some(a => imageTypes.includes(a.contentType))
}

async function handleScam(message, client, reason) {
  const scamContent = message.content || '[gambar/forward tanpa teks]'
  const username = message.author.tag
  const channelName = message.channel.name

  await message.delete().catch(() => {})

  const warningBuffer = await generateWarningCard(message.author).catch(() => null)
  if (warningBuffer) {
    const attachment = new AttachmentBuilder(warningBuffer, { name: 'warning.png' })
    await message.channel.send({
      content: `@everyone ${message.author} — Akun ini diduga diretas. Jangan klik link apapun dari akun ini.`,
      files: [attachment],
    }).catch(() => {})
  } else {
    await message.channel.send(
      `@everyone ${message.author} — Akun ini diduga diretas. Jangan klik link apapun dari akun ini.`
    ).catch(() => {})
  }

  try {
    await message.member.timeout(10 * 60 * 1000, 'Auto-timeout: terdeteksi konten scam/phishing')
  } catch {}

  const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null)
  if (!logChannel) return

  const embed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle('Konten Scam Terdeteksi')
    .addFields(
      { name: 'User', value: `${message.author} (${username})`, inline: true },
      { name: 'Channel', value: `#${channelName}`, inline: true },
      { name: 'Alasan', value: reason, inline: false },
      { name: 'Isi Pesan', value: scamContent.slice(0, 1024) },
    )
    .setTimestamp()

  await logChannel.send({ embeds: [embed] })
}

async function handlePaymentProof(message, client) {
  const attachment = [...message.attachments.values()][0]

  const embed = new EmbedBuilder()
    .setColor(0xf39c12)
    .setTitle('Bukti Transfer Diterima')
    .setDescription(`${message.author} mengirim bukti pembayaran.\n\nModerator, silakan cek dan konfirmasi order.`)
    .setImage(attachment.url)
    .addFields(
      { name: 'User', value: `${message.author} (${message.author.tag})`, inline: true },
      { name: 'Channel', value: `${message.channel}`, inline: true },
    )
    .setFooter({ text: 'Masukkan Order ID dari website TC untuk memproses' })
    .setTimestamp()

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`order_accept_prompt:${message.author.id}:${message.channel.id}`)
      .setLabel('Accept Order')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅'),
    new ButtonBuilder()
      .setCustomId(`order_reject_prompt:${message.author.id}:${message.channel.id}`)
      .setLabel('Reject Order')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('❌'),
  )

  await message.reply({
    embeds: [embed],
    components: [row],
  })
}

export default {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return
    if (!message.guild) return

    // Cek bukti transfer di channel tiket
    if (isTicketChannel(message) && hasPaymentProof(message)) {
      await handlePaymentProof(message, client)
      return
    }

    if (isScamText(message.content)) {
      await handleScam(message, client, 'Teks mengandung pola scam')
      return
    }

    // Cek gambar scam via pHash
    if (message.attachments.size > 0) {
      const imageAttachments = [...message.attachments.values()].filter(a =>
        a.contentType && a.contentType.startsWith('image/')
      )
      for (const att of imageAttachments) {
        const match = await isScamImage(att.url)
        if (match) {
          await handleScam(message, client, 'Gambar mirip konten scam yang sudah diidentifikasi')
          return
        }
      }
    }

    if (isForwardWithMedia(message)) {
      await handleScam(message, client, 'Forward pesan dengan media tanpa teks')
      return
    }
  },
}
