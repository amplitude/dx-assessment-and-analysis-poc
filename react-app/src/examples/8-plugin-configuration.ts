import { amplitude } from "../@amplitude/amplitude/browser";
import { analytics } from "../@amplitude/analytics/browser";
import { experiment } from "../@amplitude/experiment/browser";
import { analytics as segmentAnalytics } from "../@amplitude/segment-analytics-browser";

/**
 * 1. Register plugins with Amplitude
 */
amplitude.load({
  apiKey: 'a-key',
  configuration: {
    amplitude: {
      logLevel: 'Verbose',
      disabled: false,
    },
    analytics: {
      flushIntervalMs: 1000,
    },
    experiment: {
      flushIntervalMs: 100,
    }
  },
  plugins: [
    analytics,
    experiment,
  ]
})

// TODO: Support addPlugin with config
// amplitude.addPlugin(segmentAnalytics, {
//   flushInterval: 5000,
// });

// amplitude.load({
//   apiKey: 'a-key',
//   plugins: [
//     analytics.configure(),
//     experiment.configure({
//       flushInterval: 200,
//     }),
//     segmentAnalytics
//   ]
// })
