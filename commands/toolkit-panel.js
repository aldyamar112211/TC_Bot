import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

// Panel stand-by TC-Toolkit di channel download.
// Tombol Link (bukan interaksi) -> langsung buka URL, ga butuh handler.

export const TOOLKIT_CHANNEL_ID = process.env.TOOLKIT_CHANNEL_ID || ''

// Link download TC-Toolkit.zip (Google Drive, set di ENV).
// Format share Drive biasa otomatis diubah jadi direct-download.
function driveDirect(url) {
  if (!url) return ''
  // ambil file id dari format /file/d/<id>/... atau ?id=<id>
  const m = url.match(/\/d\/([\w-]+)/) || url.match(/[?&]id=([\w-]+)/)
  if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`
  return url // udah direct / format lain, pakai apa adanya
}

export const TOOLKIT_DOWNLOAD_URL = driveDirect(process.env.TOOLKIT_DOWNLOAD_URL || '')
export const TOOLKIT_PLUGIN_URL = process.env.TOOLKIT_PLUGIN_URL || ''
export const TOOLKIT_TUTORIAL_URL = process.env.TOOLKIT_TUTORIAL_URL || 'https://terakhircommunity.com/tools/anim-spoof'

export function buildToolkitPanel() {
  const embed = new EmbedBuilder()
    .setColor(0xff1f3d)
    .setTitle('🧰 TC-Toolkit — Aplikasi Desktop')
    .setDescription(
      'Perkakas desktop Terakhir Community buat developer Roblox.\n\n' +
      '**Fitur Anim Spoof:** ambil animasi atau emote Roblox (termasuk yang ga bisa lewat web) jadi file, ' +
      'lalu upload ulang ke akunmu sendiri lewat web TC.\n\n' +
      '**Cara pakai singkat:**\n' +
      '1. Download dan ekstrak TC-Toolkit, lalu buka.\n' +
      '2. Pasang plugin **TC Anim Spoof** di Roblox Studio.\n' +
      '3. Tempel link/ID animasi di plugin, kirim ke TC-Toolkit.\n' +
      '4. Drag file hasilnya ke web **Auto Spoof Animasi** buat upload.\n\n' +
      '⚠️ Pakai buat animasi milik sendiri / yang kamu punya izinnya. Tanggung jawab ada di kamu sebagai pengguna.'
    )
    .setFooter({ text: 'Terakhir Community — terakhircommunity.com' })

  const buttons = []
  if (TOOLKIT_DOWNLOAD_URL) {
    buttons.push(new ButtonBuilder().setLabel('Download TC-Toolkit').setStyle(ButtonStyle.Link).setEmoji('⬇️').setURL(TOOLKIT_DOWNLOAD_URL))
  }
  if (TOOLKIT_PLUGIN_URL) {
    buttons.push(new ButtonBuilder().setLabel('Plugin Studio').setStyle(ButtonStyle.Link).setEmoji('🧩').setURL(TOOLKIT_PLUGIN_URL))
  }
  buttons.push(new ButtonBuilder().setLabel('Tutorial').setStyle(ButtonStyle.Link).setEmoji('📖').setURL(TOOLKIT_TUTORIAL_URL))

  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(buttons)] }
}

export default {
  data: new SlashCommandBuilder()
    .setName('toolkit-panel')
    .setDescription('Kirim/refresh panel download TC-Toolkit ke channel-nya')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const channel = await interaction.client.channels.fetch(TOOLKIT_CHANNEL_ID).catch(() => null)
    if (!channel) return interaction.reply({ content: 'Channel TC-Toolkit tidak ditemukan. Cek TOOLKIT_CHANNEL_ID.', ephemeral: true })
    if (!TOOLKIT_DOWNLOAD_URL) {
      await interaction.reply({ content: 'Catatan: TOOLKIT_DOWNLOAD_URL belum di-set, tombol download ga muncul. Tetap kirim panelnya.', ephemeral: true })
    }
    await channel.send(buildToolkitPanel())
    if (TOOLKIT_DOWNLOAD_URL) await interaction.reply({ content: 'Panel TC-Toolkit terkirim.', ephemeral: true })
  },
}
