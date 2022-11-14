import { CodeBlock, CodeGenerator } from "../code-generator";
import { TypeScriptCodeLanguage } from "./TypeScriptCodeModel";
import { jsonSchemaToTypeScript } from "./jsonSchemaToTypeScript";
import { AmplitudeConfig } from "../../config/AmplitudeConfig";

export class UserCodeGenerator implements CodeGenerator {
  constructor(
    protected config: AmplitudeConfig,
    private lang: TypeScriptCodeLanguage = new TypeScriptCodeLanguage()
  ) {}

  async generateUserPropertyType(): Promise<CodeBlock> {
    const userPropertiesType = await jsonSchemaToTypeScript(this.config.user().getUserSchema());

    return new CodeBlock(userPropertiesType);
  }

  async generate(): Promise<CodeBlock> {
    return new CodeBlock()
      .import(`import { User as UserCore } from "@amplitude/user";`)
      .code(`\
/**
 * USER
 */`
      )
      .merge(await this.generateUserPropertyType())
      .code(`\
interface TypedUserMethods {
  setUserProperties(properties: UserProperties): TypedUserMethods;
}

export class User extends UserCore implements Typed<TypedUserMethods> {
  get ${this.config.codegen().getTypedAnchorName()}(): TypedUserMethods {
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



