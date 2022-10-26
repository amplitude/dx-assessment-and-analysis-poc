export interface CodeFile {
  path: string;
  code: string;
}

export interface CodeBlockModel {
  code: string;
  tag?: number;
}

export const CodeBlockTag = {
  Default: 0,
  Export: 1,
  Import: 2,
};

function sortByCodeBlockTag(a: CodeBlockModel, b: CodeBlockModel) {
  return b.tag - a.tag;
}

export class CodeBlock {
  protected blocks: CodeBlockModel[];

  constructor(code?: string, tag = CodeBlockTag.Default) {
    this.blocks = code ? [{ tag, code }] : [];
  }

  static from(tag: number, ...code: string[]) {
    return new CodeBlock().addAs(tag, ...code);
  }

  add(code: string, tag = CodeBlockTag.Default): CodeBlock {
    this.blocks.push({tag, code});
    return this;
  }

  addAs(tag: number, ...code: string[]): CodeBlock {
    if (code && code.length > 0) {
      code.forEach(c => this.blocks.push({ tag, code: c }));
    }

    return this;
  }

  merge(...blocks: CodeBlock[]): CodeBlock {
    blocks.forEach(b => {
      this.blocks.push(...b.blocks);
    });
    return this;
  }

  toString() {
    const sortedBlocks = this.blocks.sort(sortByCodeBlockTag);
    const importCode: string[] = [];
    const exportCode: string[] = [];
    const otherCode: string[] = [];

    sortedBlocks.forEach(b => {
      if (b.tag === CodeBlockTag.Import) {
        importCode.push(b.code);
      } else if (b.tag === CodeBlockTag.Export) {
        exportCode.push(b.code);
      } else {
        otherCode.push(b.code);
      }
    })

    return importCode.join('\n')
      .concat('\n\n', exportCode.join(`\n`))
      .concat('\n\n', otherCode.join(`\n\n`));
  }
}

export interface CodeGenerator<C> {
  generate(config: C): Promise<CodeBlock>;
}

export interface CodeExporter {
  export(codeBlock: CodeBlock): Promise<CodeFile[]>;
}