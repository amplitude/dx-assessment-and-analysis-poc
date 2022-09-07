import { AmplitudePlugin, AmplitudePluginCategory } from "../amplitude/browser";
import { User } from "../user";
import { BrowserAmplitudePluginBase } from "../amplitude/browser/plugin";
import { IExperimentClient } from "./core";
import { analyticsMessage } from "../amplitude/core/bus";

export interface IExperiment extends AmplitudePlugin, IExperimentClient {}

export class Experiment extends BrowserAmplitudePluginBase implements IExperiment {
  category: AmplitudePluginCategory = 'EXPERIMENT';
  id = 'com.amplitude.experiment.browser';
  name = 'experiment';
  version = 0;

  fetch = (user?: User) => {
    // We can access the current user using the PluginConfig
    const u = user ?? this.config.user;

    this.config.logger.log(`[Experiment.fetch] user=${u}`)
  }

  variant(key: string): boolean {
    this.config.logger.log(`[Experiment.variant] ${key}`)

    return key === 'flag-codegen-enabled';
  }

  exposure() {
    /**
     * Publish event on central bus.
     *
     * If analytics plugins are load()'ed then they will pick up on the event
     */
    this.config.bus?.publish(analyticsMessage({
      category: 'ANALYTICS',
      method: 'TRACK',
      sender: { name: this.name, version: this.version },
      event: {
        event_type: 'Exposure',
        user_id: this.config.user.userId,
        device_id: this.config.user.deviceId,
        event_properties: {
          someExperimentProperty: true,
        }
      }
    }));
  }
}

// default instance
export const experiment = new Experiment();
