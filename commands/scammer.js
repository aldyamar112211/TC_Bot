import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('scammer')
    .setDescription('Kirim peringatan scammer ke channel announcement')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption(o => o.setName('pelaku').setDescription('User yang scam (di-tag)').setRequired(true))
    .addAttachmentOption(o => o.setName('bukti').setDescription('Screenshot bukti scam').setRequired(true))
    .addAttachmentOption(o => o.setName('bukti2').setDescription('Bukti tambahan (opsional)').setRequired(false))
    .addAttachmentOption(o => o.setName('bukti3').setDescription('Bukti tambahan (opsional)').setRequired(false))
    .addAttachmentOption(o => o.setName('bukti4').setDescription('Bukti tambahan (opsional)').setRequired(false))
    .addAttachmentOption(o => o.setName('bukti5').setDescription('Bukti tambahan (opsional)').setRequired(false))
    .addUserOption(o => o.setName('reporter').setDescription('Yang ngelaporin (dikasih kredit)').setRequired(false))
    .addStringOption(o => o.setName('detail').setDescription('Info tambahan / modus scam-nya').setRequired(false))
    .addBooleanOption(o => o.setName('ping_everyone').setDescription('Ping @everyone? (default: ya). Set false buat tes').setRequired(false))
    .addBooleanOption(o => o.setName('ping_pelaku').setDescription('Tag/ping pelaku? (default: ya). Set false buat tes').setRequired(false))
    .addBooleanOption(o => o.setName('ping_reporter').setDescription('Tag/ping reporter? (default: ya). Set false buat tes').setRequired(false)),

  async execute(interaction) {
    const pelaku   = interaction.options.getUser('pelaku')
    const reporter = interaction.options.getUser('reporter')
    const detail   = interaction.options.getString('detail')
    const pingEveryone = interaction.options.getBoolean('ping_everyone') ?? true
    const pingPelaku   = interaction.options.getBoolean('ping_pelaku') ?? true
    const pingReporter = interaction.options.getBoolean('ping_reporter') ?? true

    // Kumpulin semua bukti yang diisi (flex: 1 sampai 5 gambar)
    const buktiList = ['bukti', 'bukti2', 'bukti3', 'bukti4', 'bukti5']
      .map(n => interaction.options.getAttachment(n))
      .filter(Boolean)

    // Semua harus gambar
    if (buktiList.some(b => !b.contentType?.startsWith('image/'))) {
      return interaction.reply({ content: 'Semua bukti harus berupa gambar (PNG/JPG).', ephemeral: true })
    }

    const channel = await interaction.client.channels.fetch(process.env.ANNOUNCEMENT_CHANNEL_ID).catch(() => null)
    if (!channel) return interaction.reply({ content: 'Channel announcement tidak ditemukan.', ephemeral: true })

    const desc =
      `Halo semuanya, mohon dibaca sebentar ya. Ada laporan dari sesama member soal dugaan scammer di server kita. ` +
      `Daripada ada yang kena, mending aku infoin biar kalian lebih hati-hati.\n\n` +
      `**Orang yang dilaporkan:** ${pelaku} \`${pelaku.tag}\`\n` +
      `**ID:** ${pelaku.id}` +
      (detail ? `\n\n**Modus / kronologi:**\n${detail}` : '') +
      (reporter ? `\n\n**Laporan dari:** ${reporter} — makasih udah ngasih tau ya.` : '') +
      `\n\n**Catatan penting:** info ini berdasarkan laporan member, jadi belum tentu 100% akurat. ` +
      `Bisa aja ada salah paham. Tolong jangan main hakim sendiri, anggap ini buat jaga-jaga aja.\n\n` +
      `Kalau mau transaksi, pakai middleman/rekber terpercaya dan cek dulu baik-baik sebelum kirim apa pun. ` +
      `Kalau kalian punya bukti lain atau ngerasa ini keliru, langsung DM admin aja biar kami tindak lanjuti.\n\n` +
      `Tetap aman, tetap waspada. Makasih.`

    // Trik galeri Discord: beberapa embed dgn URL sama digrup jadi 1 galeri gambar.
    const GALLERY_URL = 'https://terakhircommunity.com'
    const embeds = []

    // Embed utama: teks peringatan + gambar bukti pertama
    embeds.push(
      new EmbedBuilder()
        .setColor(0xe74c3c)
        .setURL(GALLERY_URL)
        .setTitle('⚠️ Peringatan: Dugaan Scammer')
        .setDescription(desc)
        .setImage(buktiList[0].url)
        .setFooter({ text: `Terakhir Community — diposting oleh ${interaction.user.username}` })
        .setTimestamp()
    )
    // Bukti tambahan: embed gambar saja (URL sama → nempel jadi galeri)
    for (let i = 1; i < buktiList.length; i++) {
      embeds.push(new EmbedBuilder().setURL(GALLERY_URL).setImage(buktiList[i].url))
    }

    // Bangun mention di luar embed (embed ga bisa ngeping).
    // Tiap toggle bisa dimatiin buat tes (biar ga ngeping beneran).
    const pingParts = []
    if (pingEveryone) pingParts.push('@everyone')
    if (pingPelaku) pingParts.push(`${pelaku}`)
    if (pingReporter && reporter) pingParts.push(`${reporter}`)

    // allowedMentions cuma izinin yang di-toggle on (anti ping nyasar pas tes)
    const allowParse = []
    if (pingEveryone) allowParse.push('everyone')
    if (pingPelaku || pingReporter) allowParse.push('users')

    await channel.send({
      content: pingParts.join(' ') || null,
      embeds,
      allowedMentions: { parse: allowParse },
    })

    await interaction.reply({ content: `✅ Peringatan scammer dikirim (${buktiList.length} gambar).`, ephemeral: true })
  },
}
