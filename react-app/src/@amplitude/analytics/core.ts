export interface EventOptions {
  user_id?: string;
  device_id?: string;
}

export interface Event extends EventOptions {
  event_type: string;
  event_properties?: Record<string, any>;
}

export interface IAnalyticsClient {
  track(eventType: string, eventProperties?: Record<string, any>): void;
  track(event: Event): void;
  flush(): void;
}
