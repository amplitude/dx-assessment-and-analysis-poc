import { CodeBlock, CodeBlockTag, CodeGenerator } from "../generators";
import { AmplitudeConfigModel, UserConfigModel } from "../../config";
import { TypeScriptCodeLanguage } from "./TypeScriptCodeModel";
import { JsonSchema } from "../../json-schema";

export function getUserCode(config: AmplitudeConfigModel): CodeBlock {
  return new UserCodeGenerator().generate(config.user);
}

export class UserConfig {
  constructor(private model: UserConfigModel) {}
}

export class UserCodeGenerator implements CodeGenerator<UserConfigModel> {
  constructor(
    private lang: TypeScriptCodeLanguage = new TypeScriptCodeLanguage()
  ) {}

  generate(userConfig: UserConfigModel): CodeBlock {
    const schema = new JsonSchema({ ...userConfig, type: 'object' });

    return new CodeBlock()
      .addAs(CodeBlockTag.Import, `import { User as UserCore } from "@amplitude/user";`)
      .add(`\
/**
 * USER
 */
interface UserProperties {
${schema.getPropertyNames().map(name => this.lang.tab(
  2,`${this.lang.getVariableName(name)}: ${this.lang.getPropertyType(userConfig.properties[name])}`,
)).join(',\n')}
}

interface TypedUserMethods {
  setUserProperties(properties: UserProperties): TypedUserMethods;
}

export class User extends UserCore implements Typed<TypedUserMethods> {
  get typed(): TypedUserMethods {
    const core = this;
    return {
      setUserProperties(properties) {
        core.setUserProperties(properties);
        return this;
      },
    };
  }
}

export const user = new User();`);
  }
}



