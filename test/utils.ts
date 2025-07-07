import type { Stripe } from 'stripe'

// Create a wrapper that adds latency to the real HTTP client
// This is because hosting the mock stripe server in a LAN
// exhibits unrealistic latency compared to production
export function createDelayedHttpClient(
  originalHttpClient: Stripe.HttpClient,
  delayMs: number,
) {
  return {
    getClientName: originalHttpClient.getClientName.bind(originalHttpClient),
    makeRequest: async (
      ...args: Parameters<Stripe.HttpClient['makeRequest']>
    ) => {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      return originalHttpClient.makeRequest(...args)
    },
  }
}

/**
 * Creates a shuffled array of parameters for a benchmark workload.
 * Guarantees at least one malformed parameter if malformedPercent > 0.
 *
 * @param iterations The total number of iterations in the benchmark.
 * @param malformedPercent The desired percentage of malformed parameters (0-1).
 * @param validParams The object to use for valid parameters.
 * @param malformedParams The object to use for malformed parameters.
 * @returns A shuffled array of parameter objects.
 */
export function createWorkload<T>(
  iterations: number,
  malformedPercent: number,
  validParams: T,
  malformedParams: T,
): T[] {
  if (malformedPercent < 0 || malformedPercent > 1) {
    throw new Error('malformedPercent must be between 0 and 1')
  }

  let numMalformed = Math.round(iterations * malformedPercent)

  // THIS IS THE KEY: Ensure at least one malformed case if the percentage is non-zero.
  if (malformedPercent > 0 && numMalformed === 0) {
    numMalformed = 1
  }

  const numValid = iterations - numMalformed

  const workload: T[] = [
    ...Array(numValid).fill(validParams),
    ...Array(numMalformed).fill(malformedParams),
  ]

  // Shuffle the array to ensure random distribution (Fisher-Yates shuffle)
  for (let i = workload.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[workload[i], workload[j]] = [workload[j], workload[i]]
  }

  return workload
}

/**
 * Measures the round-trip time to the Stripe API in milliseconds.
 *
 * This function sends a lightweight HEAD request to a common Stripe API endpoint.
 * A HEAD request is used because it retrieves only the headers, not the full
 * response body, making it a good proxy for network latency without fetching
 * unnecessary data.
 *
 * @returns {Promise<number>} A promise that resolves with the latency in milliseconds.
 * @throws {Error} Throws an error if the API request fails for any reason.
 */
export async function getStripeApiRTT(): Promise<number> {
  // The Stripe API endpoint to ping. We use the events endpoint as it's a
  // common and reliable one. Any valid endpoint would work.
  const stripeApiUrl = 'https://api.stripe.com/v1/events'

  try {
    const startTime = performance.now()

    // Make a HEAD request. We don't need the body, just the response,
    // to confirm the round trip is complete.
    await fetch(stripeApiUrl, {
      method: 'HEAD',
      mode: 'cors',
      cache: 'no-cache',
    })

    const endTime = performance.now()
    const latency = endTime - startTime
    return latency
  } catch (error) {
    console.error('Error checking Stripe API latency:', error)
    throw new Error('Failed to measure Stripe API latency.')
  }
}
