export function isPositiveNumber(string: string): boolean {
  const number = Number(string.trim());
  return string.trim() !== '' && Number.isFinite(number) && number >= 0;
}
