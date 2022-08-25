import { AmplitudePlugin, AmplitudePluginBase, AmplitudePluginCategory } from "./amplitude-browser";
import { jsons } from "../util";

export interface Event {
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
    this.config.logger.log(`[Analytics.track] ${jsons(event)}`);
  }

  flush() {
    this.config.logger.log(`[Analytics.flush]`);
  }
}

// default instance
export const analytics = new Analytics();
