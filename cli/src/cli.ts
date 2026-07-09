export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, Math.max(0, max - 3)) + '...';
}

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function fail(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`Error: ${msg}`);
  process.exit(1);
}

export function requireYes(argv: { yes?: boolean }, hint: string): void {
  if (argv.yes) return;
  console.error('Error: Confirmation required.');
  console.error(`Re-run with --yes to ${hint}.`);
  process.exit(1);
}

export function isUuid(value: string): boolean {
  // Simple UUID v4-ish check (accepts any UUID version).
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

