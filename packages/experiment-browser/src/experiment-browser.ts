import {
  AmplitudePlugin,
  AmplitudePluginCategory,
  BrowserAmplitudePluginBase,
  BrowserPluginConfig,
  IUser,
} from "@amplitude/amplitude-browser";
import { IExperimentClient, Variant } from "@amplitude/experiment-core";
import { newTrackMessage } from "@amplitude/analytics-messages";
import {
  Experiment as ExperimentLegacy,
  ExperimentClient as ExperimentClientLegacy, ExperimentUser,
} from "@amplitude/experiment-js-client";
import { userUpdatedMessage } from "@amplitude/user-messages";
import { jsons } from "@amplitude/util";

export type { Variant };
export { IExperimentClient };

export interface IExperiment extends AmplitudePlugin, IExperimentClient {}


function convertToExperimentUser(user: IUser): ExperimentUser {
  return {
    user_id: user.userId,
    device_id: user.deviceId,
    user_properties: user.userProperties
  }
}

export class Experiment extends BrowserAmplitudePluginBase implements IExperiment {
  category: AmplitudePluginCategory = 'EXPERIMENT';
  id = 'com.amplitude.experiment.browser';
  name = 'experiment';
  version = 0;

  private client: ExperimentClientLegacy;
  private apiKey: string;

  load(config: BrowserPluginConfig, pluginConfig?: any) {
    super.load(config, pluginConfig);

    this.apiKey = pluginConfig?.apiKey || config.apiKey;

    // FIXME: Pass in experiment config
    const experimentConfig = undefined;
    this.client = ExperimentLegacy.initialize(this.apiKey, experimentConfig);

    config.hub?.user.subscribe(userUpdatedMessage, message => {
      this.onAcceptableMessage(message.payload, ({ updateType, user}) => {
        switch (updateType) {
          case "user-id":
            this.config.logger.log(`[Experiment.setUserId] ${user.userId}`);
            // FIXME: Should we call setUSer here? Or can we OK just call fetch?
            //this.client.setUser(user);
            // auto fetch variants for new user
            void this.fetch();
            break;

          case "device-id":
            this.config.logger.log(`[Experiment.setDeviceId] ${user.deviceId}`);
            // FIXME: Should we call setUSer here? Or can we OK just call fetch?
            //this.client.setUser(user);
            // auto fetch variants for new user
            void this.fetch();
            break;

          case "user-properties":
            this.config.logger.log(`[Experiment.setUserProperties] ${jsons(user.userProperties)}`);
            // FIXME: Should we call setUSer here? Or can we OK just call fetch?
            //this.client.setUser(user);
            void this.fetch();
            break;
        }
      })
    })
  }

  fetch = (user?: IUser) => {
    // We can access the current user using the PluginConfig
    const u = user ?? this.config.user;

    this.config.logger.log(`[Experiment.fetch] user=${u}`)

    return this.client.fetch(convertToExperimentUser(u));
  }

  variant(key: string, fallback?: string): Variant | string {
    this.config.logger.log(`[Experiment.variant] ${key}`)

    return this.client.variant(key, fallback);
  }

  exposure() {
    /**
     * Publish event on central bus.
     *
     * If analytics plugins are load()'ed then they will pick up on the event
     */
    this.config.hub?.analytics.publish(newTrackMessage(this, {
        event_type: 'Exposure',
        user_id: this.config.user.userId,
        device_id: this.config.user.deviceId,
        event_properties: {
          someExperimentProperty: true,
        }
    }));
  }
}

// default instance
export const experiment = new Experiment();
