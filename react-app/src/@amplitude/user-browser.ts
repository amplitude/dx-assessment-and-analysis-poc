import { AmplitudePluginBase, AmplitudePluginCategory } from "./amplitude/browser";
import { IUser } from "./amplitude/core/user";

export type { IUser } from './amplitude/core/user'

export class User extends AmplitudePluginBase implements IUser {
  category: AmplitudePluginCategory = 'USER';

  constructor(
    private _userId?: string,
    private _deviceId?: string,
    private _userProperties?: Record<string, any>,
  ) {
    super();
  }

  get userId(): string | undefined {
    return this._userId;
  }

  get deviceId(): string | undefined {
    return this._deviceId;
  }

  setUserId(userId: string) {
    this._userId = userId
  }

  setDeviceId(deviceId: string) {
    this._deviceId = deviceId
  }

  setUserProperties(userProperties: Record<string, any>) {
    this._userProperties = userProperties;
  }

  toString():string {
    return `User { userId: ${this.userId}, deviceId: ${this.deviceId} }`;
  }
}

// default instance
export const user = new User();
