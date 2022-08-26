/**
 * Untyped Core SDK Usage
 */

import { amplitude } from '../@amplitude/amplitude/browser'
import { user } from '../@amplitude/user-browser'
import { analytics } from '../@amplitude/analytics/browser'
import { experiment } from '../@amplitude/experiment/browser'

amplitude.load({
  apiKey: 'scoped-source-write-key',
  /**
   * Plugins can be registered at load time
   */
  plugins: [
    analytics,
    experiment
  ]
})

/**
 * Single user
 *   Amplitude keeps a reference to current user
 *   Plugins can access the user via config
 */
amplitude.user.setUserId('u-id')

/**
 * Multiple users (server usage)
 *   See `multiTenantUser.ts`
 */

/**
 * Set user properties
 */
user.setUserProperties({
  requiredProp: "untyped"
});

/**
 * Use individual product SDKs
 */
experiment.fetch();
if (experiment.variant('flag-codegen-on')) {
  throw new Error('codegen not available')
} else {
  analytics.track('Core SDK Event')
}