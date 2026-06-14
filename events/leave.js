const { AttachmentBuilder } = require('discord.js')
const { generateWelcomeCard } = require('../utils/welcomeCard')

async function handleGuildMemberRemove(member) {
  const channel = member.guild.channels.cache.get(process.env.WELCOME_LEAVE_CHANNEL_ID)
  if (!channel) return

  try {
    const card = await generateWelcomeCard(member, true)
    const attachment = new AttachmentBuilder(card, { name: 'leave.png' })

    await channel.send({
      content: `**${member.user.username}** telah meninggalkan server. Sampai jumpa! 👋`,
      files: [attachment],
    })
  } catch (err) {
    console.error('Leave card error:', err)
    await channel.send(`**${member.user.username}** telah meninggalkan server. 👋`)
  }
}

module.exports = { handleGuildMemberRemove }
