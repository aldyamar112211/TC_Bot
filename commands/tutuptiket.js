import { SlashCommandBuilder } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('tutuptiket')
    .setDescription('Tutup dan hapus tiket ini'),

  async execute(interaction) {
    if (!interaction.channel.name.startsWith('tiket-')) {
      await interaction.reply({ content: 'Command ini hanya bisa dipakai di channel tiket.', ephemeral: true })
      return
    }

    await interaction.reply({ content: 'Menutup tiket dalam 5 detik...' })
    setTimeout(() => interaction.channel.delete().catch(() => {}), 5000)
  },
}
