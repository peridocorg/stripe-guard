import { execSync } from 'child_process'

export const setupStripeGuard = () => {
  execSync('./dist/index.js --output-dir ./test/dist --object-dir ./test/obj')
}

export const teardownStripeGuard = () => {
  execSync('rimraf ./test/dist ./test/obj')
}
