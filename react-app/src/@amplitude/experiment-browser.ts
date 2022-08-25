import { AmplitudePlugin, AmplitudePluginBase, AmplitudePluginCategory } from "./amplitude-browser";
import { User } from "./user-browser";

export interface IExperiment extends AmplitudePlugin {
  fetch(): void;
  variant(key: string): boolean;
}

export class Experiment extends AmplitudePluginBase implements IExperiment {
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
