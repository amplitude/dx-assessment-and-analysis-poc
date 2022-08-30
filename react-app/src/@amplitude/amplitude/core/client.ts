import { PluginConfig } from "./plugin";
import { Config } from "./config";
import { Logger, systemLogger } from "./logger";
import { AmplitudePlugin, Timeline } from "./plugin";
import { AtLeast } from "../../../util";
import { EventBus } from "./bus";

export type AmplitudeLoadOptions = AtLeast<AmplitudeConfig, 'apiKey'>;

export interface AmplitudeConfig extends Config {
  configuration?: Record<string, any>;
  plugins?: AmplitudePlugin[];
}

export const getDefaultAmplitudeConfig = (): Omit<AmplitudeConfig, 'apiKey'> => ({
  logger: new Logger(),
  bus: new EventBus(),
});

export class Amplitude {
  private _config: AmplitudeConfig | undefined;
  private timeline: Timeline;

  constructor() {
    this.timeline = new Timeline();
  }

  load(config: AtLeast<AmplitudeConfig, 'apiKey'>) {
    this._config = {
      ...getDefaultAmplitudeConfig(),
      ...config
    };
    this.config.plugins?.forEach(plugin => {
      const pluginConfig = this.getPluginConfig(plugin.name);
      this.timeline.add(plugin, this.getPluginConfig(plugin.name))
    })
  }

  addPlugin(plugin: AmplitudePlugin) {
    if (this.assertIsInitialized()) {
      this.timeline.add(plugin, this.getPluginConfig(plugin.name));
    }
  }

  isLoaded = () => !!this._config;

  protected get config() {
    return this._config!
  };

  private assertIsInitialized(): boolean {
    if (this.isLoaded()) {
      return true;
    }
    systemLogger.log('Amplitude is not yet initialized');

    return false;
  }

  protected getPluginConfig(pluginName: string): PluginConfig {
    const { configuration, plugins, ...otherConfig } = this.config;
    return {
      ...otherConfig,
      ...configuration?.[pluginName],
    };
  };
}
