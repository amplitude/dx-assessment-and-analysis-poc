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
import { amplitude } from "../@amplitude/amplitude/browser";
import { analytics } from "../@amplitude/analytics/browser";
import { experiment } from "../@amplitude/experiment/browser";
import { analytics as segmentAnalytics } from "../@amplitude/segment-analytics-browser";
import { user } from "../@amplitude/user-browser";

amplitude.load({
  apiKey: 'scoped-source-write-key',
  plugins: [
    experiment,
    analytics,
    /**
     * This Segment analytics plugin listens to events on the central bus and forwards them to Segment
     */
    segmentAnalytics
  ]
})

/**
 * User
 */
user.setUserId('u-id')
user.setUserProperties({
  requiredProp: "untyped"
});

/**
 * Experiment
 */
experiment.fetch();

/**
 * The exposure event is only tracked if Analytics Plugins have been loaded
 */
experiment.exposure();

/**
 * Analytics (and listeners)
 */
analytics.track('Amplitude Analytics SDK Event')

/**
 * Segment Analytics
 */
segmentAnalytics.track('Segment Only Event')
