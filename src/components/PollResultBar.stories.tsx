import type { Meta, StoryObj } from '@storybook/react'
import { PollResultBar } from './PollResultBar'

const meta: Meta<typeof PollResultBar> = {
  title: 'Components/PollResultBar',
  component: PollResultBar,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Nome da opção da enquete',
    },
    votes: {
      control: 'number',
      description: 'Contagem total de votos recebidos',
    },
    percentage: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Percentual relativo de votos (0 a 100)',
    },
  },
}

export default meta
type Story = StoryObj<typeof PollResultBar>

export const ZeroPercent: Story = {
  args: {
    label: 'Angular',
    votes: 0,
    percentage: 0,
  },
}

export const FiftyPercent: Story = {
  args: {
    label: 'Vue.js',
    votes: 11,
    percentage: 50,
  },
}

export const FullHundredPercent: Story = {
  args: {
    label: 'React',
    votes: 30,
    percentage: 100,
  },
}

export const SingleVote: Story = {
  args: {
    label: 'Svelte',
    votes: 1,
    percentage: 5,
  },
}

export const HighPercentage: Story = {
  args: {
    label: 'Next.js',
    votes: 42,
    percentage: 78,
  },
}
