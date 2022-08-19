import { AmplitudePlugin, AmplitudePluginBase } from "./amplitude-browser";

export interface Event {
  event_type: string;
  event_properties?: Record<string, any>;
}

export interface IAnalytics {
  load(): void;
  track(eventType: string, eventProperties?: Record<string, any>): void;
  track(event: Event): void;
  flush(): void;
}

export class Analytics extends AmplitudePluginBase implements IAnalytics {
  load() {};
  track(eventType: string | Event, eventProperties?: Record<string, any>) {}
  flush() {}
}

// default instance
export const analytics = new Analytics();
