import { setupStripeGuard, teardownStripeGuard } from './setup/stripe-guard'
import { setupStripeMock, teardownStripeMock } from './setup/stripe-mock'

export const setup = async () => {
  await setupStripeMock()
  setupStripeGuard()
}

export const teardown = async () => {
  await teardownStripeMock()
  teardownStripeGuard()
}
