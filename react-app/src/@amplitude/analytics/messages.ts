// Define Event
import { AmplitudeMessage } from "../hub";
import { AnalyticsEvent } from "./core";
import { createEventDefinition } from "ts-bus";
import { AmplitudePlugin } from "../amplitude/core/plugin";

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
