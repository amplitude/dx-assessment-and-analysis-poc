import { AnalyticsEvent, IAnalyticsClient } from "./core";
import { AmplitudePlugin, AmplitudePluginBase, AmplitudePluginCategory } from "../amplitude/browser";
import { jsons } from "../../util";
import { IUser } from "../amplitude/core/user";
import { Config } from "../amplitude/core/config";
import { User } from "../../amplitude/core";
import { UserClient } from "../amplitude/node/client";
import { analyticsMessage } from "../amplitude/core/bus";

export type { AnalyticsEvent };

export interface IAnalytics extends AmplitudePlugin, UserClient<IAnalyticsClient> {}

export class AnalyticsClient implements IAnalyticsClient {
  constructor(
    protected user: IUser,
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

  user(user: IUser): IAnalyticsClient {
    const client = new AnalyticsClient(user, this.config);

    this.config.bus?.subscribe(analyticsMessage, message => {
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
