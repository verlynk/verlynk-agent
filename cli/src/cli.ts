import { VerlynkApiError } from './api.js';

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

/**
 * Like `fail()`, but when `jsonMode` is true prints a single JSON object with
 * `errorCode`/`retryable`/`action` (when present) instead of `Error: ...` text —
 * agents must not scrape free-form error strings.
 */
export function failJson(err: unknown, jsonMode: boolean): never {
  if (jsonMode) {
    if (err instanceof VerlynkApiError) {
      console.error(
        JSON.stringify(
          {
            message: err.message,
            ...(err.errorCode ? { errorCode: err.errorCode } : {}),
            ...(err.retryable !== undefined ? { retryable: err.retryable } : {}),
            ...(err.action ? { action: err.action } : {}),
          },
          null,
          2
        )
      );
    } else {
      console.error(
        JSON.stringify(
          {
            message: err instanceof Error ? err.message : String(err),
          },
          null,
          2
        )
      );
    }
    process.exit(1);
  }
  fail(err);
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

