import { expect, test, type APIRequestContext } from '@playwright/test'

// Each test creates its own drop through the API, so it never depends on the demo data
// or on what another test did. /api is forwarded to the API by nginx.
async function createDrop(request: APIRequestContext, label: string, stock: number) {
  const response = await request.post('/api/drops', {
    data: {
      product: `E2E ${label} ${Date.now()}`,
      price_cents: 18000,
      stock,
      opens_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
  })
  expect(response.status()).toBe(201)
  return (await response.json()) as { id: number }
}

test('commander décrémente le stock', async ({ page, request }) => {
  const drop = await createDrop(request, 'stock', 5)

  await page.goto(`/drops/${drop.id}`)
  await expect(page.getByTestId('remaining')).toHaveText('5 / 5 paires restantes')

  await page.getByRole('button', { name: 'Commander' }).click()

  await expect(page.getByTestId('remaining')).toHaveText('4 / 5 paires restantes')
})

test('un drop épuisé désactive le bouton', async ({ page, request }) => {
  const drop = await createDrop(request, 'sold-out', 1)
  const order = await request.post(`/api/drops/${drop.id}/orders`)
  expect(order.status()).toBe(201)

  await page.goto(`/drops/${drop.id}`)

  await expect(page.getByRole('button', { name: 'Épuisé' })).toBeDisabled()
})