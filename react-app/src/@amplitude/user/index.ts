import { AmplitudePluginBase, AmplitudePluginCategory } from "../amplitude/browser";
import { IUser } from "../amplitude/core/user";
import { isEmpty, jsons } from "../../util";
import { newUserUpdatedMessage } from "./messages";

export type { IUser } from '../amplitude/core/user'

export class User extends AmplitudePluginBase implements IUser {
  category: AmplitudePluginCategory = 'USER';
  id = 'com.amplitude.user';
  name = 'user';
  version = 0;

  constructor(
    private _userId?: string,
    private _deviceId?: string,
    private _userProperties: Record<string, any> = {},
    private _groups: Record<string, string | string[]> = {},
    private _groupProperties: Record<string, Record<string, any>> = {}, // { 'groupName:groupValue', { gProp: true } }
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
    const changed = (userId !== this._userId);
    if (changed) {
      this._userId = userId;
      this.config.hub?.user.publish(newUserUpdatedMessage(this, this));
    }
  }

  setDeviceId(deviceId: string) {
    const changed = (deviceId !== this._deviceId);
    if (changed) {
      this._deviceId = deviceId;
      this.config.hub?.user.publish(newUserUpdatedMessage(this, this));
    }
  }

  setUserProperties(userProperties: Record<string, any>) {
    this._userProperties = userProperties;
    this.config.hub?.user.publish(newUserUpdatedMessage(this, this));
  }

  setGroup(groupName: string, groupValue: string) {
    this._groups[groupName] = this._groups[groupName]
      ? this._groups[groupName].concat(groupValue)
      : [groupValue];
    this.config.hub?.user.publish(newUserUpdatedMessage(this, this));
  }

  setGroupProperties(groupName: string, groupValue: string, groupProperties: Record<string, any>) {
    this._groupProperties[`${groupName}:${groupValue}`] = groupProperties;
    this.config.hub?.user.publish(newUserUpdatedMessage(this, this));
  }

  toString():string {
    const userProps = !isEmpty(this._userProperties) ? ` userProperties=${jsons(this._userProperties)}` : '';
    const groups = !isEmpty(this._groups) ? ` groups=${jsons(this._groups)}` : '';
    const groupProps = !isEmpty(this._groupProperties) ? ` groupProperties=${jsons(this._groupProperties)}` : '';
    return `User { userId=${this.userId} deviceId=${this.deviceId}${userProps}${groups}${groupProps} }`;
  }
}

// default instance
export const user = new User();
