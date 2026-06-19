import { AttachmentBuilder } from 'discord.js'
import { generateGoodbyeCard } from '../utils/generateCard.js'

export default {
  name: 'guildMemberRemove',
  async execute(member) {
    const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID)
    if (!channel) return

    const buffer = await generateGoodbyeCard(member)
    const attachment = new AttachmentBuilder(buffer, { name: 'goodbye.png' })

    await channel.send({ files: [attachment] })
  },
}
