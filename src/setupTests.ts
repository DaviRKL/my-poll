import '@testing-library/jest-dom'

// Compatibilidade global entre Jest e Vitest
type GlobalWithTestUtils = typeof globalThis & { jest?: unknown; vi?: unknown }
const g = globalThis as GlobalWithTestUtils
if (typeof g.jest === 'undefined' && typeof g.vi !== 'undefined') {
  g.jest = g.vi
}

// Mock global de window.matchMedia (necessário para componentes como o ThemeToggle)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock global de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})
