// For untyped usage
import { amplitude, AmplitudePluginBase, AmplitudePluginCategory } from '../@amplitude/amplitude/browser'
import { analytics } from '../@amplitude/analytics/browser'
import { analytics as segmentAnalytics } from '../@amplitude/segment-analytics-browser'
import { experiment } from '../@amplitude/experiment/browser'

// 1. Register plugins with Amplitude
amplitude.load({
  apiKey: 'a-key',
  plugins: [
    analytics,
    experiment,
    segmentAnalytics
  ]
})

// 2. Use product plugins directly
experiment.fetch()
if (experiment.variant('some-flag')) {
  analytics.track('Use analytics');
}

// 3. Create custom plugins
class MyPlugin extends AmplitudePluginBase {
  category: AmplitudePluginCategory = 'CUSTOM';

  doSomethingSpecial() {
    this.config.logger.log('[MyPlugin] did something special!');
  }
}

// 4. Add plugins dynamically after load()
const customPlugin = new MyPlugin();
amplitude.addPlugin(customPlugin);
