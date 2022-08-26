import { AmplitudePlugin, AmplitudePluginBase, AmplitudePluginCategory } from "../amplitude/node";
import { IUser, User } from "../user-browser";
import { UserClient } from "../amplitude/node/client";
import { Config } from "../amplitude/core/config";
import { IExperimentClient } from "./core";

export interface IExperiment extends AmplitudePlugin, UserClient<IExperimentClient> {}

export class ExperimentClient implements IExperimentClient {
  constructor(
    protected user: IUser,
    protected config: Config,
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
}

export class Experiment extends AmplitudePluginBase implements IExperiment {
  category: AmplitudePluginCategory = 'EXPERIMENT';

  user(user: IUser): IExperimentClient {
    return new ExperimentClient(user, this.config);
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
