/**
 * @jest-environment node
 */
import { renderToString } from 'react-dom/server'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle server rendering', () => {
  it('defaults to light mode when no browser window is available', () => {
    expect(renderToString(<ThemeToggle />)).toContain(
      'aria-label="Mudar para o modo escuro"',
    )
  })
})
