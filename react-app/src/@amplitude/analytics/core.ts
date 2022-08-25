export interface EventOptions {
  user_id?: string;
  device_id?: string;
}

export interface Event extends EventOptions {
  event_type: string;
  event_properties?: Record<string, any>;
}
