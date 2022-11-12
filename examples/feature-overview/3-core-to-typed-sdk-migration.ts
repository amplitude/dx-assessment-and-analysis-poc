/**
 * [Untyped] Imports
 *
 * These imports of the static core SDKs provide standard "untyped" usage
 */
import { amplitude, Logger } from '@amplitude/amplitude-browser'
import { user } from '@amplitude/user'
import { analytics } from '@amplitude/analytics-browser'
import { experiment } from '@amplitude/experiment-browser'

/**
 * [Typed] Imports
 *
 * Migrating to the [Typed] SDK is as easy as changing your imports to the following
 */
// import { amplitude, user, analytics, experiment, UserLoggedIn, Logger } from './amplitude/browser'

/**
 * [Untyped] Load
 *
 */
amplitude.load({
  /**
   * Api key is required, for each environment
   */
  apiKey: process.env.ENV === 'prod' ? 'scoped-source-write-key' : 'dev-key',
  logger: new Logger(),
  /**
   * We need to register plugins manually
   */
  plugins: [
    analytics,
    experiment
  ]
})

/**
 * [Typed] Load
 *
 * Code generated SDK can set sensible defaults based on environment including
 * - API key
 * - logLevel
 * - disabled ( testing)
 *
 * Plugins are added automatically based on
 */
// amplitude.typed.load({ environment: 'production'})

/**
 * [Untyped] usage
 *
 * Notice: This will keep working even with the [Typed] imports
 */
amplitude.user.setUserId('u-id')

user.setUserProperties({
  referralSource: "untyped"
});
user.setGroup('framework', 'awesome');
user.setGroupProperties('framework', 'awesome', {
  version: 'latest'
});

experiment.fetch();
if (experiment.variant('flag-codegen-on', "false") === "true") {
  throw new Error('codegen not available')
} else {
  analytics.track('My Event')
}

/**
 * [Typed] usage
 *
 * To enable the usage below simply switch to the [Typed] imports above.
 *
 * Notice: Switching the imports ADDS new functionality AND is backward COMPATIBLE with the original untyped usage
 */
// all codegen methods are available on 'data' objects per product
// user.typed.setUserProperties({
//   referralSource: "twitter"
// });
//
// if (experiment.typed.flagCodegenEnabled().on || experiment.typed.aMultiVariateExperiment().generic) {
//   analytics.typed.userLoggedIn({ method: "email"});
//   analytics.track(new UserLoggedIn({ method: "google" }));
// }
