/**
 * Strongly typed SDK usage
 */
import { amplitude, user, analytics, experiment, UserLoggedIn, Logger } from './amplitude/browser'

/**
 * Code generated SDK can set sensible defaults based on environment including
 * - API key
 * - logLevel
 * - disabled ( testing)
 */
amplitude.typed.load({
  environment: 'production',
  logger: new Logger()
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
 * All generated methods are available on 'data' objects per product
 *
 * For User, we can require specific properties based on the Data Plan
 */
user.typed.setUserProperties({
  referralSource: "twitter",
});

/**
 * For Experiment, we get strong types for feature flags and variants.
 */
experiment.fetch();
experiment.exposure();
if (experiment.typed.flagCodegenEnabled()) {
  /**
   * For Analytics, we get strong types for Events and Properties.
   */
  analytics.typed.userLoggedIn({ method: "email" });
  analytics.track(new UserLoggedIn({ method: "email" }));
}
