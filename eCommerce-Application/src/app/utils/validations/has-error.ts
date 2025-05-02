import { FormGroup } from '@angular/forms';

export const hasError = (form: FormGroup, controlName: string): boolean => {
  const control = form.get(controlName);
  if (!control || control.valid) return false;

  const hasRequiredError = control.hasError('required');

  return hasRequiredError ? control.dirty : control.dirty || control.touched;
};
