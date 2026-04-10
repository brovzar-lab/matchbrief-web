// Shared utility functions

/**
 * Formats a date to a readable string.
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Generates a random ID string.
 */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

/**
 * Type-safe exhaustive check for discriminated unions.
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}
