export interface CliAction {
  run(options: any): Promise<void>
}

export abstract class BaseAction implements CliAction {
  abstract run(options: any): Promise<void>;
}
