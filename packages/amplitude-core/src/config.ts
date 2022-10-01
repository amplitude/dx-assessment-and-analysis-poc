import { Logger } from "./logger";
import { MessageHub } from "@amplitude/hub";

export interface Config {
  apiKey: string;
  logger: Logger;
  hub?: MessageHub;
  disabled: boolean;
}
