import {
  AnalyticsEvent, IAnalyticsClient, AnalyticsPluginConfig as AnalyticsPluginConfigCore,
} from "@amplitude/analytics-core";
import {
  AmplitudePlugin, AmplitudePluginCategory, BrowserAmplitudePluginBase, BrowserPluginConfig,
} from "@amplitude/amplitude-browser";
import { jsons } from "@amplitude/util";
import { trackMessage, newTrackMessage } from "@amplitude/analytics-messages";
import { init, track, flush } from "@amplitude/analytics-browser-legacy";

export type { AnalyticsEvent, IAnalyticsClient };

export interface AnalyticsPluginConfig extends BrowserPluginConfig, AnalyticsPluginConfigCore {

}

export interface IAnalytics extends AmplitudePlugin, IAnalyticsClient {
}

export class Analytics extends BrowserAmplitudePluginBase implements IAnalytics {
  category: AmplitudePluginCategory = 'ANALYTICS';
  id = 'com.amplitude.analytics.browser';
  name = 'analytics';
  version = 0;

  private apiKey;

  load(config: AnalyticsPluginConfig, pluginConfig: any) {
    super.load(config, pluginConfig);

    this.apiKey = pluginConfig?.apiKey || config.apiKey;

    init(this.apiKey);

    config.hub?.analytics.subscribe(trackMessage, message => {
      this.onAcceptableMessage(message.payload, ({event}) => {
        this._track(event);
      })
    })
  }

  track(eventType: string | AnalyticsEvent, eventProperties?: Record<string, any>) {
    const event = (typeof eventType === 'string')
      ? { event_type: eventType, event_properties: eventProperties }
      : eventType;

    if (!event.user_id && !event.device_id) {
      event.user_id = this.config.user.userId;
      event.device_id = this.config.user.deviceId;
    }

    this._track(event);

    // Publish event on bus to send to other listeners
    this.config.hub?.analytics.publish(newTrackMessage(this, event));
  }

  protected _track(event: AnalyticsEvent) {
    this.config.logger.log(`[Analytics.track] ${jsons(event)}`);
    track(event);
  }

  flush() {
    this.config.logger.log(`[Analytics.flush]`);
    flush();
  }
}

// default instance
export const analytics = new Analytics();
