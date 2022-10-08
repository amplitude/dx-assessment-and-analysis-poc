import { compile, Options } from "json-schema-to-typescript";
import { JsonSchemaPropertyModel } from "../../json-schema";

export async function jsonSchemaToTypeScript(
  schema: JsonSchemaPropertyModel,
  name?: string,
  options: Partial<Options> = {
    bannerComment: '',
    additionalProperties: false
  }
): Promise<string> {
  return compile(schema, name, options);
}
