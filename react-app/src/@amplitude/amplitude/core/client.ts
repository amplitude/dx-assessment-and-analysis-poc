import { PluginConfig } from "./plugin";
import { Config } from "./config";
import { Logger, systemLogger } from "./logger";
import { AmplitudePlugin, Timeline } from "./plugin";
import { AtLeast } from "../../../util";

export type AmplitudeLoadOptions = AtLeast<AmplitudeConfig, 'apiKey'>;

export interface AmplitudeConfig extends Config {
  plugins?: AmplitudePlugin[];
}

export const getDefaultAmplitudeConfig = (): Omit<AmplitudeConfig, 'apiKey'> => ({
  logger: new Logger(),
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
    this._config.plugins?.forEach(plugin => {
      this.timeline.add(plugin, this.getPluginConfig())
    })
  }

  addPlugin(plugin: AmplitudePlugin) {
    if (this.assertIsInitialized()) {
      this.timeline.add(plugin, this.getPluginConfig());
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

  protected getPluginConfig = (): PluginConfig => ({
    ...this.config
  });
}
