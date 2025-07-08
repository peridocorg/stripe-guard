import { execSync } from 'node:child_process'

/**
 * Sets up the Stripe Guard testing environment by executing the CLI tool
 * and creating test output directories.
 * @throws Will throw an error if the setup process fails
 */
export const setupStripeGuard = () => {
  try {
    console.log('Setting up Stripe Guard test environment...')
    execSync(
      './dist/index.js --output-dir ./test/dist --object-dir ./test/obj',
      {
        cwd: process.cwd(), // Set working directory to current directory
        stdio: 'inherit', // Shows command output in console
      },
    )
    console.log('✅ Stripe Guard test environment setup complete')
  } catch (error) {
    console.error('❌ Failed to setup Stripe Guard test environment')
    throw error
  }
}

/**
 * Cleans up the Stripe Guard testing environment by removing test directories.
 * @throws Will throw an error if the cleanup process fails
 */
export const teardownStripeGuard = () => {
  try {
    console.log('Cleaning up Stripe Guard test environment...')
    execSync('rimraf ./test/dist ./test/obj', {
      cwd: process.cwd(), // Set working directory to current directory
      stdio: 'inherit', // Shows command output in console
    })
    console.log('✅ Stripe Guard test environment cleanup complete')
  } catch (error) {
    console.error('❌ Failed to cleanup Stripe Guard test environment')
    throw error
  }
}
