import { fireEvent, render, screen } from '@testing-library/react'
import { PollCard } from './PollCard'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
  }),
}))

describe('PollCard', () => {
  it('renders its title and formatted date values', () => {
    render(
      <PollCard
        title="Favorite framework"
        startDate="02/11/2026 - 09:00 hrs"
        endDate="09/11/2026 - 09:00 hrs"
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Favorite framework' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Inicio:/)).toHaveTextContent(
      'Inicio: 02/11/2026 - 09:00 hrs',
    )
    expect(screen.getByText(/Término:/)).toHaveTextContent(
      'Término: 09/11/2026 - 09:00 hrs',
    )
  })

  it('invokes the optional click handler', () => {
    const onClick = jest.fn()
    render(
      <PollCard
        title="Clickable poll"
        startDate="Start"
        endDate="End"
        onClick={onClick}
      />,
    )

    fireEvent.click(screen.getByRole('heading', { name: 'Clickable poll' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
