import { AbstractControl, ValidationErrors } from '@angular/forms';

export const noSpacesValidator = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;
  if (typeof value !== 'string') return null;

  return value === value.trim() ? null : { noTrimmedSpaces: true };
};
