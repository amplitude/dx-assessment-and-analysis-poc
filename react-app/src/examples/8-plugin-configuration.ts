import { amplitude, Logger } from "@amplitude/amplitude-browser";
import { analytics } from "../@amplitude/analytics/browser";
import { experiment } from "../@amplitude/experiment/browser";
import { analytics as segmentAnalytics, SegmentAnalyticsConfig } from "../@amplitude/plugin-segment-analytics/browser";

/**
 * 1. Register plugins with Amplitude during load()
 */
amplitude.load({
  apiKey: 'a-key',
  disabled: false,
  logger: new Logger(),
  plugins: [
    analytics,
    experiment,
  ],
  configuration: {
    analytics: {
      apiKey: ''
    },
    experiment: {
      apiKey: ''
    }
  },
})

/**
 * 2. Add plugins dynamically after load()
 */
amplitude.addPluginTyped<SegmentAnalyticsConfig>(segmentAnalytics, {
  writeKey: 'my-segment-write-key',
  flushInterval: 5000,
});

segmentAnalytics.track('My Event');
