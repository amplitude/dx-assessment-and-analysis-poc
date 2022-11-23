/**
 * Basic NodeJS App, No Frameworks
 *
 * For server and middleware usage see [server.ts](./server.ts)
 */

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

/**
 * 4. Keep user scoped clients for multiple actions for the same user
 */
// create individual product clients for user
const userAnalytics =  analytics.user(user);
const userExperiment =  experiment.user(user);

if (userExperiment.typed.codegenBooleanExperiment().on) {
  userAnalytics.typed.userSignedUp({
    referralSource: "other"
  })
  userAnalytics.track(new UserLoggedIn({
    method: "email"
  }))
} else {
  userAnalytics.track({
    event_type: 'My Untyped Event'
  })
}
