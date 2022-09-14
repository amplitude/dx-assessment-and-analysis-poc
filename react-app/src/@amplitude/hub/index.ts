import { EventBus } from "ts-bus";

export interface AmplitudeMessage {
  sender: {
    name: string;
    version: number;
  };
}

export { EventBus };

export class MessageHub {
  analytics = new EventBus();
  experiment = new EventBus();
  user = new EventBus();
}

export const hub = new MessageHub();
