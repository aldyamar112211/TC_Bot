import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const GUI_SCRIPT_PATH = join(__dirname, '..', 'assets', 'TC_EmoteGui.lua')
export const GUISPOOF_CHANNEL_ID = process.env.GUISPOOF_CHANNEL_ID || '1521557423314174042'

export function buildGuiPanel() {
  const embed = new EmbedBuilder()
    .setColor(0xff1f3d)
    .setTitle('🎬 GUI Emote & Animation')
    .setDescription(
      'Mau GUI in-game buat nampilin daftar animasi sama emote kamu, lengkap sama tombol play? ' +
      'Klik tombol di bawah, nanti bot kasih Command Bar script-nya.\n\n' +
      '**Cara pakai:**\n' +
      '1. Klik **Ambil GUI Script**, download file `TC_EmoteGui.lua`.\n' +
      '2. Buka file-nya, copy semua isinya.\n' +
      '3. Di Roblox Studio buka **View > Command Bar**.\n' +
      '4. Paste, terus Enter.\n' +
      '5. GUI `TC_EmoteGui` muncul di StarterGui. Masuk Play buat nyobain.\n\n' +
      '**Syarat:** animasi kamu ada di `ReplicatedStorage > TerakhirCommunity > Animation` atau `Emote` ' +
      '(otomatis kebuat dari tool Auto Spoof Animasi).'
    )
    .setFooter({ text: 'Terakhir Community' })

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('guispoof_get').setLabel('Ambil GUI Script').setStyle(ButtonStyle.Primary).setEmoji('🎬'),
  )

  return { embeds: [embed], components: [row] }
}

// Dipanggil dari interactionCreate pas tombol diklik.
export async function handleGuiSpoofButton(interaction) {
  const file = new AttachmentBuilder(GUI_SCRIPT_PATH, { name: 'TC_EmoteGui.lua' })
  await interaction.reply({
    content: `<@${interaction.user.id}> nih GUI-nya, semoga membantu 🙏\nCopy isinya, paste di Command Bar Studio, Enter.`,
    files: [file],
    ephemeral: true,
  })
}
