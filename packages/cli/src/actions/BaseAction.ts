import { ICON_ERROR_W_TEXT, ICON_INFO, ICON_SUCCESS, ICON_WARNING_W_TEXT } from "../ui/icons";

export interface CliAction {
  run(options: any): Promise<void>
}

export class CliLogger {
  log(message?: any, ...optionalParams: any[]) {
    console.log(message, ...optionalParams);
    return this;
  }

  info(message: string) {
    this.log(`${ICON_INFO} ${message}`)
    return this;
  }

  error(message: string) {
    this.log(`${ICON_ERROR_W_TEXT} ${message}`)
    return this;
  }

  warn(message: string) {
    this.log(`${ICON_WARNING_W_TEXT} ${message}`)
    return this;
  }

  success(message: string) {
    this.log(`${ICON_SUCCESS} ${message}`);
    return this;
  }
}

export abstract class BaseAction implements CliAction {
  protected _logger = new CliLogger();

  abstract run(options: any): Promise<void>;

  logger(): CliLogger {
    return this._logger;
  }
}
