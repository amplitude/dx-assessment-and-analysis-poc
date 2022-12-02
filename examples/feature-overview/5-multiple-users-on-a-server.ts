/**
 * Multi-tenant usage
 *
 * In single user platforms like the Browser, user information can be set once and then used on all subsequent requests.
 * Server applications, however, handle requests from many users. As a result each event requires an associated user
 * at the time it is sent.
 *
 * In the untyped sdk `user_id` and/or `deviceId` can be passed in with the other Event fields
 *
 *   `analytics.track({
 *     user_id: 'user',
 *     event_type: 'My Event',
 *     event_properties: { ... },
 *   })`
 *
 * In the typed SDK, we previously made this a required param as it is needed on almost all requests.
 * We wanted to make the usage as concise as possible for the common case.
 *
 *   `ampli.track(userId, event)`
 *
 * For the `deviceId` and other less common fields users could include an additional `options` object.
 *
 *   `ampli.track(undefined, event, { device_id: 'device', timestamp: '123' })`
 *
 * Unfortunately, this creates a different interface from single-tenant SDKs which doesn't require a `userId`.
 *
 *   `ampli.track(event, options)`
 *
 * To resolve this friction the new server SDK is a ProductClient factory, which produces the same client interface
 * as in the single tenant SDK.
 *
 *   `product.userId('user').clientMethod({ ...props })`
 *
 * An example using Analytics
 *
 *   `analytics.userId('user').track(event, options)`
 *
 * This can be especially helpful in cross-platform applications such as NextJS were some code may be run on both
 * the client and the server context. The shared interface makes this easy.
 */
import {
  amplitude, User, analytics, experiment, UserLoggedIn, AnalyticsClient, ExperimentClient, Logger,
} from './amplitude/node'
import { prepareExampleEnv, getProductConfigurationFromEnv } from './utils'

prepareExampleEnv();

amplitude.typed.load({ logger: new Logger(), ...getProductConfigurationFromEnv() })

/**
 * 1. Track with `userId`
 */
analytics.userId('node-user').track(new UserLoggedIn({
  method: "email"
}));

/**
 * 2. Track with `deviceId`
 */
analytics.deviceId('node-device').typed.userSignedUp();

/**
 * 3. Track with `userProperties`
 */
const user = new User('node-user-2');
user.typed.setUserProperties({
  referralSource: 'other'
})
analytics.user(user).typed.checkout();

/**
 * 4. Create Request scoped clients
 */
type Middleware = (req: any, res: any, next: () => void) => any;
const app = { // express()
  use: (middleware: Middleware) => {}
};
/**
 * 4.1 Add middleware to create dedicated clients for the current user
 */
app.use((req, res, next) => {
  const userId = req.params.id;
  // create shared user for both clients
  const user = new User(userId);
  req.user = user;

  // create individual product clients for user
  req.analytics =  analytics.user(user);
  req.experiment =  experiment.user(user);

  // pre-fetch experiment for the given user
  req.experiment.fetch();

  next()
})
/**
 * 4.2 Other parts of the application can use the injected client without needing to set `userId`
 */
app.use((req) => {
  const analytics: AnalyticsClient = req.analytics;
  const experiment: ExperimentClient = req.experiment;

  if (experiment.typed.flagCodegenEnabled().on || experiment.typed.aMultiVariateExperiment().generic) {
    analytics.typed.userSignedUp()
  }
})
