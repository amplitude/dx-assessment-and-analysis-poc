import dotenv from 'dotenv';

import { amplitude, analytics, experiment, UserLoggedIn, Logger, User } from './amplitude'

// Read Configuration
dotenv.config()
const {
  AMP_ANALYTICS_API_KEY,
  AMP_EXPERIMENT_API_KEY,
  AMP_USER_ID,
  AMP_DEVICE_ID
} = process.env;

const userId = AMP_USER_ID || 'alpha-user-id-node';
const deviceId = AMP_DEVICE_ID || 'alpha-device-id-node';

const envConfig = !(AMP_ANALYTICS_API_KEY || AMP_EXPERIMENT_API_KEY)
  ? {}
  : {
    configuration: {
      analytics: {
        apiKey: AMP_ANALYTICS_API_KEY,
      },
      experiment: {
        apiKey: AMP_EXPERIMENT_API_KEY,
      },
    }
  };

amplitude.typed.load({
  environment: 'production',
  logger: new Logger(),
  ...envConfig,
})

/**
 * 1. Track with `userId`
 */
analytics.userId(userId).track(new UserLoggedIn({
  method: "email"
}));

/**
 * 2. Track with `deviceId`
 */
analytics.deviceId(deviceId).typed.userSignedUp();

/**
 * 3. Track with `userProperties`
 */
const user = new User(userId);
user.typed.setUserProperties({
  referralSource: 'other'
})
analytics.user(user).typed.checkout();
//
// /**
//  * 4. Create Request scoped clients
//  */
// type Middleware = (req: any, res: any, next: () => void) => any;
// const app = { // express()
//   use: (middleware: Middleware) => {}
// };
// /**
//  * 4.1 Add middleware to create dedicated clients for the current user
//  */
// app.use((req, res, next) => {
//   const userId = req.params.id;
//   // create shared user for both clients
//   const user = new User(userId);
//   req.user = user;
//
//   // create individual product clients for user
//   req.analytics =  analytics.user(user);
//   req.experiment =  experiment.user(user);
//
//   // pre-fetch experiment for the given user
//   req.experiment.fetch();
//
//   next()
// })
// /**
//  * 4.2 Other parts of the application can use the injected client without needing to set `userId`
//  */
// app.use((req) => {
//   const analytics: AnalyticsClient = req.analytics;
//   const experiment: ExperimentClient = req.experiment;
//
//   if (experiment.typed.flagCodegenEnabled().on || experiment.typed.aMultiVariateExperiment().generic) {
//     analytics.typed.userSignedUp()
//   }
// })
