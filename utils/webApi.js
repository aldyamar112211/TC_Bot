import jwt from 'jsonwebtoken'

function generateAdminToken() {
  return jwt.sign(
    { email: process.env.ADMIN_EMAIL || 'bot@terakhircommunity.com', role: 'admin' },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: '1h' }
  )
}

export async function acceptOrder(orderId) {
  const token = generateAdminToken()
  const res = await fetch(`${process.env.SITE_URL}/api/admin/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ orderId, acceptedBy: 'TC_Bot (Discord)' }),
  })
  return res.json()
}

export async function rejectOrder(orderId, reason) {
  const token = generateAdminToken()
  const res = await fetch(`${process.env.SITE_URL}/api/admin/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ orderId, reason }),
  })
  return res.json()
}
