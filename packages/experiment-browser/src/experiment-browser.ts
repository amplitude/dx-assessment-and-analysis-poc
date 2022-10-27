import {
  AmplitudePlugin,
  AmplitudePluginCategory,
  BrowserAmplitudePluginBase,
  BrowserPluginConfig
} from "@amplitude/amplitude-browser";
import { User } from "@amplitude/user";
import { IExperimentClient, Variant } from "@amplitude/experiment-core";
import { newTrackMessage } from "@amplitude/analytics-messages";
import {
  Experiment as ExperimentLegacy,
  ExperimentClient as ExperimentClientLegacy,
} from "@amplitude/experiment-js-client";

export interface IExperiment extends AmplitudePlugin, IExperimentClient {}

export class Experiment extends BrowserAmplitudePluginBase implements IExperiment {
  category: AmplitudePluginCategory = 'EXPERIMENT';
  id = 'com.amplitude.experiment.browser';
  name = 'experiment';
  version = 0;

  private client: ExperimentClientLegacy;

  load(config: BrowserPluginConfig, pluginConfig?: any) {
    super.load(config, pluginConfig);
    // FIXME: Pass in experiment config
    const experimentConfig = undefined;
    this.client = ExperimentLegacy.initialize(config.apiKey, experimentConfig);
  }

  fetch = (user?: User) => {
    // We can access the current user using the PluginConfig
    const u = user ?? this.config.user;

    this.config.logger.log(`[Experiment.fetch] user=${u}`)
  }

  variant(key: string, fallback?: string): Variant | string {
    this.config.logger.log(`[Experiment.variant] ${key}`)

    // this.client.variant(key, fallback);

    return fallback || 'flag-codegen-enabled';
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
