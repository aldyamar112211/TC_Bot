import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js'
import { createClient } from '@supabase/supabase-js'

// Umumkan pemenang giveaway (baca dari Supabase giveaway_entries winner_rank 1-3).
// Butuh ENV: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY, dan channel target.
const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }
const PRIZES = { 1: '1000 Robux', 2: '700 Robux', 3: '500 Robux' }

export default {
  data: new SlashCommandBuilder()
    .setName('giveaway-winner')
    .setDescription('Umumkan pemenang giveaway Robux ke channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return interaction.editReply('ENV Supabase belum diset.')

    const sb = createClient(url, key)
    const { data, error } = await sb
      .from('giveaway_entries')
      .select('display_name, roblox_username, winner_rank')
      .not('winner_rank', 'is', null)
      .order('winner_rank', { ascending: true })

    if (error) return interaction.editReply('Gagal ambil data: ' + error.message)
    if (!data || data.length === 0) return interaction.editReply('Belum ada pemenang. Undi dulu di admin app.')

    const lines = data.map((w) => `${MEDALS[w.winner_rank] || ''} **Juara ${w.winner_rank}** — ${w.display_name} (@${w.roblox_username}) · ${PRIZES[w.winner_rank] || ''}`)

    const embed = new EmbedBuilder()
      .setColor(0xff1f3d)
      .setTitle('🎉 Pemenang Giveaway Robux TC')
      .setDescription(lines.join('\n\n'))
      .setFooter({ text: 'Terakhir Community · #TopUpNerfusBersamaTC' })
      .setTimestamp()

    const channelId = process.env.GIVEAWAY_CHANNEL_ID || process.env.ANNOUNCEMENT_CHANNEL_ID
    const channel = channelId ? await interaction.client.channels.fetch(channelId).catch(() => null) : interaction.channel
    const target = channel || interaction.channel

    await target.send({ content: '@everyone Selamat buat pemenang giveaway! 🎊', embeds: [embed], allowedMentions: { parse: ['everyone'] } })
    await interaction.editReply('Pemenang udah diumumkan di ' + (target?.toString?.() || 'channel') + '.')
  },
}
