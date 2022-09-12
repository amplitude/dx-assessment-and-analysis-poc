import { PluginConfig } from "./plugin";
import { Config } from "./config";
import { Logger, systemLogger } from "./logger";
import { AmplitudePlugin, Timeline } from "./plugin";
import { AtLeast } from "../../../util";
import { hub } from "./hub";

export type AmplitudeLoadOptions = AtLeast<AmplitudeConfig, 'apiKey'>;

export interface AmplitudeConfig extends Config {
  configuration?: Record<string, any>;
  plugins?: AmplitudePlugin[];
}

export const getDefaultAmplitudeConfig = (): Omit<AmplitudeConfig, 'apiKey'> => ({
  logger: new Logger(),
  hub,
  disabled: false,
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
      this.timeline.add(plugin, this.getPluginConfig(plugin.name))
    })
  }

  addPlugin(plugin: AmplitudePlugin, pluginConfig?: any) {
    if (this.assertIsInitialized()) {
      this.timeline.add(plugin, this.getPluginConfig(plugin.name, pluginConfig));
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

  protected getPluginConfig(pluginName: string, pluginConfig?: any): PluginConfig {
    const { configuration, plugins, ...otherConfig } = this.config;
    return {
      ...otherConfig,
      ...configuration?.[pluginName],
      ...pluginConfig,
    };
  };
}
