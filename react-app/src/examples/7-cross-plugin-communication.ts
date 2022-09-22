/**
 * Experiment fires an exposure event using Analytics
 *
 * This could be used by Amplitude Analytics or another vendor eg Segment
 *
 * Process
 * - Add central bus to Amplitude module
 * - Add Messages to core packages with minimal interfaces `analyticsMessage({ event: AnalyticsEvent, method: 'track' })
 * - Core products forward messages on bus that can be listened to by other Plugins
 */
import { analytics as segmentAnalytics, SegmentAnalyticsConfig } from "../@amplitude/plugin-segment-analytics/browser";
import { experiment as launchDarkly, LaunchDarklyConfig } from "../@amplitude/plugin-launch-darkly-experiment/browser";
import { amplitude, analytics, experiment, TrackingPlanClient, user, UserLoggedIn } from "../amplitude/browser";
import { Logger } from "../@amplitude/amplitude/core/logger";

amplitude.load({
  apiKey: 'scoped-source-write-key',
  logger: new Logger(),
  plugins: [
    experiment,
    launchDarkly,
    analytics,
    /**
     * This Segment analytics plugin listens to events on the central bus and forwards them to Segment
     */
    segmentAnalytics
  ],
  configuration: {
    launchdarkly: {
      apiKey: 'my-ld-api-key',
      userKey: 'my-ld-user-key'
    } as LaunchDarklyConfig,
    segment: {
      writeKey: 'my-segment-write-key'
    } as SegmentAnalyticsConfig,
  }
})

/**
 * User
 */
user.setUserId('u-id')
user.typed.setUserProperties({
  requiredProp: "strongly typed"
});

/**
 * Experiment
 */
experiment.fetch();

/**
 * The exposure event is only tracked if Analytics Plugins have been loaded
 */
experiment.exposure();

launchDarkly.exposure();

/**
 * Analytics (and listeners)
 */
analytics.track('Amplitude Analytics SDK Event')

/**
 * Segment Analytics
 */
segmentAnalytics.track('Segment Only Event')

/**
 * [Typed] Segment Analytics
 */
segmentAnalytics.track(new UserLoggedIn());

const typedSegment = new TrackingPlanClient(segmentAnalytics);
typedSegment.userSignedUp();
