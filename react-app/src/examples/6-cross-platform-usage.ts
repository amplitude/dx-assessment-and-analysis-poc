import {
  amplitude as amplitudeNode,
  analytics as analyticsNode,
  experiment as experimentNode,
  UserLoggedIn,
  IAnalyticsClient,
  IExperimentClient,
} from '../amplitude/node'
import {
  amplitude as amplitudeBrowser,
  analytics as analyticsBrowser,
  experiment as experimentBrowser,
} from '../amplitude/browser'
import { Logger } from "../@amplitude/amplitude/core/logger";

/**
 * Client
 */
amplitudeBrowser.typed.load({ logger: new Logger() })
if (experimentBrowser.typed.aMultiVariateExperiment()) {
  analyticsBrowser.track('Client side event')
}

/**
 * Server
 */
amplitudeNode.typed.load({ logger: new Logger() })
if (experimentNode.deviceId('device').typed.flagCodegenEnabled()) {
  analyticsNode.userId('user').track('Server side event')
}


/**
 * Shared context
 */
function sharedContext(analytics: IAnalyticsClient, experiment: IExperimentClient) {
  if (experiment.typed.flagCodegenEnabled())
  analytics.typed.userSignedUp();
  analytics.track(new UserLoggedIn());
}

sharedContext(analyticsBrowser, experimentBrowser);
sharedContext(
  analyticsNode.userId('request-user'),
  experimentNode.userId('request-user'),
);
