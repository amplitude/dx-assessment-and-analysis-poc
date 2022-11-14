import { CodeBlock, CodeExporter, CodeFile } from "./code-generator";

export class TypeScriptExporter implements CodeExporter {
  async export(codeBlock: CodeBlock): Promise<CodeFile[]> {
    return [{
      path: 'index.ts',
      code: codeBlock.toString(),
    }];
  }
}
