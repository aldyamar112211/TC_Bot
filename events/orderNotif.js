const { createClient } = require('@supabase/supabase-js')
const { EmbedBuilder } = require('discord.js')

function watchOrders(client) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  supabase
    .channel('orders-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
      sendOrderNotif(client, payload.new, 'new')
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
      if (payload.new.status === 'accepted' && payload.old.status === 'pending') {
        sendOrderNotif(client, payload.new, 'accepted')
      }
    })
    .subscribe((status) => {
      console.log('Supabase realtime status:', status)
    })
}

async function sendOrderNotif(client, order, type) {
  const channel = client.channels.cache.get(process.env.ORDER_CHANNEL_ID)
  if (!channel) return

  const embed = new EmbedBuilder()

  if (type === 'new') {
    embed
      .setTitle('📦 Order Baru Masuk!')
      .setColor(0xcc0000)
      .addFields(
        { name: 'Item', value: order.item_name || '-', inline: true },
        { name: 'Buyer', value: order.buyer_name || '-', inline: true },
        { name: 'Roblox', value: order.roblox_username || '-', inline: true },
        { name: 'Pembayaran', value: order.payment_method || '-', inline: true },
        { name: 'Status', value: '⏳ Pending', inline: true },
      )
      .setTimestamp()
      .setFooter({ text: `Order ID: ${order.id}` })
  } else {
    embed
      .setTitle('✅ Order Selesai!')
      .setColor(0x00cc44)
      .addFields(
        { name: 'Item', value: order.item_name || '-', inline: true },
        { name: 'Buyer', value: order.buyer_name || '-', inline: true },
        { name: 'Diterima oleh', value: order.accepted_by || 'Admin', inline: true },
      )
      .setTimestamp()
      .setFooter({ text: `Order ID: ${order.id}` })
  }

  await channel.send({ embeds: [embed] }).catch(console.error)
}

module.exports = { watchOrders }
