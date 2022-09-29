import { AmplitudePluginCategory, BrowserAmplitudePluginBase, BrowserPluginConfig } from "@amplitude/amplitude-browser";
import { User } from "@amplitude/user";
import { userUpdatedMessage } from "@amplitude/user-messages";
import { newTrackMessage } from "../analytics/messages";
import { IExperiment } from "../experiment/browser";
// import * as LDClient from 'launchdarkly-js-client-sdk';

const LDClient = {
  LDClient: {} as any,
  initialize: (apiKey: string, user: LaunchDarklyUser) => undefined,
};

export interface LaunchDarklyUser {
  key: string;
}

export interface LaunchDarklyConfig {
  apiKey: string;
  userKey?: string;
}

export class LaunchDarklyExperiment extends BrowserAmplitudePluginBase implements IExperiment {
  category: AmplitudePluginCategory = 'EXPERIMENT';
  id = 'com.launchdarkly.experiment.browser';
  name = 'launchdarkly';
  version = 0;

  private client: any; // LDClient.LDClient | undefined;
  private _user: LaunchDarklyUser | undefined;

  load(config: BrowserPluginConfig, launchDarklyConfig: LaunchDarklyConfig) {
    super.load(config, launchDarklyConfig);
    if (!launchDarklyConfig) {
      this.config.logger.error(`Unable to load ${this.name}. Additional configuration required.`);
      return;
    }

    this._user = launchDarklyConfig.userKey
      ? { key: launchDarklyConfig.userKey }
      : this.getLdUserFromAmplitudeUser(this.config.user);

    this.updateLdClient();

    // Hook into user updates
    config.hub?.user.subscribe(userUpdatedMessage, message => {
      this.onAcceptableMessage(message.payload, ({ user }) => {
        this.fetch(user as User);
      });
    })
  }

  fetch = (user?: User) => {
    // We can access the current user using the PluginConfig
    this._user = user ? this.getLdUserFromAmplitudeUser(user) : this._user;

    this.config.logger.log(`[${this.name}.fetch] user=${this._user}`)

    this.updateLdClient();
  }

  variant(key: string): boolean {
    this.config.logger.log(`[${this.name}.variant] ${key}`)

    return this.client?.variation(key);
  }

  exposure() {
    this.config.logger.log(`[${this.name}.exposure]`)
    /**
     * Publish event on central bus.
     *
     * If analytics plugins are load()'ed then they will pick up on the event
     */
    this.config.hub?.analytics.publish(newTrackMessage(this, {
        event_type: 'Launch Darkly Exposure',
        user_id: this.config.user.userId,
        device_id: this.config.user.deviceId,
        event_properties: {
          someLaunchDarklyProperty: true,
        }
    }));
  }

  private updateLdClient() {
    if (this._user) {
      this.client = LDClient.initialize(this.getPluginConfig<LaunchDarklyConfig>().apiKey, this._user);
    } else {
      this.config.logger.warn(`[${this.name}] User required to create LD client.`)
    }
  }

  private getLdUserFromAmplitudeUser(user: User) {
    const key = user.userId || user.deviceId || 'unknown-key';
    return {
      key
    };
  }
}

// default instance
export const experiment = new LaunchDarklyExperiment();
