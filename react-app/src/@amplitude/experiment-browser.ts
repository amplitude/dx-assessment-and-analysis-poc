import { AmplitudePlugin, AmplitudePluginCategory } from "./amplitude/browser";
import { User } from "./user-browser";
import { BrowserAmplitudePluginBase } from "./amplitude/browser/plugin";

export interface IExperiment extends AmplitudePlugin {
  fetch(): void;
  variant(key: string): boolean;
}

export class Experiment extends BrowserAmplitudePluginBase implements IExperiment {
  category: AmplitudePluginCategory = 'EXPERIMENT';

  fetch = (user?: User) => {
    // We can access the current user using the PluginConfig
    const u = user ?? this.config.user;

    this.config.logger.log(`[Experiment.fetch] user=${u}`)
  }

  variant(key: string): boolean {
    this.config.logger.log(`[Experiment.variant] ${key}`)

    return key === 'flag-codegen-enabled';
  }
}

// default instance
export const experiment = new Experiment();
