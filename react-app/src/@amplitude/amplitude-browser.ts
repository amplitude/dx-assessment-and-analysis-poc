export class Logger {
  debug() {}
  error() {}
}

export interface AmplitudePlugin {
  load(): void;
  getLogger(): void;
  getEnvironment(): void;
}

export abstract class AmplitudePluginBase {
  load() {}
  getLogger() {}
  getEnvironment() {}
}

export type AmplitudeLoadOptions = {
  apiKey: string;
  logger?: Logger;
  logLevel?: 'info' | 'debug' | 'warn' | 'error';
  plugins?: AmplitudePlugin[];
}

export class Amplitude {
  constructor(
    private logger: Logger = new Logger(),
    private plugins: AmplitudePlugin[] = [],
  ) {}


  load(options: AmplitudeLoadOptions) {
    this.logger = options.logger ?? this.logger;
    this.plugins = options.plugins ?? this.plugins;
  }

  addPlugin(plugin: AmplitudePlugin) {
    this.plugins.push(plugin);
  }
}

export const amplitude = new Amplitude();
