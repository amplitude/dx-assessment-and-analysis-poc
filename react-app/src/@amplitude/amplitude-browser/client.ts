import { User, user as defaultUser} from "../user-browser";
import { AmplitudePlugin, PluginConfig, Timeline } from "./plugin";
import { AtLeast } from "../../util";
import { Logger, systemLogger } from "./logger";

export type AmplitudeLoadOptions = AtLeast<AmplitudeConfig, 'apiKey'>;

export interface AmplitudeConfig extends PluginConfig {
  plugins?: AmplitudePlugin[];
}

export const getDefaultAmplitudeConfig = (): Omit<AmplitudeConfig, 'apiKey'> => ({
  logger: new Logger(),
});

export class Amplitude {
  protected _user = defaultUser;

  private _config: AmplitudeConfig | undefined;
  private timeline: Timeline;

  constructor(user = defaultUser) {
    this.timeline = new Timeline();
    this._user = user;
  }

  load(config: AtLeast<AmplitudeConfig, 'apiKey'>) {
    this._config = {
      ...getDefaultAmplitudeConfig(),
      ...config
    };
    this._config.plugins?.forEach(plugin => {
      this.timeline.add(plugin, this.config)
    })
  }

  get user(): User {
    return this._user;
  }

  addPlugin(plugin: AmplitudePlugin) {
    if (this.assertIsInitialized()) {
      this.timeline.add(plugin, this.config);
    }
  }

  isLoaded = () => !!this._config;

  protected get config() { return this._config! };

  private assertIsInitialized(): boolean {
    if (this.isLoaded()) {
      return true;
    }
    systemLogger.log('Amplitude is not yet initialized');

    return false;
  }
}

export const amplitude = new Amplitude();
