import {
  amplitude as amplitudeNode,
  analytics as analyticsNode,
  experiment as experimentNode,
  UserLoggedIn,
  IAnalyticsClient,
  IExperimentClient,
  Logger,
} from './amplitude/node'
import {
  amplitude as amplitudeBrowser,
  analytics as analyticsBrowser,
  experiment as experimentBrowser,
} from './amplitude/browser'
import { prepareExampleEnv, getProductConfigurationFromEnv } from './utils'

prepareExampleEnv();
const envConfig = getProductConfigurationFromEnv();

/**
 * Client
 */
amplitudeBrowser.typed.load({ logger: new Logger(), ...envConfig })
if (experimentBrowser.typed.aMultiVariateExperiment().generic) {
  analyticsBrowser.track('Client side event')
}

/**
 * Server
 */
amplitudeNode.typed.load({ logger: new Logger(), ...envConfig })
if (experimentNode.deviceId('device').typed.flagCodegenEnabled()) {
  analyticsNode.userId('unified-user-id').track('Server side event')
}


/**
 * Shared context
 */
function sharedContext(analytics: IAnalyticsClient, experiment: IExperimentClient) {
  if (experiment.typed.flagCodegenEnabled().on || experiment.typed.aMultiVariateExperiment().generic) {
    analytics.typed.userSignedUp();
    analytics.track(new UserLoggedIn({method: "email"}));
  }
}

sharedContext(analyticsBrowser, experimentBrowser);
sharedContext(
  analyticsNode.userId('request-user'),
  experimentNode.userId('request-user'),
);
