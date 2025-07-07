import { execSync } from 'child_process'
import waitOn from 'wait-on'

export async function setupStripeMock() {
  try {
    // Start stripe-mock (Docker example)
    execSync(
      'docker run --rm -d -p 127.0.0.1:12111:12111 --name stripe-mock stripe/stripe-mock:latest',
    )

    // Wait for server to be ready
    await waitOn({
      resources: ['http://localhost:12111/v1/charges'],
      timeout: 5000,
      validateStatus: (status) => {
        // Accept 401 status as valid since it means the server is responding
        return status >= 200 && status < 500
      },
    })

    console.log('stripe-mock server is ready')
  } catch (error) {
    console.error('Failed to start stripe-mock:', error)
    process.exit(1)
  }
}

export async function teardownStripeMock() {
  try {
    execSync('docker stop stripe-mock')
  } catch (error) {
    console.error('Failed to stop stripe-mock:', error)
  }
}
