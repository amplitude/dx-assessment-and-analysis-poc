/**
 * Basic NodeJS App, No Frameworks
 *
 * For server and middleware usage see [server.ts](./server.ts)
 */

import dotenv from 'dotenv';

import { amplitude, analytics, experiment, UserLoggedIn, Logger, User } from './amplitude'
import { getProductConfigurationFromEnv } from "@amplitude/util";

// Read Configuration
dotenv.config()

const userId = process.env.AMP_USER_ID || 'alpha-user-id-node';
const deviceId = process.env.AMP_DEVICE_ID || 'alpha-device-id-node';

amplitude.typed.load({
  environment: 'production',
  logger: new Logger(),
  // Try reading in ApiKeys from .env file
  ...getProductConfigurationFromEnv(),
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
