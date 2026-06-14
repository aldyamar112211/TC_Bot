const { AttachmentBuilder } = require('discord.js')
const { generateWelcomeCard } = require('../utils/welcomeCard')

async function handleGuildMemberAdd(member) {
  const channel = member.guild.channels.cache.get(process.env.WELCOME_LEAVE_CHANNEL_ID)
  if (!channel) return

  try {
    const card = await generateWelcomeCard(member, false)
    const attachment = new AttachmentBuilder(card, { name: 'welcome.png' })

    await channel.send({
      content: `Selamat datang ${member}! Baca rules dulu ya 👀`,
      files: [attachment],
    })
  } catch (err) {
    console.error('Welcome card error:', err)
    await channel.send(`Selamat datang ${member} di **Terakhir Community**! 🎉`)
  }
}

module.exports = { handleGuildMemberAdd }
