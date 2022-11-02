import { Environment } from "../config";

export class EnvironmentConfig {
  constructor(private model: Record<string, Environment>) {}

  getEnvironments(): Environment[] {
    return Object.values(this.model);
  }

  getEnvironmentNames(): string[] {
    return Object.keys(this.model);
  }

  getProductNames(): string[] {
    // FIXME:
    return ['analytics', 'experiment'];
  }

  getEnvironment(environmentName: string): Environment | undefined {
    return this.model[environmentName];
  }

  getEnvironmentValue(environmentName: string, productName: string) {
    const env = this.model[environmentName];
    return env ? env[productName] : undefined;
  }

  hasEnvironment(name: string): boolean {
    return !!this.model[name];
  }
}
