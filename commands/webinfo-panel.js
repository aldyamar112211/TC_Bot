import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js'
import { CATEGORIES, pagesByCat } from '../data/webInfo.js'

export const WEBINFO_CHANNEL_ID = process.env.WEBINFO_CHANNEL_ID || '1521204717458555031'

// Bangun panel. 9 kategori > limit 5 dropdown/pesan, jadi dipecah jadi beberapa pesan.
// Return: array of message payload (dikirim berurutan).
export function buildWebInfoMessages() {
  // 1 dropdown per kategori yang ada isinya
  const rows = []
  for (const cat of CATEGORIES) {
    const pages = pagesByCat(cat.id)
    if (!pages.length) continue
    const menu = new StringSelectMenuBuilder()
      .setCustomId(`webinfo:${cat.id}`)
      .setPlaceholder(`${cat.emoji} ${cat.label} (${pages.length})`)
      .addOptions(pages.slice(0, 25).map(p => ({
        label: p.name.slice(0, 100),
        value: p.id,
        description: (p.fungsi || '').slice(0, 100),
        emoji: p.emoji || undefined,
      })))
    rows.push(new ActionRowBuilder().addComponents(menu))
  }

  const messages = []
  // Pesan pertama: embed header + maks 5 dropdown
  const headerEmbed = new EmbedBuilder()
    .setColor(0xff1f3d)
    .setTitle('📖 Web Information — Terakhir Community')
    .setDescription(
      'Bingung suatu halaman atau tool di website TC buat apa dan gimana cara pakainya?\n\n' +
      'Pilih halaman dari menu di bawah (dikelompokin per kategori). Bot bakal jelasin fungsi, cara pakai, syarat, dan catatannya. Balasannya cuma kamu yang lihat, dan otomatis ganti tiap kamu pilih menu lain.'
    )
    .setFooter({ text: 'Terakhir Community — terakhircommunity.com' })

  const first = rows.slice(0, 5)
  const rest = rows.slice(5)

  messages.push({ embeds: [headerEmbed], components: first })
  if (rest.length) {
    // pesan kedua buat sisa dropdown (tanpa embed besar)
    messages.push({ content: '​', components: rest })
  }
  return messages
}

export default {
  data: new SlashCommandBuilder()
    .setName('webinfo-panel')
    .setDescription('Kirim/refresh panel Web Information ke channel-nya')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const channel = await interaction.client.channels.fetch(WEBINFO_CHANNEL_ID).catch(() => null)
    if (!channel) return interaction.reply({ content: 'Channel Web Information tidak ditemukan. Cek WEBINFO_CHANNEL_ID.', ephemeral: true })

    for (const msg of buildWebInfoMessages()) {
      await channel.send(msg)
    }
    await interaction.reply({ content: '✅ Panel Web Information berhasil dikirim.', ephemeral: true })
  },
}
