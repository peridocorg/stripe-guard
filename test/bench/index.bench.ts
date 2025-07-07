import { Stripe } from 'stripe'
import { bench, describe } from 'vitest'

import { runAssertion } from '../dist'
import {
  createDelayedHttpClient,
  createWorkload,
  getStripeApiRTT,
} from '../utils'

const BENCH_ITERATIONS = 500
const NUMBER = {
  '0%': 0,
  '0.05%': 0.05 / 100,
  '0.1%': 0.1 / 100,
  '0.15%': 0.15 / 100,
}
// we're looking for the cross-over point where the mean time it takes
// with validation is less than without
const TEST_PERCENTAGES = ['0%', '0.05%', '0.1%', '0.15%']
const RTT = Math.min(await getStripeApiRTT(), 100) // treat RTT over 100ms as unrealistic

describe(`Side-by-side Comparison for RTT: ${RTT}ms`, async () => {
  const stripe = new Stripe('sk_test_123', {
    apiVersion: '2025-05-28.basil',
    host: 'localhost',
    port: 12111,
    protocol: 'http',
    httpClient: createDelayedHttpClient(Stripe.createNodeHttpClient(), RTT),
    maxNetworkRetries: 0,
    timeout: 1000,
  })

  const validChargeParams: Stripe.ChargeCreateParams = {
    amount: 2000,
    currency: 'eur',
    source: 'tok_mastercard',
    customer: 'cus_123',
    description: 'Valid charge',
    metadata: { benchmark: 'true' },
  }

  const malformedChargeParams = {
    amount: '2000',
    currency: 'invalid',
  }

  async function runWithChecking(
    params: typeof validChargeParams | typeof malformedChargeParams,
  ) {
    try {
      await stripe.charges
        .create(...runAssertion('charges.create', 0, [params]))
        .catch(() => {}) // Suppress errors for the benchmark
    } catch (e) {}
  }

  async function runWithoutChecking(
    params: typeof validChargeParams | typeof malformedChargeParams,
  ) {
    try {
      // @ts-expect-error We are intentionally passing potentially malformed params
      await stripe.charges.create(params).catch(() => {}) // Suppress errors for the benchmark
    } catch (e) {}
  }

  describe.each(TEST_PERCENTAGES)(
    'Benchmark for malformed traffic at %:',
    (currentGuessString) => {
      const currentGuess = Math.max(NUMBER[currentGuessString]!, 0)
      const workload = createWorkload(
        BENCH_ITERATIONS,
        currentGuess,
        validChargeParams,
        // @ts-expect-error malformed
        malformedChargeParams,
      )

      let withCheckingCounter = 0
      let withoutCheckingCounter = 0

      bench(
        'with argument checking',
        async () => {
          // Pull the next parameter from the pre-generated workload
          const params = workload[withCheckingCounter++]
          return runWithChecking(params)
        },
        { iterations: BENCH_ITERATIONS },
      )

      bench(
        'without argument checking',
        async () => {
          // Use a separate counter for this benchmark
          const params = workload[withoutCheckingCounter++]
          return runWithoutChecking(params)
        },
        { iterations: BENCH_ITERATIONS },
      )
    },
  )
})
