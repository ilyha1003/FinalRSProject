import { AbstractControl, ValidationErrors } from '@angular/forms';

export const strengthPasswordValidator = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const isUpperCase = /[A-Z]/.test(value);
  const isLowerCase = /[a-z]/.test(value);
  const isNumber = /\d/.test(value);

  const isValid = isUpperCase && isLowerCase && isNumber;

  return isValid ? null : { passwordStrength: true };
};
