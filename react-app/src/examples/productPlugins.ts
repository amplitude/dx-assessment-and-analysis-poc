/**
 * Product SDKs as Amplitude Plugins
 *
 * To share common concerns each product is designed to use a Plugin architecture.
 * Here we have examples of `Analytics`, `Experiment`, and `Custom` product plugins.
 *
 * Each Plugin has a reference to the Amplitude Config providing:
 *   - ApiKey
 *   - Logger
 *   - User (single tenant only)
 *   - Environments
 *   - Debugging
 *
 * To use a plugin:
 *  1. It must be registered with an Amplitude instance with `amplitude.load({ plugins })` or `amplitude.addPlugin(plugin)`
 *  2. Access the product SDK using the Plugin instance e.g. `analytics.track(..)`, `experiment.fetch()`
 */
import { amplitude, AmplitudePluginBase, AmplitudePluginCategory } from '../@amplitude/amplitude/browser'
import { analytics } from '../@amplitude/analytics/browser'
import { analytics as segmentAnalytics } from '../@amplitude/segment-analytics-browser'
import { experiment } from '../@amplitude/experiment/browser'

/**
 * 1. Register plugins with Amplitude
 */
amplitude.load({
  apiKey: 'a-key',
  plugins: [
    analytics,
    experiment,
    segmentAnalytics
  ]
})

/**
 * 2. Use product plugins directly
 */
experiment.fetch()
if (experiment.variant('some-flag')) {
  analytics.track('Use analytics');
}

/**
 * 3. Create custom plugins
 */
class MyPlugin extends AmplitudePluginBase {
  category: AmplitudePluginCategory = 'CUSTOM';

  doSomethingSpecial() {
    this.config.logger.log('[MyPlugin] did something special!');
  }
}

/**
 * 4. Add plugins dynamically after load()
 */
const customPlugin = new MyPlugin();
amplitude.addPlugin(customPlugin);
customPlugin.doSomethingSpecial();
