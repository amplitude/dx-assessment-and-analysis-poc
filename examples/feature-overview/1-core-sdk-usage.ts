/**
 * Untyped Core SDK Usage
 */
import { amplitude, Logger } from '@amplitude/amplitude-browser'
import { user } from '@amplitude/user'
import { analytics } from '@amplitude/analytics-browser'
import { experiment } from '@amplitude/experiment-browser'
import { prepareExampleEnv, getProductConfigurationFromEnv } from './utils'

prepareExampleEnv();

/**
 * With a scoped source key we could reduce to a single API key to rule all sub-products
 *
 * In the generated SDK we know all the users products and can automatically register the
 * necessary plugins for them.
 */
amplitude.load({
  apiKey: 'scoped-source-write-key',
  logger: new Logger(),
  /**
   * Plugins can be registered at load time
   */
  plugins: [
    analytics,
    experiment
  ],
  // Try loading API keys from Env
  ...getProductConfigurationFromEnv(),
})

/**
 * Single user
 *   Amplitude keeps a reference to current user
 *   Plugins can access the user via config
 */
amplitude.user.setUserId('unified-user-id')

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
user.setGroup('framework', 'awesome');
user.setGroupProperties('framework', 'awesome', {
  version: 'latest'
});

/**
 * Use individual product SDKs
 */
experiment.fetch();
experiment.exposure();
if (experiment.variant('flag-codegen-on', "false") === "true") {
  throw new Error('codegen not available')
} else {
  analytics.track('Core SDK Event')
}
