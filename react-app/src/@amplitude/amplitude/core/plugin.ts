import { Config } from "../core/config";

export interface PluginConfig extends Config {
}

export type AmplitudePluginCategory = 'ANALYTICS' | 'EXPERIMENT' | 'USER' | 'CUSTOM';

export interface AmplitudePlugin {
  category: AmplitudePluginCategory;
  load(config: PluginConfig): void;
}

export abstract class AmplitudePluginBase implements AmplitudePlugin {
  abstract category: AmplitudePluginCategory;

  protected _config: PluginConfig | undefined;

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

    if (this.plugins.includes(plugin)) {
      config.logger.warn(`Plugin ${plugin.category} is already added.`)
      return;
    }

    this.plugins.push(plugin)
    plugin.load(config);
  }
}
