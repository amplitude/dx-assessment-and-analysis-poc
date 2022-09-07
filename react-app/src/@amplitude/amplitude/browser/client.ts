import { BrowserPluginConfig } from "./plugin";
import { User, user as defaultUser } from "../../user";
import { Amplitude as AmplitudeCore} from "../core/client";

export class Amplitude extends AmplitudeCore {
  protected _user = defaultUser;

  constructor(user = defaultUser) {
    super();
    this._user = user;
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
