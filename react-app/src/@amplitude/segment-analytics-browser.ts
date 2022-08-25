import { AmplitudePluginCategory } from "./amplitude/browser";
import { IAnalytics, Event } from "./analytics/browser";
import { BrowserAmplitudePluginBase } from "./amplitude/browser/plugin";

export class SegmentAnalytics extends BrowserAmplitudePluginBase implements IAnalytics {
  category: AmplitudePluginCategory = "ANALYTICS";

  load() {};
  track(eventType: string | Event, eventProperties?: Record<string, any>) {
    // send to segment
  }
  flush() {}
}

// default instance
export const analytics = new SegmentAnalytics();
