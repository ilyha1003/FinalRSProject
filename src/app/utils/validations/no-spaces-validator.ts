import { AbstractControl, ValidationErrors } from '@angular/forms';

export const noSpacesValidator = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;
  if (typeof value !== 'string') return null;

  return value.trim().length === 0 && value.length > 0
    ? { noSpacesOnly: true }
    : null;
};
