import { SlashCommandBuilder } from 'discord.js'
import { sendTicketTranscript, cancelTicketTimer } from './ticket.js'

export default {
  data: new SlashCommandBuilder()
    .setName('tutuptiket')
    .setDescription('Tutup dan hapus tiket ini'),

  async execute(interaction) {
    if (!interaction.channel.name.startsWith('tiket-')) {
      await interaction.reply({ content: 'Command ini hanya bisa dipakai di channel tiket.', ephemeral: true })
      return
    }

    cancelTicketTimer(interaction.channel.id)
    await interaction.reply({ content: 'Menutup tiket dalam 5 detik...' })
    await sendTicketTranscript(interaction.channel, interaction.user)
    setTimeout(() => interaction.channel.delete().catch(() => {}), 5000)
  },
}
