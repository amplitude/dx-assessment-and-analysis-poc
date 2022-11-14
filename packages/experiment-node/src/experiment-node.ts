import {
  AmplitudePlugin, AmplitudePluginBase, AmplitudePluginCategory, UserClient, Config,
} from "@amplitude/amplitude-node";
import { IUser, User } from "@amplitude/user";
import { IExperimentClient, Variant } from "@amplitude/experiment-core";
import { newTrackMessage } from "@amplitude/analytics-messages";

export type { Variant };
export { IExperimentClient };

export interface IExperiment extends AmplitudePlugin, UserClient<IExperimentClient> {}

export class ExperimentClient implements IExperimentClient {
  constructor(
    protected user: IUser,
    protected config: Config,
    private plugin: AmplitudePlugin,
  ) {}

  fetch = (user?: User) => {
    // We can access the current user using the PluginConfig
    const u = user ?? this.user;

    this.config.logger.log(`[Experiment.fetch] user=${u}`)
  }

  variant(key: string, fallback?: string): Variant | string {
    this.config.logger.log(`[Experiment.variant] ${key}`)

    // this.client.variant(key, fallback);

    return fallback || 'flag-codegen-enabled';
  }

  exposure() {
    this.config.hub?.analytics.publish(newTrackMessage(this.plugin, {
        event_type: 'Exposure',
        user_id: this.user.userId,
        device_id: this.user.deviceId,
        event_properties: {
          someExperimentProperty: true,
        }
    }));
  }
}

export class Experiment extends AmplitudePluginBase implements IExperiment {
  category: AmplitudePluginCategory = 'EXPERIMENT';
  id = 'com.amplitude.experiment.node';
  name = 'experiment';
  version = 0;

  user(user: User): IExperimentClient {
    user.load(this.config)

    return new ExperimentClient(user, this.config, this);
  }

  userId(userId: string): IExperimentClient {
    return this.user(new User(userId));
  }

  deviceId(deviceId: string): IExperimentClient {
    return this.user(new User(undefined, deviceId));
  }
}

// default instance
export const experiment = new Experiment();
