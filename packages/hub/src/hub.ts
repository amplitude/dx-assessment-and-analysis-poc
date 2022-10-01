import { EventBus, createEventDefinition, defineEvent } from 'ts-bus';

export interface AmplitudeMessage {
  sender: {
    name: string;
    version: number;
  };
}

export { EventBus, createEventDefinition, defineEvent };

export class MessageHub {
  analytics = new EventBus();
  experiment = new EventBus();
  user = new EventBus();
}

export const hub = new MessageHub();
