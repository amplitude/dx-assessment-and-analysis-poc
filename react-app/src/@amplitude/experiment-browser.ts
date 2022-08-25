import { AmplitudePlugin, AmplitudePluginBase, AmplitudePluginCategory } from "./amplitude-browser";

export interface IExperiment extends AmplitudePlugin {
  fetch(): void; //: Promise<boolean>;
  variant(key: string): boolean;
}

export class Experiment extends AmplitudePluginBase implements IExperiment {
  category: AmplitudePluginCategory = 'EXPERIMENT';

  fetch = () => {
    this.config.logger.log(`[Experiment.fetch]`)
    // FIXME: Use current Amplitude user
    // this.config.user.id

    // return Promise<boolean>.resolve(true);
  }

  variant(key: string): boolean {
    this.config.logger.log(`[Experiment.variant] ${key}`)

    return key === 'flag-codegen-enabled';
  }
}

// default instance
export const experiment = new Experiment();
