import { Config } from "../core/config";
import { User } from "../../user";
import { AmplitudePluginBase } from "../core/plugin";

export interface BrowserPluginConfig extends Config {
  user: User,
}

export abstract class BrowserAmplitudePluginBase extends AmplitudePluginBase {
  load(config: BrowserPluginConfig) {
    super.load(config);
  }

  protected get config(): BrowserPluginConfig { return this._config! as BrowserPluginConfig};
}
