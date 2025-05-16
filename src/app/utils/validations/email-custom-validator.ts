import { AbstractControl, ValidationErrors } from '@angular/forms';

export const customEmailValidator = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return emailRegex.test(value) ? null : { customEmailValidator: true };
};
