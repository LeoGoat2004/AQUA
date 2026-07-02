import ejs from 'ejs';
import fs from 'fs-extra';
import path from 'path';

export interface GeneratorContext {
  projectName: string;
  description: string;
  version: string;
  llm: {
    provider: string;
    model: string;
    apiKey?: string;
  };
  agents: Array<{
    id: string;
    name: string;
    type: string;
    enabled: boolean;
    skills: string[];
  }>;
  skills: Array<{
    id: string;
    name: string;
    enabled: boolean;
  }>;
  tools: Array<{
    id: string;
    name: string;
    enabled: boolean;
  }>;
}

export class CodeGenerator {
  private templatesDir: string;

  constructor(templatesDir?: string) {
    this.templatesDir = templatesDir || path.join(process.cwd(), 'src', 'core', 'templates');
  }

  async generate(context: GeneratorContext, outputDir: string): Promise<void> {
    await fs.ensureDir(outputDir);

    const files = await this.listTemplates();

    for (const templateFile of files) {
      const outputPath = this.getOutputPath(templateFile, outputDir);
      await fs.ensureDir(path.dirname(outputPath));

      const template = await fs.readFile(path.join(this.templatesDir, templateFile), 'utf-8');
      const content = await ejs.render(template, context, {
        rmWhitespace: true,
      });

      await fs.writeFile(outputPath, content);
    }
  }

  private async listTemplates(): Promise<string[]> {
    const files: string[] = [];

    const walk = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.name.endsWith('.ejs')) {
          files.push(path.relative(this.templatesDir, fullPath));
        }
      }
    };

    if (await fs.pathExists(this.templatesDir)) {
      await walk(this.templatesDir);
    }

    return files;
  }

  private getOutputPath(templatePath: string, outputDir: string): string {
    return path.join(outputDir, templatePath.replace(/\.ejs$/, ''));
  }
}

export async function generateWorkbench(
  config: GeneratorContext,
  outputDir: string
): Promise<void> {
  const generator = new CodeGenerator();
  await generator.generate(config, outputDir);
}
