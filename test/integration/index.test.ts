import { Stripe } from 'stripe'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { listAssertionPaths, runAssertion, withGuard } from '../dist'

describe('withGuard', () => {
  const stripe = new Stripe('sk_test_123', {
    apiVersion: '2025-05-28.basil',
    host: 'localhost',
    port: 12111,
    protocol: 'http',
    httpClient: Stripe.createNodeHttpClient(),
    maxNetworkRetries: 0,
    timeout: 1000,
  })
  const guarded = withGuard(stripe)

  it('should maintain original instance type', () => {
    expect(guarded).toBe(stripe) // Same instance
    expect(guarded).toBeInstanceOf(Stripe) // Maintains type
  })

  it('should patch methods while maintaining properties', () => {
    expect(typeof guarded.customers.create).toBe('function') // Still a function
  })

  it('should maintain method prototypes', () => {
    expect(Object.getPrototypeOf(guarded.customers.create)).toBe(
      Object.getPrototypeOf(stripe.customers.create),
    )
  })

  it('should proxy nested objects', () => {
    expect(guarded.customers).toBeDefined()
    expect(guarded.customers.createTaxId).toBeDefined()
  })

  it('should handle nested method calls with validation', async () => {
    vi.spyOn(stripe.customers, 'create')
    await expect(
      async () =>
        // @ts-expect-error wrong type for prop
        await guarded.customers.create({ email: 1024 }),
    ).rejects.toThrow('Stripe API validation failed')
    expect(stripe.customers.create).toHaveBeenCalled()
  })

  it('should handle methods with no assertions by calling original', async () => {
    // internal methods
    // 'account',
    // 'addFetchRelatedObjectIfNeeded',
    // 'basePath',
    // 'constructor',
    // 'errors',
    // 'getApiField',
    // 'getAppInfoAsString',
    // 'getClientId',
    // 'getClientUserAgent',
    // 'getClientUserAgentSeeded',
    // 'getConstant',
    // 'getInitialNetworkRetryDelay',
    // 'getMaxNetworkRetries',
    // 'getMaxNetworkRetryDelay',
    // 'getTelemetryEnabled',
    // 'off',
    // 'on',
    // 'once',
    // 'parseThinEvent',
    // 'path',
    // 'rawRequest',
    // 'requestDataProcessor',
    // 'setClientId',
    // 'StripeResource',
    // 'testHelpers',

    vi.spyOn(stripe.testHelpers.refunds, 'expire')
    await guarded.testHelpers.refunds.expire('test')
    expect(stripe.testHelpers.refunds.expire).toHaveBeenCalledWith('test')
  })

  it('should throw for invalid paths in assertion map', async () => {
    // Mock the assertion map to include our test path
    vi.mock('./index', async (original) => {
      const mod: object = await original()
      return {
        ...mod,
        assertionMap: {
          'customers.invalidMethod': () => {
            throw new Error('Invalid method')
          },
        },
      }
    })

    // @ts-expect-error invalid method
    stripe.customers.invalidMethod = vi.fn(async () => {
      throw new Error('Invalid method')
    })

    await expect(
      async () =>
        // @ts-expect-error invalid method
        await guarded.customers.invalidMethod(),
    ).rejects.toThrow('Invalid method')
  })

  it('should pass through non-object, non-function properties', () => {
    // @ts-expect-error invalid property
    stripe.customers.someProperty = 'test value'
    // @ts-expect-error invalid property
    expect(guarded.customers.someProperty).toBe('test value')
  })

  it('should handle concurrent method calls', async () => {
    vi.spyOn(stripe.customers, 'create').mockImplementation(
      () =>
        new Promise((resolve) =>
          // @ts-expect-error not complete
          setTimeout(() => resolve({ id: 'cust_123' }), 10),
        ),
    )

    const call1 = guarded.customers.create({ name: 'Customer 1' })
    const call2 = guarded.customers.create({ name: 'Customer 2' })

    const results = await Promise.all([call1, call2])
    expect(results[0].id).toBe('cust_123')
    expect(results[1].id).toBe('cust_123')
    expect(stripe.customers.create).toHaveBeenCalledTimes(2)
  })

  it('should list available assertion paths', () => {
    const paths = listAssertionPaths()
    expect(Array.isArray(paths)).toBe(true)
    expect(paths.length).toBeGreaterThan(0)
    expect(paths).toContain('customers.create')
  })
})

describe('runAssertion', () => {
  let stripe: Stripe

  beforeAll(() => {
    stripe = new Stripe('sk_test_123', {
      apiVersion: '2025-05-28.basil',
      host: 'localhost',
      port: 12111,
      protocol: 'http',
    })
  })

  it('should create a charge', async () => {
    const charge = await stripe.charges.create(
      ...runAssertion('charges.create', 0, [
        {
          amount: 1000,
          currency: 'usd',
          source: 'tok_visa',
        },
      ]),
    )

    expect(charge).toHaveProperty('id')
    expect(charge.amount).toBe(1000)
    expect(charge.currency).toBe('usd')
  })

  it('should retrieve a charge', async () => {
    const charge = await stripe.charges.retrieve('ch_123')

    expect(charge).toHaveProperty('id')
    expect(charge).toHaveProperty('amount')
  })

  it('should throw on invalid args', async () => {
    expect(() =>
      runAssertion('charges.create', 0, [
        {
          amount: 'a string',
        },
      ]),
    ).toThrow()
  })
})
