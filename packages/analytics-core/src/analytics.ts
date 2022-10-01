export interface AnalyticsEventOptions {
  user_id?: string;
  device_id?: string;
}

export interface AnalyticsEvent extends AnalyticsEventOptions {
  event_type: string;
  event_properties?: Record<string, any>;
}

export interface IAnalyticsClient {
  track(eventType: string, eventProperties?: Record<string, any>): void;
  track(event: AnalyticsEvent): void;
  flush(): void;
}

export interface AnalyticsPluginConfig {
  flushIntervalMs: number;
}
