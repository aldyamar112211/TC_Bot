import { createClient } from '@supabase/supabase-js'
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

function toUnixSeconds(iso) {
  if (!iso) return null
  const ms = new Date(iso).getTime()
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null
}

async function sendRaceNotif(client, post) {
  const channelId = process.env.RACE_CHANNEL_ID
  if (!channelId) return
  const channel = await client.channels.fetch(channelId).catch(() => null)
  if (!channel) return

  const unix = toUnixSeconds(post.event_at)
  const siteUrl = process.env.SITE_URL || 'https://terakhircommunity.com'

  const embed = new EmbedBuilder()
    .setTitle(`🏁 Race Baru: ${post.title}`)
    .setColor(0xff1f3d)
    .addFields(
      { name: 'Diposting oleh', value: post.display_name || 'User', inline: true },
      { name: 'Status', value: post.status || 'Open', inline: true },
    )
    .setTimestamp()
    .setFooter({ text: 'Terakhir Community · Race Board' })

  if (unix) embed.addFields({ name: 'Mulai', value: `<t:${unix}:F>\nCountdown: <t:${unix}:R>` })
  if (post.description) embed.addFields({ name: 'Deskripsi', value: post.description.slice(0, 500) })
  embed.addFields({ name: 'Link Map', value: post.map_link })
  if (post.server_link) embed.addFields({ name: 'Private Server', value: post.server_link })
  if (post.caster) embed.addFields({ name: 'Caster', value: post.tiktok_link ? `${post.caster} (${post.tiktok_link})` : post.caster, inline: true })
  if (post.discord_link) embed.addFields({ name: 'Discord Race', value: post.discord_link, inline: true })

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Post Race Kamu Sekarang').setStyle(ButtonStyle.Link).setEmoji('🏁').setURL(`${siteUrl}/race`),
  )

  await channel.send({ embeds: [embed], components: [row] }).catch(() => {})
}

function watchRacePosts(client) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.log('SUPABASE_URL/SUPABASE_SERVICE_KEY belum diset, race notif nonaktif.')
    return
  }
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

  supabase
    .channel('race-posts-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'race_posts' }, (payload) => {
      sendRaceNotif(client, payload.new)
    })
    .subscribe((status) => {
      console.log('Race posts realtime status:', status)
    })
}

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    watchRacePosts(client)
  },
}
