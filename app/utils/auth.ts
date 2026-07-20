export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('auth');
    if (!raw) return null;
    const { token, expiresAt } = JSON.parse(raw);
    if (!token || Date.now() > expiresAt) {
      localStorage.removeItem('auth');
      localStorage.removeItem('adminToken');
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function clearAdminAuth() {
  localStorage.removeItem('auth');
  localStorage.removeItem('adminToken');
}
