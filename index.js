require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js')
const { handleGuildMemberAdd } = require('./events/welcome')
const { handleGuildMemberRemove } = require('./events/leave')
const { watchOrders } = require('./events/orderNotif')
const { sendTicketPanel, handleTicketOpen, handleTicketClose, handleCaraOrder, handleHubungiAdmin, resetAutoClose } = require('./events/ticket')

const TICKET_PANEL_CHANNEL_ID = '1515842576165638295'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
  ],
})

client.once('ready', async () => {
  console.log(`TC_Bot online sebagai ${client.user.tag}`)
  watchOrders(client)

  const ticketChannel = client.channels.cache.get(TICKET_PANEL_CHANNEL_ID)
  if (ticketChannel) {
    const messages = await ticketChannel.messages.fetch({ limit: 10 })
    const alreadySent = messages.some(
      (m) => m.author.id === client.user.id && m.components.length > 0
    )
    if (!alreadySent) {
      await sendTicketPanel(ticketChannel)
      console.log('Panel tiket dikirim.')
    } else {
      console.log('Panel tiket sudah ada, skip.')
    }
  }
})

client.on('guildMemberAdd', (member) => handleGuildMemberAdd(member))
client.on('guildMemberRemove', (member) => handleGuildMemberRemove(member))

client.on('messageCreate', (message) => {
  if (message.author.bot) return
  if (message.channel.topic?.startsWith('ticket-')) {
    resetAutoClose(message.channel)
  }
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return
  if (interaction.customId === 'ticket_open') await handleTicketOpen(interaction)
  else if (interaction.customId === 'ticket_close') await handleTicketClose(interaction)
  else if (interaction.customId === 'ticket_cara_order') await handleCaraOrder(interaction)
  else if (interaction.customId === 'ticket_hubungi_admin') await handleHubungiAdmin(interaction)
})

client.login(process.env.DISCORD_TOKEN)
