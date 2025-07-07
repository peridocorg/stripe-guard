<div align="center">
  <h1>Stripe Guard</h1>
  <p>Save on outbound request costs by erroring early with zero-overhead validation<sup>1</sup></p>
  <a href="https://www.npmjs.com/package/@peridoc/stripe-guard"><img src="https://img.shields.io/npm/v/%40peridoc%2Fstripe-guard.svg?style=flat" /></a>
  <a href="#contributing"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" /></a>
  <a href="https://github.com/peridocorg/stripe-guard/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" /></a>
  <br />
  <hr />
</div>

## What is Stripe Guard?

Stripe Guard is a code generation utility that uses Stripe's existing types to enforce pre-request validation for Stripe API calls. By catching malformed payloads before they hit the network, you can reduce unnecessary API calls and improve application performance.

This library would not have been possible without the geniuses behind `ts-runtime-checks` and `expect-type`.

<sup>1</sup> *Bundle size considerations apply. Peridoc is not affiliated with or endorsed by Stripe, but we love their SDK.*

## Features

- **Performance Optimized**: Only 33% extra CPU time before the network operation
- **Network Efficiency**: Breaks even at ~0.5% malformed payloads with ~100ms network round-trip time
- **Overload-Aware Validation**: Support type-safe validation against chosen function overload
- **Type Safety**: Generates TypeScript assertion functions for all Stripe API methods
- **Zero Runtime Dependencies**: Self-contained validation logic
- **Developer Friendly**: Detailed error messages by default in development mode

## Installation

```bash
npm install @peridoc/stripe-guard
```

## Quick Start

### Generate Validation Functions

We recommend you call this whenever you update your Stripe API version or add new features.

```bash
npx @peridoc/stripe-guard --bundle --minify
# Generates validation functions in src/stripe-guard/
```

### Use in Your Code

```typescript
import { Stripe } from 'stripe';
import { runAssertion, withGuard } from './src/stripe-guard';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe's charges.retrieve has multiple overloads:
// retrieve(
//   id: string,
//   params?: ChargeRetrieveParams,
//   options?: RequestOptions
// ): Promise<Stripe.Response<Stripe.Charge>>;
// retrieve(
//   id: string,
//   options?: RequestOptions
// ): Promise<Stripe.Response<Stripe.Charge>>;

// Method 1: Manual validation
const charge = await stripe.charges.retrieve(
  ...runAssertion('charges.retrieve', 0, [
    'ch_123',
    {
      expand: ['balance_transaction'],
    },
    {
      idempotencyKey: '1234567890',
    }
  ]),
);
// Validates and returns the arguments correctly typed
(alias) runAssertion<"charges.retrieve", 0>(path: "charges.retrieve", index: 0, args: unknown[]): [id: string, params?: Stripe.ChargeRetrieveParams | undefined, options?: Stripe.RequestOptions | undefined];


// Method 2: Auto-validation by proxying methods
const guardedStripe = withGuard(stripe);
const customer = await guardedStripe.customers.create({
  email: 'customer@example.com',
});
// Limitation: Validates against the default overload
```

## CLI Usage

### Basic Usage

```bash
# Bundle and minify with Rollup and Terser
stripe-guard -bm

# Generate to custom directory
stripe-guard ./custom-output
stripe-guard -o ./stripe-types
```

### Advanced Options

```bash
# Produce detailed validation errors in exchange for larger bundle size
stripe-guard --detailed

# Produce source maps and specify the directory for the generated source
stripe-guard --source-map --object-dir ./custom-obj

# Dry run to see what would be generated
stripe-guard --dry-run --verbose
```

### CLI Options

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--output-dir` | `-o` | `src/stripe-guard/` | Output directory for generated files |
| `--bundle` | `-b` | `false` | Bundle generated files with Rollup |
| `--minify` | `-m` | `false` | Minify generated files with Terser |
| `--source-maps` | `-s` | `false` | Generate source maps |
| `--dry-run` | `-d` | `false` | Preview generation without creating files |
| `--detailed` | | `NODE_ENV === 'development'` | Show detailed validation errors |
| `--object-dir` | | `node_modules/.peridoc/stripe-guard/` | Intermediate build directory |
| `--verbose` | `-v` | `false` | Enable verbose logging |
| `--help` | `-h` | `false` | Show help message |

## API Reference

### `runAssertion<P, N>(path, index, args)`

Validates unknown arguments against typed Stripe API parameters.

**Parameters:**
- `path`: Stripe API path (e.g., `'customers.create'`)
- `index`: Overload index (defaults to `0`)
- `args`: Arguments to validate

**Returns:** Typed parameters for the specified Stripe API method

**Example:**
```typescript
import { runAssertion } from './src/stripe-guard';

const validatedArgs = runAssertion('customers.create', 0, [
  {
    email: 'test@example.com',
    name: 'John Doe',
  },
]);
// const validatedArgs: [params?: Stripe.CustomerCreateParams | undefined, options?: Stripe.RequestOptions | undefined];

const customer = await stripe.customers.create(...validatedArgs);
```

### `withGuard(stripe)`

Creates a proxied Stripe instance that automatically validates all method calls.


**Parameters:**
- `stripe`: The Stripe instance to wrap

**Returns:** Proxied Stripe instance with validation

**Example:**
```typescript
import { withGuard } from './src/stripe-guard';

const guardedStripe = withGuard(new Stripe(process.env.STRIPE_SECRET_KEY));

// All method calls are automatically validated
// Will throw an error if the arguments are invalid
const customer = await guardedStripe.customers.create({
  email: 'customer@example.com',
});
```

Methods and resources which are not validated:
```typescript
const internalMethods = new Set([
  'account',
  'addFetchRelatedObjectIfNeeded',
  'basePath',
  'constructor',
  'errors',
  'getApiField',
  'getAppInfoAsString',
  'getClientId',
  'getClientUserAgent',
  'getClientUserAgentSeeded',
  'getConstant',
  'getInitialNetworkRetryDelay',
  'getMaxNetworkRetries',
  'getMaxNetworkRetryDelay',
  'getTelemetryEnabled',
  'off',
  'on',
  'once',
  'parseThinEvent',
  'path',
  'rawRequest',
  'requestDataProcessor',
  'setClientId',
  'StripeResource',
  'testHelpers',
])
```

### `listAssertionPaths()`

Returns all available Stripe API paths that can be validated.

**Returns:** Array of available Stripe API paths

**Example:**
```typescript
import { listAssertionPaths } from './src/stripe-guard';

const paths = listAssertionPaths();
console.log(paths); // ['customers.create', 'charges.create', ...]
```

## API Helpers

If you're developing an API on top of Stripe, helper types are exported to assist.

```typescript
import type {
  StripeApiPath,
  StripeCreatePaths,
  StripeMethodParameters,
  StripeMethodReturnType,
} from './src/stripe-guard'

// Where you can proceed like below

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

type StripeResult<
  P extends string,
  I extends number = 0,
> = P extends StripeApiPath
  ? UnwrapPromise<StripeMethodReturnType<P, I>>
  : never

interface IHandlerShapes<M extends string, I extends number = 0> {
  create: {
    model: M extends keyof StripeCreatePaths ? M | [M, I] : never
    args: M extends keyof StripeCreatePaths
      ? StripeMethodParameters<StripeCreatePaths[M], I>
      : never
    result: M extends keyof StripeCreatePaths
      ? StripeResult<StripeCreatePaths[M], I>
      : never
  }

  // ...
}

interface IHandlerAPI {
  create<M extends keyof StripeCreatePaths, I extends number = 0>(
    model: IHandlerShapes<M, I>['create']['model'],
    ...args: IHandlerShapes<M, I>['create']['args']
  ): Promise<Error | IHandlerShapes<M, I>['create']['result']>

  // ...
}

(method) HandlerAPI.create<"charges", 0>(model: "charges" | ["charges", 0], params?: Stripe.ChargeCreateParams | undefined, options?: Stripe.RequestOptions | undefined): Promise<Stripe.Response<Stripe.Charge> | Error>
```

Have a unique use case? Reach out to us to see if we're a good fit.

## Important Limitations

⚠️ **Bundle Size**: The generated validation JavaScript is approximately **1.4MB** in size. Consider this when evaluating the trade-off between validation benefits and bundle size for your application.

## Generated Structure

Stripe Guard generates the following file structure (when the bundle option is enabled):

```bash
src/stripe-guard/
├── index.js          # Main exports and validation logic
├── index.d.ts        # TypeScript definitions
├── types.d.ts        # Shared type utilities
└── [resource]/       # Individual resource validation
    ├── index.d.ts    # Resource-specific types
    └── ...
```

## Development

### Building from Source

```bash
git clone https://github.com/peridocorg/stripe-guard.git
cd stripe-guard
npm install
npm run build
```

### Running Tests

```bash
npm test
npm run bench
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.
