import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import {
  WEB_TIERS,
  WEB_PRICE_GUIDE,
  BUNDLES,
  JASA_WORKFLOW,
  JASA_BIAYA,
  JASA_FREE_VS_PAID,
  JASA_FAQ,
  JASA_DEMO_BASE,
  JASA_WEB_URL,
  formatRupiah,
} from '../config/jasa.js'

const CRIMSON = 0xe74c3c
const DARK = 0x2c2c2c

// Builder embed per topik. Dipanggil command + bisa dipakai ulang.
function buildEmbed(topik) {
  if (topik === 'harga') {
    const tiers = WEB_TIERS.map(t => `**${t.name}** — ${t.tag} · mulai **${formatRupiah(t.startFrom)}**${t.highlight ? ' ⭐' : ''}`).join('\n')
    const bundles = BUNDLES.map(b => `• **${b.name}** — mulai ${formatRupiah(b.startFrom)}`).join('\n')
    return new EmbedBuilder().setColor(DARK).setTitle('💰 Harga & Paket Jasa Website')
      .setDescription(`**📦 Paket (mulai dari):**\n${tiers}\n\n**🎁 Bundle Hemat:**\n${bundles}\n\n*Semua estimasi awal, final nyesuain scope.*`)
      .setFooter({ text: `Lihat lengkap: ${JASA_WEB_URL}` })
  }

  if (topik === 'paket') {
    const lines = WEB_TIERS.map(t =>
      `**${t.name}** (${t.tag}) — mulai ${formatRupiah(t.startFrom)}\n${t.penjelasan.singkat}\nFitur: ${t.features.join(', ')}`,
    ).join('\n\n')
    return new EmbedBuilder().setColor(DARK).setTitle('📦 Detail Tiap Paket')
      .setDescription(lines).setFooter({ text: `Lihat demo tiap paket: ${JASA_DEMO_BASE}/` })
  }

  if (topik === 'cara-kerja') {
    const lines = JASA_WORKFLOW.map(w => `**${w.t}**\n${w.d}`).join('\n\n')
    return new EmbedBuilder().setColor(DARK).setTitle('🛠️ Gimana TC Ngerjain Web Kamu')
      .setDescription(lines).setFooter({ text: 'Terakhir Community — dari ide sampai online' })
  }

  if (topik === 'biaya') {
    const items = JASA_BIAYA.items.map(i => `**${i.t}**\n${i.d}`).join('\n\n')
    return new EmbedBuilder().setColor(DARK).setTitle('💳 Soal Domain, Hosting & Biaya Berjalan')
      .setDescription(`${JASA_BIAYA.intro}\n\n${items}\n\n${JASA_BIAYA.footer}`)
  }

  if (topik === 'free-vs-paid') {
    const blok = (x) =>
      `**${x.nama}**\n` +
      `🆓 Gratis:\n${x.free.map(f => `• ${f}`).join('\n')}\n\n` +
      `💎 Berbayar:\n${x.paid.map(p => `• ${p}`).join('\n')}`
    return new EmbedBuilder().setColor(DARK).setTitle('⚖️ Free vs Berbayar')
      .setDescription(
        `Web kamu jalan di versi gratis dulu, gratis & cukup buat kebanyakan kebutuhan. Kalau nanti rame banget sampai nembus batas, baru kita obrolin upgrade. Jadi nggak bayar lebih sebelum beneran butuh.\n\n` +
        `${blok(JASA_FREE_VS_PAID.hosting)}\n\n${blok(JASA_FREE_VS_PAID.database)}`,
      )
  }

  return null
}

export default {
  data: new SlashCommandBuilder()
    .setName('jasa')
    .setDescription('Kirim info jasa website (buat jawab pertanyaan user cepat)')
    .addStringOption(o =>
      o.setName('topik')
        .setDescription('Pilih info yang mau dikirim')
        .setRequired(true)
        .addChoices(
          { name: 'Harga & Paket', value: 'harga' },
          { name: 'Detail Tiap Paket', value: 'paket' },
          { name: 'Cara Kerja', value: 'cara-kerja' },
          { name: 'Domain, Hosting & Biaya', value: 'biaya' },
          { name: 'Free vs Berbayar', value: 'free-vs-paid' },
          { name: 'FAQ (semua tanya-jawab)', value: 'faq' },
        ),
    )
    .addBooleanOption(o =>
      o.setName('pribadi')
        .setDescription('Cuma kamu yang liat (default: semua bisa liat)')
        .setRequired(false),
    ),

  async execute(interaction) {
    const topik = interaction.options.getString('topik')
    const ephemeral = interaction.options.getBoolean('pribadi') ?? false

    // FAQ dikirim sebagai 1 embed berisi semua Q&A
    if (topik === 'faq') {
      const lines = JASA_FAQ.map(f => `**${f.q}**\n${f.a}`).join('\n\n')
      const embed = new EmbedBuilder().setColor(DARK).setTitle('❓ FAQ Jasa Website')
        .setDescription(lines.length > 4000 ? lines.slice(0, 3990) + '\n…' : lines)
      return interaction.reply({ embeds: [embed], ephemeral })
    }

    const embed = buildEmbed(topik)
    if (!embed) return interaction.reply({ content: 'Topik nggak dikenal.', ephemeral: true })
    await interaction.reply({ embeds: [embed], ephemeral })
  },
}
