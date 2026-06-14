const { createCanvas, loadImage } = require('@napi-rs/canvas')

async function generateWelcomeCard(member, isLeave = false) {
  const canvas = createCanvas(800, 250)
  const ctx = canvas.getContext('2d')

  // Background gelap
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Border merah gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
  gradient.addColorStop(0, '#8b0000')
  gradient.addColorStop(0.5, '#cc0000')
  gradient.addColorStop(1, '#8b0000')
  ctx.strokeStyle = gradient
  ctx.lineWidth = 4
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4)

  // Avatar bulat
  try {
    const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 })
    const avatar = await loadImage(avatarUrl)
    ctx.save()
    ctx.beginPath()
    ctx.arc(125, 125, 85, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(avatar, 40, 40, 170, 170)
    ctx.restore()

    // Ring avatar
    ctx.beginPath()
    ctx.arc(125, 125, 87, 0, Math.PI * 2)
    ctx.strokeStyle = isLeave ? '#666666' : '#cc0000'
    ctx.lineWidth = 4
    ctx.stroke()
  } catch {}

  // Teks
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 28px Sans'
  ctx.fillText(isLeave ? 'Sampai Jumpa!' : 'Selamat Datang!', 250, 90)

  ctx.fillStyle = '#cc0000'
  ctx.font = 'bold 32px Sans'
  const username = member.user.username.length > 18
    ? member.user.username.slice(0, 18) + '...'
    : member.user.username
  ctx.fillText(username, 250, 135)

  ctx.fillStyle = '#aaaaaa'
  ctx.font = '22px Sans'
  if (isLeave) {
    ctx.fillText('Semoga ketemu lagi 👋', 250, 175)
  } else {
    const memberCount = member.guild.memberCount
    ctx.fillText(`Member ke-${memberCount} di Terakhir Community`, 250, 175)
  }

  return canvas.toBuffer('image/png')
}

module.exports = { generateWelcomeCard }
