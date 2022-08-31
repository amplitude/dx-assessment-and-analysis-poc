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

/**
 * Client
 */
amplitudeBrowser.data.load({ environment: 'production' })
if (experimentBrowser.data.aMultiVariateExperiment()) {
  analyticsBrowser.track('Client side event')
}

/**
 * Server
 */
amplitudeNode.data.load({ environment: 'production' })
if (experimentNode.deviceId('device').data.flagCodegenEnabled()) {
  analyticsNode.userId('user').track('Server side event')
}


/**
 * Shared context
 */
function sharedContext(analytics: IAnalyticsClient, experiment: IExperimentClient) {
  if (experiment.data.flagCodegenEnabled())
  analytics.data.userSignedUp();
  analytics.track(new UserLoggedIn());
}

sharedContext(analyticsBrowser, experimentBrowser);
sharedContext(
  analyticsNode.userId('request-user'),
  experimentNode.userId('request-user'),
);
