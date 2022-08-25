import { Config } from "./config";
import { User } from "../user-browser";

export interface PluginConfig extends Config {
  user: User,
}

export type AmplitudePluginCategory = 'ANALYTICS' | 'EXPERIMENT' | 'USER' | 'CUSTOM';

export interface AmplitudePlugin {
  category: AmplitudePluginCategory;
  load(config: PluginConfig): void;
}

export abstract class AmplitudePluginBase implements AmplitudePlugin {
  abstract category: AmplitudePluginCategory;

  private _config: PluginConfig | undefined;

  load(config: PluginConfig) {
    this._config = config;
    config.logger.log(`[AmplitudePluginBase.load]`)
  }

  protected get config() { return this._config! };

  protected get logger() { return this.config.logger };
}

export type PluginAction = {

}

export class Timeline {
  constructor(
    private plugins: AmplitudePlugin[] = []
  ) {}

  add(plugin: AmplitudePlugin, config: PluginConfig) {
    config.logger.log(`[Timeline.add] ${plugin.category}`); // eslint-disable-line no-console
    plugin.load(config);
    this.plugins.push(plugin)
  }
}
