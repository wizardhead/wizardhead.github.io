import { useState, useEffect } from 'react'
export default function LightDarkToggle() {
  const [theme, setTheme] = useState(getPreferredTheme())

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <a tabIndex={0} className="light-dark-toggle" onClick={toggleTheme}>
      {theme === 'dark' ? '🌙' : '🌞'}
    </a>
  )
}

const getPreferredTheme = () => {
  // Check localStorage first
  const stored = localStorage.getItem('theme')
  if (stored) return stored
  // Fallback to system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}
