// Define Event
import { AmplitudeMessage, createEventDefinition } from "@amplitude/hub";
import { AnalyticsEvent } from "@amplitude/analytics-core";
import { AmplitudePlugin } from "@amplitude/amplitude-core";

export type { AnalyticsEvent };

export const MessageTypes = {
  Track: 'track',
}

// Define Event
export interface AnalyticsMessage extends AmplitudeMessage {
  event: AnalyticsEvent;
}

export const trackMessage = createEventDefinition<AnalyticsMessage>()(MessageTypes.Track);

export const newTrackMessage = (sender: AmplitudePlugin, event: AnalyticsEvent) => trackMessage({
  sender: { name: sender.name, version: sender.version },
  event
})
