import { CodeBlock, CodeBlockTag, CodeGenerator } from "../code-generator";
import { UserConfigModel } from "../../config";
import { TypeScriptCodeLanguage } from "./TypeScriptCodeModel";
import { JsonSchemaPropertyModel } from "../../json-schema";
import { jsonSchemaToTypeScript } from "./jsonSchemaToTypeScript";

export class UserConfig {
  constructor(private model: UserConfigModel) {}

  getUserSchema(): JsonSchemaPropertyModel {
    return {
      type: 'object',
      title: 'User Properties',
      additionalProperties: false,
      ...this.model
    };
  }
}

export class UserCodeGenerator implements CodeGenerator<UserConfigModel> {
  private config: UserConfig;

  constructor(
    private configModel: UserConfigModel,
    private lang: TypeScriptCodeLanguage = new TypeScriptCodeLanguage()
  ) {
    this.config = new UserConfig(configModel);
  }

  async generateUserPropertyType(): Promise<CodeBlock> {
    const userPropertiesType = await jsonSchemaToTypeScript(this.config.getUserSchema());

    return new CodeBlock(userPropertiesType);
  }

  async generate(): Promise<CodeBlock> {
    return new CodeBlock()
      .addAs(CodeBlockTag.Import, `import { User as UserCore } from "@amplitude/user";`)
      .add(`\
/**
 * USER
 */`
      )
      .merge(await this.generateUserPropertyType())
      .add(`\
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



