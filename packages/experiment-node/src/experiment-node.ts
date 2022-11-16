import {
  AmplitudePlugin, AmplitudePluginBase, AmplitudePluginCategory, UserClient, Config, PluginConfig,
} from "@amplitude/amplitude-node";
import { IUser, User } from "@amplitude/user";
import { IExperimentClient, Variant } from "@amplitude/experiment-core";
import { newTrackMessage } from "@amplitude/analytics-messages";
import {
  Experiment as ExperimentLegacy,
  RemoteEvaluationClient as RemoteEvaluationClientLegacy,
  ExperimentUser,
  Variants as VariantsLegacy
} from "@amplitude/experiment-node-server";
import { jsons } from "@amplitude/util";

export type { Variant };
export { IExperimentClient };

function convertToExperimentUser(user: IUser): ExperimentUser {
  return {
    user_id: user.userId,
    device_id: user.deviceId,
    user_properties: user.userProperties
  }
}

export interface IExperiment extends AmplitudePlugin, UserClient<IExperimentClient> {}

export class ExperimentClient implements IExperimentClient {
  private variants: VariantsLegacy = {};

  constructor(
    protected user: IUser,
    protected config: Config,
    private plugin: AmplitudePlugin,
    private client: RemoteEvaluationClientLegacy,
  ) {}

  fetch = async (user?: User) => {
    // We can access the current user using the PluginConfig
    const u = user ?? this.user;

    this.config.logger.log(`[Experiment.fetch] user=${u.userId}`)

    this.variants = await this.client.fetch(convertToExperimentUser(u))
  }

  variant(key: string, fallback?: string): Variant | string {
    this.config.logger.log(`[Experiment.variant] key=${key} fallback=${fallback}`)

    const v = this.variants[key] ?? fallback;

    this.config.logger.log(`[Experiment.variant] ${key}=${jsons(v)}`)

    return v;
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

  private apiKey: string;
  public client: RemoteEvaluationClientLegacy;

  load(config: PluginConfig, pluginConfig?: any) {
    super.load(config, pluginConfig);

    this.apiKey = pluginConfig.apiKey ?? config.apiKey;

    this.client = ExperimentLegacy.initializeRemote(this.apiKey, {
      fetchTimeoutMillis: 500,
      fetchRetries: 1,
      fetchRetryBackoffMinMillis: 0,
      fetchRetryTimeoutMillis: 500,
    });
  }

  user(user: User): IExperimentClient {
    user.load(this.config)

    return new ExperimentClient(user, this.config, this, this.client);
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
