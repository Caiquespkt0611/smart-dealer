export type Theme = 'dark' | 'light'

export function getThemeFromStorage(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('smart-dealer-theme')
  return (stored as Theme) || 'dark'
}

export function saveThemeToStorage(theme: Theme) {
  if (typeof window === 'undefined') return
  localStorage.setItem('smart-dealer-theme', theme)
}

export function toggleTheme(current: Theme): Theme {
  return current === 'dark' ? 'light' : 'dark'
}
