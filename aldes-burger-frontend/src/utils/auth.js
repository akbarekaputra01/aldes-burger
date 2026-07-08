const TOKEN_KEY = 'aldes_token'
const USER_KEY = 'aldes_user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setAuthSession = ({ token, user }) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  
  // 🔥 Memicu CartContext agar langsung memuat keranjang milik user baru ini
  window.dispatchEvent(new Event('aldes_auth_sync'))
}

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  
  // 🔥 Memicu CartContext agar langsung mengosongkan layar ke state guest/guest cart
  window.dispatchEvent(new Event('aldes_auth_sync'))
}

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}