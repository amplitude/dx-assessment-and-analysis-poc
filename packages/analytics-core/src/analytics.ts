export interface AnalyticsEventOptions {
  user_id?: string;
  device_id?: string;
}

export interface AnalyticsEvent extends AnalyticsEventOptions {
  event_type: string;
  event_properties?: Record<string, any>;
}

export interface IAnalyticsClient {
  track(eventType: string, eventProperties?: Record<string, any>): Promise<void>;
  track(event: AnalyticsEvent): Promise<void>;
  flush(): Promise<void>;
}

export interface AnalyticsPluginConfig {
  flushIntervalMs: number;
}
