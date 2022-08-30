import { Config } from "../core/config";
import { AmplitudeMessage } from "./bus";

export interface PluginConfig extends Config {
}

export type AmplitudePluginCategory = 'ANALYTICS' | 'EXPERIMENT' | 'USER' | 'CUSTOM';

export interface AmplitudePlugin {
  category: AmplitudePluginCategory;
  name: string;
  version: number;
  load(config: PluginConfig): void;
}

export abstract class AmplitudePluginBase implements AmplitudePlugin {
  abstract category: AmplitudePluginCategory;
  abstract name: string;
  abstract version: number;

  protected _config: PluginConfig | undefined;

  load(config: PluginConfig) {
    this._config = config;
    config.logger.log(`[${this.name}] load()`)
  }

  protected get config() { return this._config! };

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
