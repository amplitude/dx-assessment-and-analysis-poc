import { AmplitudeMessage, createEventDefinition } from "@amplitude/hub";
import { IUser, AmplitudePlugin } from "@amplitude/amplitude-core";

export type { IUser };

export const MessageTypes = {
  UserUpdated: 'user-updated',
  SessionStarted: 'session-started',
  SessionEnded: 'session-ended',
}

export interface UserMessage extends AmplitudeMessage {
  user: IUser;
}

/**
 * USER
 */

/**
 * User updates
 */
export const userUpdatedMessage = createEventDefinition<UserMessage>()(MessageTypes.UserUpdated);

export const newUserUpdatedMessage = (sender: AmplitudePlugin, user: IUser) => userUpdatedMessage({
  sender: { name: sender.name, version: sender.version },
  user
})

/**
 * SESSION
 */

/**
 * Session started
 */
export const sessionStartedMessage = createEventDefinition<UserMessage>()(MessageTypes.SessionStarted);

export const newSessionStartedMessage = (sender: AmplitudePlugin, user: IUser) => sessionStartedMessage({
  sender: { name: sender.name, version: sender.version },
  user
})

/**
 * Session ended
 */
export const sessionEndedMessage = createEventDefinition<UserMessage>()(MessageTypes.SessionEnded);

export const newSessionEndedMessage = (sender: AmplitudePlugin, user: IUser) => sessionEndedMessage({
  sender: { name: sender.name, version: sender.version },
  user
})
