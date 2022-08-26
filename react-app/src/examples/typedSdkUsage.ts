/**
 * Strongly typed SDK usage
 */
import { amplitude, user, analytics, experiment, UserLoggedIn } from '../amplitude/browser'

/**
 * With a scoped source key we could reduce to a single API key to rule all sub-products
 *
 * In the generated SDK we know all the users products and can automatically register the
 * necessary plugins for them.
 */
amplitude.load({ apiKey: 'scoped-source-write-key' })

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
 * All generated methods are available on 'data' objects per product
 *
 * For User, we can require specific properties based on the Data Plan
 */
user.data.setUserProperties({
  requiredProp: "strongly typed",
});

experiment.fetch();
/**
 * For Experiment, we get strong types for feature flags and variants.
 */
if (experiment.data.flagCodegenEnabled()) {
  /**
   * For Analytics, we get strong types for Events and Properties.
   */
  analytics.data.userLoggedIn();
  analytics.track(new UserLoggedIn());
}
