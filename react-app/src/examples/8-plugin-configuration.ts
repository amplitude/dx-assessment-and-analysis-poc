import { amplitude } from "../@amplitude/amplitude/browser";
import { analytics } from "../@amplitude/analytics/browser";
import { experiment } from "../@amplitude/experiment/browser";
import { analytics as segmentAnalytics } from "../@amplitude/plugin-segment-analytics/browser";

/**
 * 1. Register plugins with Amplitude during load()
 */
amplitude.load({
  apiKey: 'a-key',
  disabled: false,
  // logLevel: 'verbose',
  plugins: [
    analytics,
    experiment,
  ],
  configuration: {
    analytics: {
      flushIntervalMs: 1000,
      logLevel: 'none',
    },
    experiment: {
      flushIntervalMs: 100,
    },
    segment: {

    }
  },
})

/**
 * 2. Add plugins dynamically after load()
 */
amplitude.addPlugin(segmentAnalytics, {
  flushInterval: 5000,
});
