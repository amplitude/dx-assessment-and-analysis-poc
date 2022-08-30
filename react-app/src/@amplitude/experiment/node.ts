import { AmplitudePlugin, AmplitudePluginBase, AmplitudePluginCategory } from "../amplitude/node";
import { IUser, User } from "../user-browser";
import { UserClient } from "../amplitude/node/client";
import { Config } from "../amplitude/core/config";
import { IExperimentClient } from "./core";
import { analyticsMessage } from "../amplitude/core/bus";

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

  variant(key: string): boolean {
    this.config.logger.log(`[Experiment.variant] ${key}`)

    return key === 'flag-codegen-enabled';
  }

  exposure() {
    this.config.bus?.publish(analyticsMessage({
      category: 'ANALYTICS',
      method: 'TRACK',
      sender: { name: this.plugin.name, version: this.plugin.version },
      event: {
        event_type: 'Exposure',
        user_id: this.user.userId,
        device_id: this.user.deviceId,
        event_properties: {
          someExperimentProperty: true,
        }
      }
    }));
  }
}

export class Experiment extends AmplitudePluginBase implements IExperiment {
  category: AmplitudePluginCategory = 'EXPERIMENT';
  name = 'com.amplitude.experiment.node';
  version = 0;

  user(user: IUser): IExperimentClient {
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
