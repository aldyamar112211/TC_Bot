import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

GlobalFonts.registerFromPath(join(__dirname, '../fonts/Poppins-Bold.ttf'), 'Poppins')
GlobalFonts.registerFromPath(join(__dirname, '../fonts/Poppins-Regular.ttf'), 'PoppinsRegular')

async function generateCard({ bgPath, avatarURL, topLabel, username, subText, accentColor, glowColor }) {
  const W = 1200
  const H = 400
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  // Background
  const bg = await loadImage(bgPath)
  ctx.drawImage(bg, 0, 0, W, H)

  // Overlay gelap
  ctx.fillStyle = 'rgba(0,0,0,0.62)'
  ctx.fillRect(0, 0, W, H)

  // === TEKS DULU sebelum avatar ===
  const textX = 500
  const midY = H / 2

  ctx.textAlign = 'left'
  ctx.shadowColor = 'rgba(0,0,0,1)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2

  // Top label
  ctx.font = 'bold 20px Poppins'
  ctx.fillStyle = accentColor
  ctx.fillText(topLabel.toUpperCase(), textX, midY - 65)

  // Garis aksen
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
  ctx.fillStyle = accentColor
  ctx.fillRect(textX, midY - 52, 50, 3)

  ctx.shadowColor = 'rgba(0,0,0,1)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2

  // Username
  let fs = 58
  ctx.font = `bold ${fs}px Poppins`
  while (ctx.measureText(username).width > W - textX - 40 && fs > 28) {
    fs -= 2
    ctx.font = `bold ${fs}px Poppins`
  }
  ctx.fillStyle = '#ffffff'
  ctx.fillText(username, textX, midY + 10)

  // Sub text
  ctx.font = 'bold 22px Poppins'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText(subText, textX, midY + 50)

  // Branding
  ctx.shadowBlur = 0
  ctx.font = 'bold 15px Poppins'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillText('TERAKHIR COMMUNITY', textX, midY + 88)

  // === AVATAR SETELAH TEKS ===
  const avatarSize = 180
  const avatarX = 210
  const avatarY = H / 2

  // Glow
  const glowGrad = ctx.createRadialGradient(avatarX, avatarY, avatarSize / 2, avatarX, avatarY, avatarSize)
  glowGrad.addColorStop(0, glowColor)
  glowGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glowGrad
  ctx.beginPath()
  ctx.arc(avatarX, avatarY, avatarSize, 0, Math.PI * 2)
  ctx.fill()

  // Ring
  ctx.beginPath()
  ctx.arc(avatarX, avatarY, avatarSize / 2 + 6, 0, Math.PI * 2)
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 4
  ctx.stroke()

  // Avatar
  ctx.save()
  try {
    const avatar = await loadImage(avatarURL)
    ctx.beginPath()
    ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(avatar, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize)
  } catch {}
  ctx.restore()

  // Tambah border tipis biar Discord render sebagai gambar biasa
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, W - 2, H - 2)

  return canvas.toBuffer('image/png')
}

export async function generateWelcomeCard(member, memberCount) {
  return generateCard({
    bgPath: join(__dirname, '../assets/wellcome.png'),
    avatarURL: member.user.displayAvatarURL({ extension: 'png', size: 256, forceStatic: true }),
    topLabel: 'SELAMAT DATANG',
    username: `@${member.user.username}`,
    subText: `Member ke #${memberCount}`,
    accentColor: '#e74c3c',
    glowColor: 'rgba(231,76,60,0.7)',
  })
}

export async function generateGoodbyeCard(member) {
  return generateCard({
    bgPath: join(__dirname, '../assets/godbye.png'),
    avatarURL: member.user.displayAvatarURL({ extension: 'png', size: 256, forceStatic: true }),
    topLabel: 'SAMPAI JUMPA',
    username: `@${member.user.username}`,
    subText: 'Semoga sukses di luar sana',
    accentColor: '#888888',
    glowColor: 'rgba(136,136,136,0.5)',
  })
}

export async function generateWarningCard(user) {
  return generateCard({
    bgPath: join(__dirname, '../assets/warning.png'),
    avatarURL: user.displayAvatarURL({ extension: 'png', size: 256, forceStatic: true }),
    topLabel: '[!] PERINGATAN KEAMANAN',
    username: `@${user.username}`,
    subText: 'Akun ini diduga diretas. Jangan klik link apapun!',
    accentColor: '#e74c3c',
    glowColor: 'rgba(231,76,60,0.8)',
  })
}
