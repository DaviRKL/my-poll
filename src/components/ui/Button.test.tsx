import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button Component', () => {
  it('renderiza corretamente o texto dos children', () => {
    render(<Button>Clique aqui</Button>)
    expect(screen.getByRole('button', { name: /clique aqui/i })).toBeInTheDocument()
  })

  it('aplica as classes de estilo para a variante "primary" por padrão', () => {
    render(<Button>Primário</Button>)
    const button = screen.getByRole('button', { name: /primário/i })
    expect(button).toHaveClass('bg-primary-500')
    expect(button).toHaveClass('text-white')
  })

  it('aplica as classes de estilo correspondentes à variante "secondary"', () => {
    render(<Button variant="secondary">Secundário</Button>)
    const button = screen.getByRole('button', { name: /secundário/i })
    expect(button).toHaveClass('bg-neutral-600')
    expect(button).toHaveClass('text-white')
  })

  it('aplica as classes de estilo correspondentes à variante "outline"', () => {
    render(<Button variant="outline">Contorno</Button>)
    const button = screen.getByRole('button', { name: /contorno/i })
    expect(button).toHaveClass('border-primary-500')
    expect(button).toHaveClass('text-primary-500')
  })

  it('aplica a classe "w-full" quando fullWidth for verdadeiro', () => {
    render(<Button fullWidth>Largura Completa</Button>)
    const button = screen.getByRole('button', { name: /largura completa/i })
    expect(button).toHaveClass('w-full')
  })

  it('dispara o evento onClick adequadamente quando clicado', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    render(<Button onClick={handleClick}>Ação</Button>)
    const button = screen.getByRole('button', { name: /ação/i })

    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('não dispara o evento onClick quando estiver desabilitado', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    render(
      <Button disabled onClick={handleClick}>
        Desabilitado
      </Button>,
    )
    const button = screen.getByRole('button', { name: /desabilitado/i })
    expect(button).toBeDisabled()

    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })
})
