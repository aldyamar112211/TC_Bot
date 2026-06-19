import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

export default {
  name: 'guildMemberAdd',
  async execute(member) {
    try {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('Selamat datang di Terakhir Community!')
        .setDescription(`Hai ${member}, sebelum mulai pilih gender kamu dulu ya.\n\nIni buat nampilin role di profil aja, ga ada efek lain.`)
        .setFooter({ text: 'Terakhir Community — Built To Be The Last' })

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('role_male').setLabel('Male').setStyle(ButtonStyle.Primary).setEmoji('👦'),
        new ButtonBuilder().setCustomId('role_female').setLabel('Female').setStyle(ButtonStyle.Danger).setEmoji('👧'),
      )

      await member.send({ embeds: [embed], components: [row] }).catch(() => {})
    } catch {}
  },
}
