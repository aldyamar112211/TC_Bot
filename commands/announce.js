import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Kirim pengumuman ke channel announcement')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(o => o.setName('judul').setDescription('Judul pengumuman').setRequired(true))
    .addStringOption(o => o.setName('isi').setDescription('Isi pengumuman').setRequired(true))
    .addBooleanOption(o => o.setName('ping').setDescription('Ping @everyone?').setRequired(false))
    .addAttachmentOption(o => o.setName('gambar').setDescription('Gambar untuk pengumuman (opsional)').setRequired(false)),

  async execute(interaction) {
    const judul = interaction.options.getString('judul')
    const isi = interaction.options.getString('isi')
    const ping = interaction.options.getBoolean('ping') ?? false
    const gambar = interaction.options.getAttachment('gambar')

    const channel = await interaction.client.channels.fetch(process.env.ANNOUNCEMENT_CHANNEL_ID).catch(() => null)
    if (!channel) return interaction.reply({ content: 'Channel announcement tidak ditemukan.', ephemeral: true })

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle(`📢 ${judul}`)
      .setDescription(isi)
      .setFooter({ text: `Terakhir Community — diposting oleh ${interaction.user.username}` })
      .setTimestamp()

    if (gambar) embed.setImage(gambar.url)

    await channel.send({ content: ping ? '@everyone' : '', embeds: [embed] })
    await interaction.reply({ content: 'Pengumuman berhasil dikirim.', ephemeral: true })
  },
}
