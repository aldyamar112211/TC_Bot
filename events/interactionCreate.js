import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js'
import {
  handleTicketButton, handleCloseTicket, handleJasaStart, handleJasaSubmit,
  handleJasaHarga, handleJasaTanya, handleJasaPaket, handleJasaOk, handleJasaEli5,
  handleJasaCalc, handleJasaCalcUpdate, handleJasaStaff, handleJasaFaq, handleJasaCaraKerja,
} from '../commands/ticket.js'
import { acceptOrder, rejectOrder } from '../utils/webApi.js'
import { getPage, pagesByCat } from '../data/webInfo.js'
import { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js'

const OWNER_ID = '732584744474247172'
const KRITIK_CHANNEL_ID = '1409224631298166982'

const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID
const ROLE_MALE_NAME = 'Male'
const ROLE_FEMALE_NAME = 'Female'

function isModerator(member) {
  return member.permissions.has(PermissionFlagsBits.ModerateMembers)
}

async function handleRoleSelect(interaction, gender) {
  const guild = interaction.guild
  const member = interaction.member

  const roleName = gender === 'male' ? ROLE_MALE_NAME : ROLE_FEMALE_NAME
  const oppositeName = gender === 'male' ? ROLE_FEMALE_NAME : ROLE_MALE_NAME

  let role = guild.roles.cache.find(r => r.name === roleName)
  if (!role) {
    role = await guild.roles.create({ name: roleName, reason: 'Auto-created by TC_Bot' })
  }

  const oppositeRole = guild.roles.cache.find(r => r.name === oppositeName)
  if (oppositeRole && member.roles.cache.has(oppositeRole.id)) {
    await member.roles.remove(oppositeRole).catch(() => {})
  }

  if (member.roles.cache.has(role.id)) {
    return interaction.reply({ content: `Kamu udah punya role **${roleName}**.`, ephemeral: true })
  }

  await member.roles.add(role)
  await interaction.reply({ content: `Role **${roleName}** berhasil ditambahkan!`, ephemeral: true })
}

async function handleReportBug(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_report_bug')
    .setTitle('Laporkan Bug')

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_location').setLabel('Di mana bug-nya?').setStyle(TextInputStyle.Short).setPlaceholder('Contoh: Mount Fein, halaman store, dsb').setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_desc').setLabel('Apa yang terjadi?').setStyle(TextInputStyle.Paragraph).setPlaceholder('Jelaskan bug dengan detail').setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_reproduce').setLabel('Cara reproduce (langkah-langkah)').setStyle(TextInputStyle.Paragraph).setRequired(false)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_evidence').setLabel('Link bukti (screenshot/video)').setStyle(TextInputStyle.Short).setRequired(false)
    ),
  )

  await interaction.showModal(modal)
}

async function handleReportCheater(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_report_cheater')
    .setTitle('Laporkan Cheater')

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('cheater_username').setLabel('Username Roblox pelaku').setStyle(TextInputStyle.Short).setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('cheater_map').setLabel('Map/game tempat kejadian').setStyle(TextInputStyle.Short).setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('cheater_desc').setLabel('Jenis kecurangan yang dilakukan').setStyle(TextInputStyle.Paragraph).setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('cheater_evidence').setLabel('Link bukti (wajib)').setStyle(TextInputStyle.Short).setRequired(true)
    ),
  )

  await interaction.showModal(modal)
}

async function handleSuggestion(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_suggestion')
    .setTitle('Kirim Saran')

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('suggestion_title').setLabel('Judul saran').setStyle(TextInputStyle.Short).setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('suggestion_desc').setLabel('Jelaskan saranmu').setStyle(TextInputStyle.Paragraph).setRequired(true)
    ),
  )

  await interaction.showModal(modal)
}

async function handleOrderAcceptPrompt(interaction, userId, channelId) {
  if (!isModerator(interaction.member)) {
    return interaction.reply({ content: 'Hanya moderator yang bisa mengkonfirmasi order.', ephemeral: true })
  }

  const modal = new ModalBuilder()
    .setCustomId(`modal_order_accept:${userId}:${channelId}`)
    .setTitle('Konfirmasi Order')

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('order_id')
        .setLabel('Order ID (dari website TC)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Contoh: abc123-xxxx-xxxx')
        .setRequired(true)
    ),
  )

  await interaction.showModal(modal)
}

async function handleOrderRejectPrompt(interaction, userId, channelId) {
  if (!isModerator(interaction.member)) {
    return interaction.reply({ content: 'Hanya moderator yang bisa menolak order.', ephemeral: true })
  }

  const modal = new ModalBuilder()
    .setCustomId(`modal_order_reject:${userId}:${channelId}`)
    .setTitle('Tolak Order')

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('order_id')
        .setLabel('Order ID (dari website TC)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('reject_reason')
        .setLabel('Alasan penolakan')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
    ),
  )

  await interaction.showModal(modal)
}

async function handleFaqCaraBeli(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('💳 Panduan Cara Beli & Konfirmasi')
    .setDescription(
      `Untuk melakukan pembelian produk **Terakhir Community**:\n\n` +
      `1. Buka website resmi: **[terakhircommunity.com/store](https://terakhircommunity.com/store)** dan lakukan checkout.\n` +
      `2. Lakukan transfer pembayaran sesuai metode berikut:\n` +
      `   * **DANA:** \`089652254719\` (a.n. Aldy Amar Al Firdaus)\n` +
      `   * **GoPay:** \`0895401381703\` (a.n. Aldy Amar Al Firdaus)\n` +
      `   * **Trakteer (Luar Negeri):** [trakteer.id/aldy_amar_al_firdaus](https://trakteer.id/aldy_amar_al_firdaus)\n` +
      `3. **Kirim foto/screenshot Bukti Transfer** kamu di channel tiket ini.\n` +
      `4. Masukkan **Order ID** kamu di sini agar admin bisa mengonfirmasi pembelianmu dan mengirimkan link download secara otomatis.`
    )
    .setTimestamp()

  await interaction.reply({ embeds: [embed] })
}

async function handleFaqDaftarHarga(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('🛒 Daftar Harga Aset & Paket Hemat')
    .setDescription(
      `Berikut rincian harga produk yang tersedia di **Terakhir Community**:\n\n` +
      `💰 **Produk Satuan:**\n` +
      `* **Rasengan Ability System:** Rp 85.000\n` +
      `* **Blackhole Coil System:** Rp 65.000\n` +
      `* **Hammer Coil:** Rp 50.000\n` +
      `* **SummitKit System V2.2:** *(Silakan cek harga & detail langsung di website)*\n\n` +
      `🎁 **Paket Hemat (Bundle Deal):**\n` +
      `* **Rasengan + Blackhole:** Rp 135.000 *(Hemat Rp 15.000)*\n` +
      `* **Rasengan + Hammer:** Rp 120.000 *(Hemat Rp 15.000)*\n` +
      `* **Blackhole + Hammer:** Rp 100.000 *(Hemat Rp 15.000)*\n` +
      `* **Take All Deal (3 Coil):** Rp 185.000 *(Hemat Rp 15.000)*`
    )
    .setTimestamp()

  await interaction.reply({ embeds: [embed] })
}

async function handleFaqSetupSummit(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0xe67e22)
    .setTitle('⚙️ Panduan Setup & Migrasi SummitKit')
    .setDescription(
      `Berikut langkah-langkah dasar setup **SummitKit System V2.2**:\n\n` +
      `1. **Unduh Berkas:** Setelah pembelian dikonfirmasi, kamu akan menerima link download (Readme, MainContent, Dependencies Audio, Animasi, dan Video Tutorial).\n` +
      `2. **Backup & Deploy:** Backup konfigurasi lamamu, lalu pasang V2.2 ke environment staging.\n` +
      `3. **TC_Config:** Sesuaikan file \`TC_Config\` (terutama nama datastore dan pengaturan save debounce).\n` +
      `4. **Tes & Uji:** Uji coba masuk/keluar game, penyimpanan data, leaderboard, dan lakukan stress test.\n\n` +
      `*Jika kamu mengalami kendala atau menemukan error, silakan kirimkan screenshot output / error log Roblox Studio kamu di chat tiket ini agar kami bisa bantu analisis.*`
    )
    .setTimestamp()

  await interaction.reply({ embeds: [embed] })
}

async function handleFaqHubungiAdmin(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('📞 Hubungi Admin (Slow Response)')
    .setDescription(
      `Admin saat ini sedang offline atau sedang slow response.\n\n` +
      `Jangan khawatir, kamu bisa meninggalkan pesan yang berisi:\n` +
      `1. Pertanyaan atau detail kendala yang kamu alami secara jelas.\n` +
      `2. Screenshot/bukti pendukung (jika ada).\n\n` +
      `Admin akan langsung membaca dan menjawab pesanmu begitu online kembali!`
    )
    .setTimestamp()

  await interaction.reply({ embeds: [embed] })
}

// Web Information: user pilih halaman dari dropdown, balas penjelasan (ephemeral).
// Auto-dismiss: balasan bawa dropdown kategori yang sama, jadi kalau user pilih
// halaman lain di situ, pesannya di-UPDATE (nimpa diri sendiri, ga numpuk).
async function handleWebInfoSelect(interaction) {
  const catId = interaction.customId.split(':')[1] // webinfo:<cat>
  const page = getPage(interaction.values[0])
  if (!page) {
    return interaction.reply({ content: 'Halaman tidak ditemukan.', ephemeral: true })
  }

  const embed = new EmbedBuilder()
    .setColor(0xff1f3d)
    .setTitle(`${page.emoji || '📄'} ${page.name}`)
    .setDescription(page.fungsi)

  if (page.cara?.length) embed.addFields({ name: '📝 Cara Pakai', value: page.cara.map((s, i) => `${i + 1}. ${s}`).join('\n').slice(0, 1024) })
  if (page.syarat) embed.addFields({ name: '✅ Syarat', value: page.syarat.slice(0, 1024) })
  if (page.disclaimer) embed.addFields({ name: '⚠️ Catatan Penting', value: page.disclaimer.slice(0, 1024) })
  embed.setFooter({ text: 'Terakhir Community' })

  // Dropdown kategori yang sama, ditaruh di balasan biar bisa ganti halaman tanpa numpuk
  const pages = pagesByCat(catId)
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`webinfo:${catId}`)
    .setPlaceholder('Pilih halaman lain di kategori ini...')
    .addOptions(pages.slice(0, 25).map(p => ({
      label: p.name.slice(0, 100), value: p.id,
      description: (p.fungsi || '').slice(0, 100), emoji: p.emoji || undefined,
      default: p.id === page.id,
    })))

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('🌐 Buka Halaman').setStyle(ButtonStyle.Link).setURL(page.url || 'https://terakhircommunity.com'),
    new ButtonBuilder().setLabel('💬 Hubungi Staff').setStyle(ButtonStyle.Link).setURL(`https://discord.com/users/${OWNER_ID}`),
    new ButtonBuilder().setLabel('✍️ Kritik & Saran').setStyle(ButtonStyle.Link).setURL(`https://discord.com/channels/${interaction.guildId}/${KRITIK_CHANNEL_ID}`),
  )

  const payload = { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu), buttons], ephemeral: true }

  // Deteksi asal interaksi:
  // - Dari PANEL publik (pesan punya banyak komponen / nggak ada embed penjelasan) -> reply ephemeral baru
  // - Dari BALASAN ephemeral kita (ada embed) -> update biar nimpa diri sendiri (anti numpuk)
  const fromOwnReply = (interaction.message?.embeds?.length || 0) > 0 && (interaction.message?.components?.length || 0) === 2
  if (fromOwnReply) {
    await interaction.update({ embeds: payload.embeds, components: payload.components }).catch(() => {})
  } else {
    await interaction.reply(payload)
  }
}

async function handleModalSubmit(interaction, client) {
  const id = interaction.customId
  const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null)

  if (id === 'modal_jasa') {
    await handleJasaSubmit(interaction)
    return
  }

  if (id === 'modal_report_bug') {
    const location = interaction.fields.getTextInputValue('bug_location')
    const desc = interaction.fields.getTextInputValue('bug_desc')
    const reproduce = interaction.fields.getTextInputValue('bug_reproduce') || 'Tidak disertakan'
    const evidence = interaction.fields.getTextInputValue('bug_evidence') || 'Tidak ada'

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle('🐛 Bug Report Baru')
      .addFields(
        { name: 'Pelapor', value: `${interaction.user}`, inline: true },
        { name: 'Lokasi', value: location, inline: true },
        { name: 'Deskripsi', value: desc },
        { name: 'Cara Reproduce', value: reproduce },
        { name: 'Bukti', value: evidence },
      )
      .setTimestamp()

    await interaction.reply({ content: 'Laporan bug kamu sudah diterima. Tim admin akan segera mengecek.', ephemeral: true })
    if (logChannel) await logChannel.send({ embeds: [embed] })
  }

  if (id === 'modal_report_cheater') {
    const username = interaction.fields.getTextInputValue('cheater_username')
    const map = interaction.fields.getTextInputValue('cheater_map')
    const desc = interaction.fields.getTextInputValue('cheater_desc')
    const evidence = interaction.fields.getTextInputValue('cheater_evidence')

    const embed = new EmbedBuilder()
      .setColor(0x8e44ad)
      .setTitle('🚨 Cheater Report Baru')
      .addFields(
        { name: 'Pelapor', value: `${interaction.user}`, inline: true },
        { name: 'Username Pelaku', value: username, inline: true },
        { name: 'Map/Game', value: map, inline: true },
        { name: 'Kecurangan', value: desc },
        { name: 'Bukti', value: evidence },
      )
      .setTimestamp()

    await interaction.reply({ content: 'Laporan kamu sudah diterima. Admin akan menindaklanjuti secepatnya.', ephemeral: true })
    if (logChannel) await logChannel.send({ embeds: [embed] })
  }

  if (id === 'modal_suggestion') {
    const title = interaction.fields.getTextInputValue('suggestion_title')
    const desc = interaction.fields.getTextInputValue('suggestion_desc')

    const embed = new EmbedBuilder()
      .setColor(0x27ae60)
      .setTitle(`💡 ${title}`)
      .setDescription(desc)
      .setFooter({ text: `Dari ${interaction.user.username}` })
      .setTimestamp()

    await interaction.reply({ content: 'Saran kamu sudah masuk. Makasih udah peduli dengan TC!', ephemeral: true })

    const suggChannel = await client.channels.fetch(process.env.SUGGESTION_CHANNEL_ID).catch(() => null)
    if (suggChannel) {
      const msg = await suggChannel.send({ embeds: [embed] })
      await msg.react('👍')
      await msg.react('👎')
    }
    if (logChannel) await logChannel.send({ embeds: [embed] })
  }

  // Accept order modal
  if (id.startsWith('modal_order_accept:')) {
    const [, userId, channelId] = id.split(':')
    const orderId = interaction.fields.getTextInputValue('order_id').trim()

    await interaction.deferReply({ ephemeral: true })

    const result = await acceptOrder(orderId).catch(e => ({ error: e.message }))

    if (result?.error || !result?.success) {
      return interaction.editReply({ content: `Gagal accept order: ${result?.error || 'Unknown error'}` })
    }

    await interaction.editReply({ content: `Order \`${orderId}\` berhasil di-accept. Email konfirmasi sudah dikirim ke buyer.` })

    const ticketChannel = await client.channels.fetch(channelId).catch(() => null)
    if (ticketChannel) {
      const embed = new EmbedBuilder()
        .setColor(0x27ae60)
        .setTitle('Order Dikonfirmasi')
        .setDescription(`Pembayaran kamu telah dikonfirmasi oleh ${interaction.user}.\n\nCek email untuk link download. Tiket ini akan ditutup otomatis.`)
        .setTimestamp()
      await ticketChannel.send({ embeds: [embed] })
    }

    if (logChannel) {
      await logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x27ae60)
            .setTitle('Order Accepted')
            .addFields(
              { name: 'Order ID', value: orderId, inline: true },
              { name: 'Dikonfirmasi oleh', value: `${interaction.user}`, inline: true },
            )
            .setTimestamp()
        ]
      })
    }
  }

  // Reject order modal
  if (id.startsWith('modal_order_reject:')) {
    const [, userId, channelId] = id.split(':')
    const orderId = interaction.fields.getTextInputValue('order_id').trim()
    const reason = interaction.fields.getTextInputValue('reject_reason').trim()

    await interaction.deferReply({ ephemeral: true })

    const result = await rejectOrder(orderId, reason).catch(e => ({ error: e.message }))

    if (result?.error || !result?.success) {
      return interaction.editReply({ content: `Gagal reject order: ${result?.error || 'Unknown error'}` })
    }

    await interaction.editReply({ content: `Order \`${orderId}\` berhasil di-reject.` })

    const ticketChannel = await client.channels.fetch(channelId).catch(() => null)
    if (ticketChannel) {
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('Order Ditolak')
        .setDescription(`Maaf, pembayaran kamu tidak bisa dikonfirmasi.\n\n**Alasan:** ${reason}\n\nHubungi admin jika ada pertanyaan.`)
        .setTimestamp()
      await ticketChannel.send({ embeds: [embed] })
    }

    if (logChannel) {
      await logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle('Order Rejected')
            .addFields(
              { name: 'Order ID', value: orderId, inline: true },
              { name: 'Ditolak oleh', value: `${interaction.user}`, inline: true },
              { name: 'Alasan', value: reason },
            )
            .setTimestamp()
        ]
      })
    }
  }
}

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName)
      if (!command) return
      try {
        await command.execute(interaction)
      } catch (err) {
        const msg = { content: 'Terjadi error saat menjalankan command.', ephemeral: true }
        if (interaction.replied || interaction.deferred) await interaction.followUp(msg)
        else await interaction.reply(msg)
      }
      return
    }

    if (interaction.isButton()) {
      const customId = interaction.customId

      // Ambil GUI script (panel /guispoof)
      if (customId === 'guispoof_get') {
        const { handleGuiSpoofButton } = await import('../commands/guispoof-panel.js')
        await handleGuiSpoofButton(interaction).catch(() => {})
        return
      }

      // Dynamic button handlers (pakai prefix)
      if (customId.startsWith('order_accept_prompt:')) {
        const [, userId, channelId] = customId.split(':')
        await handleOrderAcceptPrompt(interaction, userId, channelId).catch(() => {})
        return
      }
      if (customId.startsWith('order_reject_prompt:')) {
        const [, userId, channelId] = customId.split(':')
        await handleOrderRejectPrompt(interaction, userId, channelId).catch(() => {})
        return
      }
      // Tombol jasa dinamis (pakai prefix)
      if (customId.startsWith('jasa_pkg:')) {
        await handleJasaPaket(interaction, customId.split(':')[1]).catch(() => {})
        return
      }
      if (customId.startsWith('jasa_ok:')) {
        await handleJasaOk(interaction, customId.split(':')[1]).catch(() => {})
        return
      }
      if (customId.startsWith('jasa_eli5:')) {
        await handleJasaEli5(interaction, customId.split(':')[1]).catch(() => {})
        return
      }

      const handlers = {
        open_ticket: () => handleTicketButton(interaction),
        close_ticket: () => handleCloseTicket(interaction),
        report_bug: () => handleReportBug(interaction),
        report_cheater: () => handleReportCheater(interaction),
        submit_suggestion: () => handleSuggestion(interaction),
        role_male: () => handleRoleSelect(interaction, 'male'),
        role_female: () => handleRoleSelect(interaction, 'female'),
        faq_cara_beli: () => handleFaqCaraBeli(interaction),
        faq_daftar_harga: () => handleFaqDaftarHarga(interaction),
        faq_setup_summit: () => handleFaqSetupSummit(interaction),
        faq_hubungi_admin: () => handleFaqHubungiAdmin(interaction),
        jasa_start: () => handleJasaStart(interaction),
        jasa_tanya: () => handleJasaTanya(interaction),
        jasa_harga: () => handleJasaHarga(interaction),
        jasa_calc: () => handleJasaCalc(interaction),
        jasa_calc_reset: () => handleJasaCalc(interaction),
        jasa_staff: () => handleJasaStaff(interaction),
        jasa_carakerja: () => handleJasaCaraKerja(interaction),
      }
      const handler = handlers[customId]
      if (handler) {
        try {
          await handler()
        } catch (err) {
          const msg = { content: 'Terjadi error: ' + err.message, ephemeral: true }
          if (interaction.replied || interaction.deferred) await interaction.followUp(msg).catch(() => {})
          else await interaction.reply(msg).catch(() => {})
        }
      }
      return
    }

    if (interaction.isStringSelectMenu()) {
      const customId = interaction.customId
      try {
        if (customId === 'jasa_faq') await handleJasaFaq(interaction)
        else if (customId === 'jasa_calc_pages' || customId === 'jasa_calc_feats') await handleJasaCalcUpdate(interaction)
        else if (customId.startsWith('webinfo:')) await handleWebInfoSelect(interaction)
      } catch (err) {
        const msg = { content: 'Terjadi error: ' + err.message, ephemeral: true }
        if (interaction.replied || interaction.deferred) await interaction.followUp(msg).catch(() => {})
        else await interaction.reply(msg).catch(() => {})
      }
      return
    }

    if (interaction.isModalSubmit()) {
      await handleModalSubmit(interaction, client)
    }
  },
}
