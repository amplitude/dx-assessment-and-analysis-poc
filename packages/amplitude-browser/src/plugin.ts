import { Config, AmplitudePluginBase } from "@amplitude/amplitude-core";
import { User } from "@amplitude/user";

export interface BrowserPluginConfig extends Config {
  user: User,
}

export abstract class BrowserAmplitudePluginBase extends AmplitudePluginBase {
  load(config: BrowserPluginConfig, pluginConfig?: any) {
    super.load(config, pluginConfig);
  }

  protected get config(): BrowserPluginConfig { return this._config! as BrowserPluginConfig};
}
