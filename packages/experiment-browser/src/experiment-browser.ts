import { AmplitudePlugin, AmplitudePluginCategory, BrowserAmplitudePluginBase } from "@amplitude/amplitude-browser";
import { User } from "@amplitude/user";
import { IExperimentClient } from "@amplitude/experiment-core";
import { newTrackMessage } from "@amplitude/analytics-messages";

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
