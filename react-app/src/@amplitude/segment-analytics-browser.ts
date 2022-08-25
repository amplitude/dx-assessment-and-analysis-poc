import { AmplitudePluginBase, AmplitudePluginCategory } from "./amplitude-browser";
import { IAnalytics, Event } from "./analytics-browser";

export class SegmentAnalytics extends AmplitudePluginBase implements IAnalytics {
  category: AmplitudePluginCategory = "ANALYTICS";

  load() {};
  track(eventType: string | Event, eventProperties?: Record<string, any>) {
    // send to segment
  }
  flush() {}
}

// default instance
export const analytics = new SegmentAnalytics();
