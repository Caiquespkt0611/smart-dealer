'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Theme, getThemeFromStorage, saveThemeToStorage, toggleTheme as toggle } from '@/lib/theme'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = getThemeFromStorage()
    setTheme(stored)
    setMounted(true)
    document.documentElement.setAttribute('data-theme', stored)
  }, [])

  const toggleTheme = () => {
    const newTheme = toggle(theme)
    setTheme(newTheme)
    saveThemeToStorage(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  if (!mounted) return <>{children}</>

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  }
  return context
}
