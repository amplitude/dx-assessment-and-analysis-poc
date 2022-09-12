import { AmplitudePluginCategory } from "../amplitude/browser";
import { IAnalytics, AnalyticsEvent } from "../analytics/browser";
import { BrowserAmplitudePluginBase, BrowserPluginConfig } from "../amplitude/browser/plugin";
import { trackMessage } from "../analytics/messages";
import { jsons } from "../../util";

export class SegmentAnalytics extends BrowserAmplitudePluginBase implements IAnalytics {
  category: AmplitudePluginCategory = "ANALYTICS";
  id = 'com.segment.analytics.browser';
  name = 'segment';
  version = 0;

  load(config: BrowserPluginConfig) {
    super.load(config);

    // Hook into the event bus and forward analytics events to Segment
    config.hub?.analytics.subscribe(trackMessage, message => {
      this.onAcceptableMessage(message.payload, ({ event }) => {
        this.track(event);
      });
    })
  };

  track(eventType: string | AnalyticsEvent, eventProperties?: Record<string, any>) {
    // TODO: Consolidate this logic with Amplitude Analytics plugin
    //  New base class BrowserAnalyticsPluginBase?
    const event = (typeof eventType === 'string')
      ? { event_type: eventType, event_properties: eventProperties }
      : eventType;

    if (!event.user_id && !event.device_id) {
      event.user_id = this.config.user.userId;
      event.device_id = this.config.user.deviceId;
    }

    // send to segment
    this.config.logger?.log(`[Segment.track] ${jsons(event)}`)
  }

  flush() {}
}

// default instance
export const analytics = new SegmentAnalytics();
