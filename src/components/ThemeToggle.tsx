import React, { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '../utils/cn'

export interface ThemeToggleProps {
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme')
      if (stored === 'dark' || stored === 'light') {
        return stored
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return 'light'
  })

  // Aplica a classe 'dark' no elemento raiz (<html>) e guarda no localStorage
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Listener para sincronizar caso a preferência do sistema operacional mude
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === 'dark'
          ? 'Mudar para o modo claro'
          : 'Mudar para o modo escuro'
      }
      title={
        theme === 'dark'
          ? 'Ativar modo claro'
          : 'Ativar modo escuro'
      }
      className={cn(
        'p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer select-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500/50',
        className,
      )}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon size={20} className="text-neutral-600 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  )
}
