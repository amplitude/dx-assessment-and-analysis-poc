import { AmplitudeConfigModel, CodeGenerationSettings } from "../config";
import { AnalyticsConfig } from "./AnalyticsConfig";
import { ExperimentsConfig } from "./ExperimentsConfig";
import { UserConfig } from "./UserConfig";
import { EnvironmentConfig } from "./EnvironmentConfig";

/**
 * AmplitudeConfig
 */
export class AmplitudeConfig {
  constructor(private model: AmplitudeConfigModel) {}

  analytics(): AnalyticsConfig {
    return new AnalyticsConfig(this.model.analytics);
  }

  codegen(): CodeGenerationSettings {
    return new CodeGenerationSettings(this.model.settings);
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
