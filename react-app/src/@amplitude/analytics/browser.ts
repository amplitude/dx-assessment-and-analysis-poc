import { AnalyticsEvent, IAnalyticsClient } from "./core";
import { AmplitudePlugin, AmplitudePluginCategory } from "../amplitude/browser";
import { jsons } from "../../util";
import { BrowserAmplitudePluginBase, BrowserPluginConfig } from "../amplitude/browser/plugin";
import { analyticsMessage } from "../amplitude/core/bus";

export type { AnalyticsEvent };

export interface IAnalytics extends AmplitudePlugin, IAnalyticsClient {
}

export class Analytics extends BrowserAmplitudePluginBase implements IAnalytics {
  category: AmplitudePluginCategory = 'ANALYTICS';
  name = 'com.amplitude.analytics.browser';
  version = 0;

  load(config: BrowserPluginConfig) {
    super.load(config);

    config.bus?.subscribe(analyticsMessage, message => {
      this.onAcceptableMessage(message.payload, ({event}) => {
        this.track(event);
      })
    })
  }

  track(eventType: string | AnalyticsEvent, eventProperties?: Record<string, any>) {
    // TODO: Share with SegmentAnalytics somehow
    const event = (typeof eventType === 'string')
      ? { event_type: eventType, event_properties: eventProperties }
      : eventType;

    if (!event.user_id && !event.device_id) {
      event.user_id = this.config.user.userId;
      event.device_id = this.config.user.deviceId;
    }

    this.config.logger.log(`[Analytics.track] ${jsons(event)}`);

    // Publish event on bus to send to other listeners
    this.config.bus?.publish(analyticsMessage({
      category: 'ANALYTICS',
      method: 'TRACK',
      sender: { name: this.name, version: this.version },
      event,
    }));
  }

  flush() {
    this.config.logger.log(`[Analytics.flush]`);
  }
}

// default instance
export const analytics = new Analytics();
