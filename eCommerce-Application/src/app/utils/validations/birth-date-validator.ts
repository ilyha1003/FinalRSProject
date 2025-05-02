import { AbstractControl, ValidationErrors } from '@angular/forms';

export const birthDateValidator = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const birthDate = new Date(value);
  const today = new Date();

  if (birthDate >= today) {
    return { birthDateValidator: 'futureDate' };
  }

  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  const isUnder16 =
    age < 16 ||
    (age === 16 && monthDiff < 0) ||
    (age === 16 && monthDiff === 0 && dayDiff < 0);

  return isUnder16 ? { birthDateValidator: 'underage' } : null;
};
