import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { Drop } from '../api'
import { makeDrop } from '../test/fixtures'
import { DropCard } from './DropCard'

// DropCard contains a link: it needs a router around it.
function renderCard(drop: Drop) {
  return render(
    <MemoryRouter>
      <DropCard drop={drop} />
    </MemoryRouter>,
  )
}

describe('DropCard', () => {
  it('shows the product, a link to its page, the price and the remaining stock', () => {
    renderCard(makeDrop({ id: 3, price_cents: 18000, stock: 100, remaining: 42 }))

    expect(screen.getByRole('link', { name: 'Air Max 1 « Laval »' })).toHaveAttribute(
      'href',
      '/drops/3',
    )
    // The space before « € » is a non-breaking space: \s matches it.
    expect(screen.getByText(/^180,00\s€$/)).toBeInTheDocument()
    expect(screen.getByText('42 / 100 paires restantes')).toBeInTheDocument()
  })

  it.each([
    ['upcoming', 'À venir'],
    ['live', 'En vente'],
    ['sold_out', 'Épuisé'],
  ] as const)('shows the "%s" status as « %s »', (status, label) => {
    renderCard(makeDrop({ status }))

    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('shows the countdown only for an upcoming drop', () => {
    const future = '2100-01-01T09:00:00Z'
    const { unmount } = renderCard(makeDrop({ status: 'upcoming', opens_at: future }))
    expect(screen.getByText(/Ouverture dans/)).toBeInTheDocument()
    unmount()

    renderCard(makeDrop({ status: 'live', opens_at: future }))
    expect(screen.queryByText(/Ouverture dans/)).not.toBeInTheDocument()
  })
})
