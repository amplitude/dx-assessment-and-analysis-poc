import { EventBus, createEventDefinition } from "ts-bus";
import { AnalyticsEvent } from '../../analytics/core';
import { AmplitudePluginCategory } from "./plugin";

export interface AmplitudeMessage {
  category: AmplitudePluginCategory;
  sender: {
    name: string;
    version: number;
  };
}

// Define Event
export interface AnalyticsMessage extends AmplitudeMessage {
  category: 'ANALYTICS';
  method: 'TRACK';
  event: AnalyticsEvent;
}

export const analyticsMessage = createEventDefinition<AnalyticsMessage>()('ANALYTICS');

export { EventBus };

// Create bus
export const bus = new EventBus();
