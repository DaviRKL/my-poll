import type { Meta, StoryObj } from '@storybook/react'
import { Plus, Check, Trash2 } from 'lucide-react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
      description: 'Variante visual do botão',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Dimensão do botão',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Se o botão deve ocupar 100% da largura do contentor',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado desabilitado',
    },
    children: {
      control: 'text',
      description: 'Conteúdo textual ou elementos internos',
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Votar',
    fullWidth: false,
    disabled: false,
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Resultados',
    fullWidth: false,
    disabled: false,
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Adicionar opção',
    leftIcon: <Plus size={16} />,
    fullWidth: false,
    disabled: false,
  },
}

export const FullWidth: Story = {
  args: {
    variant: 'primary',
    children: 'Criar enquete',
    fullWidth: true,
    size: 'lg',
  },
}

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Ação Desabilitada',
    disabled: true,
  },
}

export const WithIcons: Story = {
  args: {
    variant: 'primary',
    children: 'Confirmar Voto',
    leftIcon: <Check size={16} />,
  },
}

export const SmallWithIcon: Story = {
  args: {
    variant: 'outline',
    size: 'sm',
    children: 'Remover',
    leftIcon: <Trash2 size={14} />,
  },
}
