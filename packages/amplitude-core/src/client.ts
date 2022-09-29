import { AtLeast } from "@amplitude/util";
import { hub } from "@amplitude/hub";
import { PluginConfig } from "./plugin";
import { Config } from "./config";
import { NoLogger, systemLogger } from "./logger";
import { AmplitudePlugin, Timeline } from "./plugin";

export type AmplitudeLoadOptions = AtLeast<AmplitudeConfig, 'apiKey'>;

export interface AmplitudeConfig extends Config {
  configuration?: Record<string, any>;
  plugins?: AmplitudePlugin[];
}

export const getDefaultAmplitudeConfig = (): Omit<AmplitudeConfig, 'apiKey'> => ({
  logger: new NoLogger(),
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
    if (this._config.logger === undefined) {
      this._config.logger = new NoLogger();
    }
    this.config.plugins?.forEach(plugin => {
      this.timeline.add(plugin, this.getPluginConfig(), this.getPluginSpecificConfig(plugin.name))
    })
  }

  addPlugin(plugin: AmplitudePlugin, pluginConfig?: any) {
    if (this.assertIsInitialized()) {
      this.timeline.add(plugin, this.getPluginConfig(), {
        ...this.getPluginSpecificConfig(plugin.name),
        ...pluginConfig,
      });
    }
  }

  addPluginTyped<T>(plugin: AmplitudePlugin, pluginConfig: T) {
    if (this.assertIsInitialized()) {
      this.timeline.add(plugin, this.getPluginConfig(), {
        ...this.getPluginSpecificConfig(plugin.name),
        ...pluginConfig,
      });
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

  protected getPluginConfig(): PluginConfig {
    const { configuration, plugins, ...otherConfig } = this.config;

    return otherConfig;
  };

  protected getPluginSpecificConfig(pluginName: string): any {
    return this.config.configuration?.[pluginName];
  };
}
