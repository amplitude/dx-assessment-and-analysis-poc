import { AmplitudeMessage } from "@amplitude/hub";
import { jsons } from "@amplitude/util";
import { Config as AmplitudeConfig } from "./config";

export interface PluginConfig extends AmplitudeConfig {
}

export type AmplitudePluginCategory = 'ANALYTICS' | 'EXPERIMENT' | 'USER' | 'CUSTOM';

export interface AmplitudePlugin {
  category: AmplitudePluginCategory;
  id: string;
  name: string;
  version: number;
  load(config: PluginConfig, pluginConfig?: any): void;
}

// export abstract class AmplitudePluginBase<PluginConfigType> implements AmplitudePlugin {
export abstract class AmplitudePluginBase implements AmplitudePlugin {
  abstract category: AmplitudePluginCategory;
  abstract id: string;
  abstract name: string;
  abstract version: number;

  protected _config: PluginConfig | undefined;
  protected _pluginConfig: any | undefined;

  load(config: PluginConfig, pluginConfig?: any) {
    this._config = config;
    this._pluginConfig = pluginConfig;
    config.logger.log(`[${this.name}.load] pluginConfig=${jsons(pluginConfig)}`)
  }

  protected get config() { return this._config! };

  protected getPluginConfig<T>(): T { return this._pluginConfig! as T };

  protected get logger() { return this.config.logger };

  protected onAcceptableMessage<T extends AmplitudeMessage>(message: T, handler: (message: T) => any) {
    const { sender } = message;
    // Events, not from self, and compatible version number
    if (sender.name !== this.name && sender.version === this.version) {
      handler(message);
    }
  }
}

export type PluginAction = {

}

export class Timeline {
  constructor(
    private plugins: AmplitudePlugin[] = []
  ) {}

  add(plugin: AmplitudePlugin, config: PluginConfig, pluginConfig?: any) {
    config.logger.log(`[Timeline.add] ${plugin.category}`); // eslint-disable-line no-console

    if (this.plugins.some(p => p.id === plugin.id)) {
      config.logger.warn(`Plugin id=${plugin.id} is already added. Skipping.`)
      return;
    }

    this.plugins.push(plugin)
    plugin.load(config, pluginConfig);
  }
}
