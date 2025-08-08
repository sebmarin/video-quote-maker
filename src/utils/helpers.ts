export function roundToHalfHour(hours: number): number {
  return Math.ceil(hours * 2) / 2;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function titleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function createSafeFilename(name: string): string {
  return name.replace(/\W+/g, '-').toLowerCase();
}
