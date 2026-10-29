import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input Component', () => {
  it('renderiza o input com o placeholder especificado', () => {
    render(<Input placeholder="Digite o seu nome" />)
    expect(screen.getByPlaceholderText('Digite o seu nome')).toBeInTheDocument()
  })

  it('renderiza a label fornecida associada ao campo', () => {
    render(<Input label="Título da Enquete" placeholder="Digite aqui" />)
    const label = screen.getByText('Título da Enquete')
    expect(label).toBeInTheDocument()

    // O input deve ser acessível pelo nome da label
    const input = screen.getByLabelText('Título da Enquete')
    expect(input).toBeInTheDocument()
  })

  it('permite a digitação pelo utilizador atualizando o valor', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Pergunta" />)

    const input = screen.getByPlaceholderText('Pergunta') as HTMLInputElement
    expect(input.value).toBe('')

    await user.type(input, 'Qual seu framework favorito?')
    expect(input.value).toBe('Qual seu framework favorito?')
  })

  it('renderiza a mensagem de erro quando fornecida', () => {
    render(<Input label="Campo Obrigatório" error="Este campo não pode ficar vazio" />)
    expect(screen.getByText('Este campo não pode ficar vazio')).toBeInTheDocument()
  })

  it('permanece desabilitado quando a prop disabled é passada', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Desativado" disabled />)

    const input = screen.getByPlaceholderText('Desativado') as HTMLInputElement
    expect(input).toBeDisabled()

    await user.type(input, 'Teste')
    expect(input.value).toBe('')
  })
})
