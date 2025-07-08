import { execSync } from 'node:child_process'
import waitOn from 'wait-on'

/**
 * Sets up the Stripe Mock testing environment by starting the stripe-mock Docker container
 * and waiting for it to be ready.
 * @throws Will throw an error if the setup process fails
 */
export const setupStripeMock = async () => {
  try {
    console.log('Setting up Stripe Mock test environment...')

    // Start stripe-mock Docker container
    execSync(
      'docker run --rm -d -p 127.0.0.1:12111:12111 --name stripe-mock stripe/stripe-mock:latest',
      {
        cwd: process.cwd(), // Set working directory to current directory
        stdio: 'inherit', // Shows command output in console
      },
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

    console.log('✅ Stripe Mock test environment setup complete')
  } catch (error) {
    console.error('❌ Failed to setup Stripe Mock test environment')
    throw error
  }
}

/**
 * Cleans up the Stripe Mock testing environment by stopping the Docker container.
 * @throws Will throw an error if the cleanup process fails
 */
export const teardownStripeMock = () => {
  try {
    console.log('Cleaning up Stripe Mock test environment...')
    execSync('docker stop stripe-mock', {
      cwd: process.cwd(), // Set working directory to current directory
      stdio: 'inherit', // Shows command output in console
    })
    console.log('✅ Stripe Mock test environment cleanup complete')
  } catch (error) {
    console.error('❌ Failed to cleanup Stripe Mock test environment')
    throw error
  }
}
