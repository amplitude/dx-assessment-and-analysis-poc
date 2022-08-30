import { Logger } from "./logger";
import { EventBus } from "./bus";

export interface Config {
  apiKey: string;
  logger: Logger;
  bus?: EventBus;
}
