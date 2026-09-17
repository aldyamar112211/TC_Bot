import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

// Panel stand-by TC Mobile di channel download. Sama arsitekturnya seperti
// TC-Toolkit (tombol Link, tidak butuh interaction handler), cuma sumber
// binary-nya nanti dari GitHub Release repo private (bukan Google Drive),
// karena APK bisa lebih besar & GitHub Release lebih stabil buat file besar.

export const TCMOBILE_CHANNEL_ID = process.env.TCMOBILE_CHANNEL_ID || '1522880036443787304'
export const TCMOBILE_DOWNLOAD_URL = process.env.TCMOBILE_DOWNLOAD_URL || ''
export const TCMOBILE_WEB_URL = process.env.TCMOBILE_WEB_URL || 'https://terakhircommunity.com/tc-mobile'

export function buildTCMobilePanel() {
  const isLive = !!TCMOBILE_DOWNLOAD_URL

  const embed = new EmbedBuilder()
    .setColor(0xff1f3d)
    .setTitle('📱 TC Mobile — Aplikasi Android')
    .setDescription(
      isLive
        ? 'Aplikasi Android resmi Terakhir Community. Tools, giveaway, race board, dan nerfus ' +
          'top up, semua bisa diakses langsung dari HP kamu.\n\n' +
          '**Cara install:**\n' +
          '1. Download file APK lewat tombol di bawah.\n' +
          '2. Buka file-nya, izinkan install dari sumber tidak dikenal kalau diminta.\n' +
          '3. Selesai, TC Mobile siap dipakai.'
        : '🚧 TC Mobile masih dalam tahap pengembangan, belum resmi rilis.\n\n' +
          'Pantau channel ini buat info kapan download-nya dibuka.'
    )
    .setFooter({ text: 'Terakhir Community — terakhircommunity.com' })

  const buttons = []
  if (isLive) {
    buttons.push(new ButtonBuilder().setLabel('Download TC Mobile').setStyle(ButtonStyle.Link).setEmoji('⬇️').setURL(TCMOBILE_DOWNLOAD_URL))
  }
  buttons.push(new ButtonBuilder().setLabel('Info Selengkapnya').setStyle(ButtonStyle.Link).setEmoji('📖').setURL(TCMOBILE_WEB_URL))

  return { embeds: [embed], components: buttons.length ? [new ActionRowBuilder().addComponents(buttons)] : [] }
}

export default {
  data: new SlashCommandBuilder()
    .setName('tcmobile-panel')
    .setDescription('Kirim/refresh panel download TC Mobile ke channel-nya')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const channel = await interaction.client.channels.fetch(TCMOBILE_CHANNEL_ID).catch(() => null)
    if (!channel) return interaction.reply({ content: 'Channel TC Mobile tidak ditemukan. Cek TCMOBILE_CHANNEL_ID.', ephemeral: true })
    await channel.send(buildTCMobilePanel())
    await interaction.reply({ content: `Panel TC Mobile terkirim (status: ${TCMOBILE_DOWNLOAD_URL ? 'live' : 'coming soon'}).`, ephemeral: true })
  },
}
