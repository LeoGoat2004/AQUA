import chalk from 'chalk';

export const logger = {
  info(message: string): void {
    console.log(chalk.blue('ℹ'), chalk.white(message));
  },

  success(message: string): void {
    console.log(chalk.green('✓'), chalk.white(message));
  },

  warn(message: string): void {
    console.log(chalk.yellow('⚠'), chalk.yellow(message));
  },

  error(message: string): void {
    console.log(chalk.red('✗'), chalk.red(message));
  },

  debug(message: string): void {
    console.log(chalk.gray('◌'), chalk.gray(message));
  },

  header(message: string): void {
    console.log(chalk.cyan.bold(`\n${message}\n`));
  },

  subheader(message: string): void {
    console.log(chalk.cyan(message));
  },

  dim(message: string): void {
    console.log(chalk.gray(message));
  },

  bullet(message: string, indent = 1): void {
    const spaces = '  '.repeat(indent);
    console.log(`${spaces}${chalk.gray('•')} ${message}`);
  },

  list(items: string[], indent = 1): void {
    items.forEach((item) => this.bullet(item, indent));
  },

 kv(key: string, value: string, indent = 1): void {
    const spaces = '  '.repeat(indent);
    console.log(`${spaces}${chalk.gray(key)}: ${chalk.white(value)}`);
  },

  section(title: string): void {
    console.log(chalk.cyan(`\n${title}`));
    console.log(chalk.gray('─'.repeat(40)));
  },

  table(rows: Array<[string, string]>): void {
    const maxKeyLength = Math.max(...rows.map(([k]) => k.length));
    rows.forEach(([key, value]) => {
      const paddedKey = key.padEnd(maxKeyLength + 2);
      console.log(`  ${chalk.gray(paddedKey)}${chalk.white(value)}`);
    });
  },
};

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
