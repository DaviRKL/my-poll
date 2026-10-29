import type { Meta, StoryObj } from '@storybook/react'
import { Calendar, Search } from 'lucide-react'
import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Texto da etiqueta associada ao campo',
    },
    placeholder: {
      control: 'text',
      description: 'Texto de orientação do placeholder',
    },
    error: {
      control: 'text',
      description: 'Mensagem de validação de erro',
    },
    helperText: {
      control: 'text',
      description: 'Texto auxiliar exibido abaixo do campo',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado desabilitado do campo',
    },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: 'Opção 1',
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Titulo',
    placeholder: 'Digite aqui a sua pergunta',
  },
}

export const WithDateAndIcon: Story = {
  args: {
    label: 'Data de início',
    type: 'datetime-local',
    rightIcon: <Calendar size={18} />,
  },
}

export const WithSearchIcon: Story = {
  args: {
    placeholder: 'Procurar enquetes...',
    rightIcon: <Search size={18} />,
  },
}

export const WithError: Story = {
  args: {
    label: 'Título da Enquete',
    placeholder: 'Digite a pergunta',
    value: '',
    error: 'O título da enquete é obrigatório.',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Campo Desativado',
    placeholder: 'Não é possível editar este campo',
    disabled: true,
  },
}
