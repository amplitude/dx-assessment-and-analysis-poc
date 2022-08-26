import { BrowserPluginConfig } from "./plugin";
import { User, user as defaultUser } from "../../user-browser";
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

  protected getPluginConfig = (): BrowserPluginConfig => ({
    ...this.config,
    user: this._user,
  });
}

export const amplitude = new Amplitude();
