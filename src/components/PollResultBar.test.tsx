import { render, screen } from '@testing-library/react'
import { PollResultBar } from './PollResultBar'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
  }),
}))

describe('PollResultBar', () => {
  it('renders the label, vote count, and accessible percentage bar', () => {
    render(<PollResultBar label="Option A" votes={1} percentage={42} />)

    expect(screen.getByText('Option A')).toBeInTheDocument()
    expect(screen.getByText('1 voto')).toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', {
        name: 'Option A: 1 voto (42%)',
      }),
    ).toHaveAttribute('aria-valuenow', '42')
    expect(screen.getByRole('progressbar').firstChild).toHaveStyle({
      width: '42%',
    })
  })

  it('uses the plural vote label and clamps percentages to the valid range', () => {
    const { rerender } = render(
      <PollResultBar label="Option B" votes={3} percentage={140} />,
    )

    expect(screen.getByText('3 votos')).toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: 'Option B: 3 votos (100%)' }),
    ).toHaveAttribute('aria-valuenow', '100')
    expect(screen.getByRole('progressbar').firstChild).toHaveStyle({
      width: '100%',
    })

    rerender(<PollResultBar label="Option B" votes={0} percentage={-5} />)
    expect(
      screen.getByRole('progressbar', { name: 'Option B: 0 votos (0%)' }),
    ).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByRole('progressbar').firstChild).toHaveStyle({
      width: '0%',
    })
  })
})
