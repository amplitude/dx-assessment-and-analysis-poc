import { Amplitude as AmplitudeCore, AmplitudeConfig } from "@amplitude/amplitude-core";
import { User, user as defaultUser } from '@amplitude/user';
import { AtLeast } from "@amplitude/util";
import { BrowserPluginConfig } from "./plugin";

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

  protected override getPluginConfig = (): BrowserPluginConfig => ({
    ...super.getPluginConfig(),
    user: this.user,
  });
}

export const amplitude = new Amplitude();
