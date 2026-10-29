import type { Meta, StoryObj } from '@storybook/react'
import { PollCard } from './PollCard'

const meta: Meta<typeof PollCard> = {
  title: 'Components/PollCard',
  component: PollCard,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Título ou pergunta da enquete',
    },
    startDate: {
      control: 'text',
      description: 'Data de início formatada',
    },
    endDate: {
      control: 'text',
      description: 'Data de término formatada',
    },
    onClick: {
      action: 'clicked',
      description: 'Função invocada ao clicar no card',
    },
  },
}

export default meta
type Story = StoryObj<typeof PollCard>

export const Default: Story = {
  args: {
    title: 'Qual o melhor framework frontend?',
    startDate: '21/05/2022 - 19:30 hrs',
    endDate: '22/05/2022 - 19:30 hrs',
  },
}

export const LongTitle: Story = {
  args: {
    title:
      'Qual linguagem de programação você considera mais adequada para construir microsserviços modernos e escaláveis em 2026?',
    startDate: '01/01/2026 - 00:00 hrs',
    endDate: '31/12/2026 - 23:59 hrs',
  },
}

export const Interactive: Story = {
  args: {
    title: 'Qual a sua biblioteca de estado predileta em React?',
    startDate: '10/06/2026 - 10:00 hrs',
    endDate: '20/06/2026 - 18:00 hrs',
    onClick: () => alert('Navegar para os detalhes da enquete'),
  },
}
