/**
 * WIP - Audiences
 *
 * Separate out Group functionality into its own Plugin
 */

import { AmplitudePluginBase, AmplitudePluginCategory, IUser } from "@amplitude/amplitude-browser";
import { isEmpty, jsons } from "@amplitude/util";

export type { IUser };

export interface IGroup {
  setGroupName(groupName: string): void;
  setGroupValue(groupValue: string | string[]): void;
  setGroupProperties(groupProperties: Record<string, any>): void;
}

export interface IAudiences {
  setGroup(user: IUser, group: IGroup): void;
}

export class Group implements IGroup {
  private _groupValues;

  constructor(
    public groupName: string,
    groupValue: string | string[],
    private _groupProperties: Record<string, Record<string, any>> = {}, // { 'groupName:groupValue', { gProp: true } }

  ) {
    this._groupValues = typeof groupValue === 'string' ? [groupValue] : [...groupValue];
  }

  get groupValues(): string[] {
    return this._groupValues;
  }

  setGroupName(groupName: string) {
    this.groupName = groupName;
  }

  setGroupValue(groupValue: string | string[]) {
    this._groupValues = typeof groupValue === 'string' ? [groupValue] : [...groupValue];
  }

  setGroupProperties(groupProperties: Record<string, any>) {
    this._groupProperties = groupProperties;
  }

  toString():string {
    const groupProps = !isEmpty(this._groupProperties) ? ` groupProperties=${jsons(this._groupProperties)}` : '';
    return `Group { name=${this.groupName} value=${this._groupValues}${groupProps} }`;
  }
}

export class Audiences extends AmplitudePluginBase implements IAudiences {
  category: AmplitudePluginCategory = 'USER';
  id = 'com.amplitude.audiences';
  name = 'audiences';
  version = 0;

  constructor() {
    super();
  }

  setGroup(user: IUser, group: IGroup) {
    // make API call to assign user to group
    this.config.logger.log('[Audiences] setGroup')
  }
}

// default instance
export const audiences = new Audiences();
