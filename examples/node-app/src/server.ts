/**
 * Server NodeJS App using Express
 *
 * For basic NodeJS usage see [app.ts](./app.ts)
 */

import dotenv from 'dotenv';
import express  from "express";
import {
  amplitude,
  analytics,
  experiment,
  UserLoggedIn,
  Logger,
  User,
  AnalyticsClient,
  ExperimentClient
} from './amplitude'

// Read Configuration
dotenv.config()
const {
  AMP_ANALYTICS_API_KEY,
  AMP_EXPERIMENT_API_KEY,
  AMP_USER_ID,
  AMP_DEVICE_ID,
  AMP_NODE_PORT
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


const app = express();
const port = AMP_NODE_PORT || 8080; // default port to listen

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
  res.send(`
<html>
<head>
  <script>
  function fetchAndLog(url) {
    return fetch(url).then(r => r.json()).then(r => console.log(r))
  }
  </script>
</head>
<body>
  <div>
      <h1>Amplitude Unified SDK</h1>
      <button onclick="fetchAndLog('/track-events-basic')">Track events</button>
      <button onclick="fetchAndLog('/track-events-middleware')">Track events with middleware</button>
  </div>
</body>
</html>
`);
} );

app.get( "/track-events-basic", ( req, res ) => {
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

  res.send(`{ "status": "success" }`);
});


/**
 * 4.1 Create Request scoped clients - Add middleware to create dedicated clients for the current user
 */
app.use('/track-events-middleware', async (req: any, res, next) => {
  const requestUserId = req.params.id || userId;
  console.log(`/track-events-middleware - creating user scoped clients for ${userId}`)
  // create shared user for both clients
  const user = new User(userId);
  req.user = user;

  // create individual product clients for user
  req.analytics =  analytics.user(user);
  req.experiment =  experiment.user(user);

  // pre-fetch experiment for the given user
  await req.experiment.fetch();

  next()
})
/**
 * 4.2 Other parts of the application can use the injected client without needing to set `userId`
 */
app.get('/track-events-middleware', (req: any, res) => {
  const analytics: AnalyticsClient = req.analytics;
  const experiment: ExperimentClient = req.experiment;

  if (experiment.typed.codegenBooleanExperiment().on || experiment.typed.codegenArrayExperiment().ampli) {
    console.log(`Codegen is enabled by experiment`); // eslint-disable-line no-console
    analytics.typed.userSignedUp()
  }
  res.send(`{ "status": "success" }`);
});

// start the Express server
app.listen( port, () => {
  console.log( `server started at http://localhost:${ port }` );
} );
