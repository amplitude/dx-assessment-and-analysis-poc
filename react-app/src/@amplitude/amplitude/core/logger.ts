export class Logger {
  log(message: string) {
    console.log(message);
  }
  warn(message: string) {
    console.warn(message);
  }
  error(message: string) {
    console.error(message);
  }
}

export const systemLogger = new Logger();