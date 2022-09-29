import { AnalyticsEvent, IAnalyticsClient } from "./core";
import {
  AmplitudePlugin, AmplitudePluginBase, AmplitudePluginCategory, UserClient, Config,
} from "@amplitude/amplitude-node";
import { User } from "@amplitude/user";
import { jsons } from "@amplitude/util";
import { trackMessage } from "./messages";

export type { AnalyticsEvent };

export interface IAnalytics extends AmplitudePlugin, UserClient<IAnalyticsClient> {}

export class AnalyticsClient implements IAnalyticsClient {
  constructor(
    protected user: User,
    protected config: Config,
  ) {}

  track(eventType: string | AnalyticsEvent, eventProperties?: Record<string, any>) {
    const event = (typeof eventType === 'string')
      ? { event_type: eventType, event_properties: eventProperties }
      : eventType;

    event.user_id = event.user_id ?? this.user.userId;
    event.device_id = event.device_id ?? this.user.deviceId;

    this.config.logger.log(`[Analytics.track] ${jsons(event)}`);
  }

  flush() {
    this.config.logger.log(`[Analytics.flush]`);
  }
}

export class Analytics extends AmplitudePluginBase implements IAnalytics {
  category: AmplitudePluginCategory = 'ANALYTICS';
  id = 'com.amplitude.analytics.node';
  name = 'analytics';
  version = 0;

  user(user: User): IAnalyticsClient {
    user.load(this.config);

    const client = new AnalyticsClient(user, this.config);

    this.config.hub?.analytics.subscribe(trackMessage, message => {
      this.onAcceptableMessage(message.payload, ({event}) => {
        client.track(event)
      })
    });

    return client;
  }

  userId(userId: string): IAnalyticsClient {
    return this.user(new User(userId));
  }

  deviceId(deviceId: string): IAnalyticsClient {
    return this.user(new User(undefined, deviceId));
  }
}

// default instance
export const analytics = new Analytics();
