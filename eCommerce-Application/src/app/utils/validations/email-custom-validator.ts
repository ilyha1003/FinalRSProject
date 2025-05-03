import { AbstractControl, ValidationErrors } from '@angular/forms';

export const customEmailValidator = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  return emailRegex.test(value) ? null : { customEmailValidator: true };
};
