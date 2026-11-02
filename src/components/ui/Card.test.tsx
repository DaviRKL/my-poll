import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('renders children and forwards HTML attributes and ref', () => {
    const cardRef = jest.fn()
    render(
      <Card ref={cardRef} data-testid="content-card" title="Card title">
        <span>Card content</span>
      </Card>,
    )

    expect(screen.getByText('Card content')).toBeInTheDocument()
    expect(screen.getByTestId('content-card')).toHaveAttribute(
      'title',
      'Card title',
    )
    expect(cardRef).toHaveBeenCalledWith(screen.getByTestId('content-card'))
  })
})
