import { AmplitudePlugin, AmplitudePluginBase } from "./amplitude-browser";

export interface IExperiment extends AmplitudePlugin {
  fetch(): Promise<boolean>;
  variant(key: string): boolean;
}

export class Experiment extends AmplitudePluginBase implements IExperiment {
  fetch = () => Promise<boolean>.resolve(true);

  variant(key: string): boolean {
    return true;
  }
}

// default instance
export const experiment = new Experiment();
