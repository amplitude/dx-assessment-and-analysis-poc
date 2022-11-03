import { AnalyticsConfig, AnalyticsConfigModel } from "./AnalyticsConfig";
import { ExperimentsConfig, ExperimentsConfigModel } from "./ExperimentsConfig";
import { UserConfig, UserConfigModel } from "./UserConfig";
import { Environment, EnvironmentConfig } from "./EnvironmentConfig";
import { CodeGenerationConfig, CodeGenerationConfigModel } from "./CodeGenerationConfig";


export interface AmplitudeConfigModel {
  settings: CodeGenerationConfigModel;
  environments: Record<string, Environment>;
  user: UserConfigModel;
  analytics?: AnalyticsConfigModel;
  experiments?: ExperimentsConfigModel;
}

/**
 * AmplitudeConfig
 */
export class AmplitudeConfig {
  constructor(private model: AmplitudeConfigModel) {}

  analytics(): AnalyticsConfig {
    return new AnalyticsConfig(this.model.analytics);
  }

  codegen(): CodeGenerationConfig {
    return new CodeGenerationConfig(this.model.settings);
  }

  environment(): EnvironmentConfig {
    return new EnvironmentConfig(this.model.environments);
  }

  experiment(): ExperimentsConfig {
    return new ExperimentsConfig(this.model.experiments);
  }

  user(): UserConfig {
    return new UserConfig(this.model.user);
  }
}
