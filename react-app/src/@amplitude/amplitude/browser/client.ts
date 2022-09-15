import { BrowserPluginConfig } from "./plugin";
import { User, user as defaultUser } from "../../user";
import { Amplitude as AmplitudeCore, AmplitudeConfig } from "../core/client";
import { AtLeast } from "../../../util";

export class Amplitude extends AmplitudeCore {
  protected _user;

  constructor(user = defaultUser) {
    super();
    this._user = user;
  }

  override load(config: AtLeast<AmplitudeConfig, "apiKey">) {
    super.load({
      ...config,
      // Auto register the User plugin in single-tenant
      plugins: config.plugins
        ? [this._user, ...config.plugins]
        : [this._user],
    });
  }

  get user(): User {
    return this._user;
  }

  protected override getPluginConfig = (pluginName: string): BrowserPluginConfig => ({
    ...super.getPluginConfig(pluginName),
    user: this.user,
  });
}

export const amplitude = new Amplitude();
