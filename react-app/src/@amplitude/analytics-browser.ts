import { AmplitudePlugin, AmplitudePluginBase, AmplitudePluginCategory } from "./amplitude-browser";
import { jsons } from "../util";

export interface EventOptions {
  user_id?: string;
  device_id?: string;
}

export interface Event extends EventOptions {
  event_type: string;
  event_properties?: Record<string, any>;
}

export interface IAnalytics extends AmplitudePlugin {
  track(eventType: string, eventProperties?: Record<string, any>): void;
  track(event: Event): void;
  flush(): void;
}

export class Analytics extends AmplitudePluginBase implements IAnalytics {
  category: AmplitudePluginCategory = 'ANALYTICS';

  track(eventType: string | Event, eventProperties?: Record<string, any>) {
    const event = (typeof eventType === 'string')
      ? { event_type: eventType, event_properties: eventProperties }
      : eventType;

    if (!event.user_id && !event.device_id) {
      event.user_id = this.config.user.userId;
      event.device_id = this.config.user.deviceId;
    }

    this.config.logger.log(`[Analytics.track] ${jsons(event)}`);
  }

  flush() {
    this.config.logger.log(`[Analytics.flush]`);
  }
}

// default instance
export const analytics = new Analytics();
