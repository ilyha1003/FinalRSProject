import { FormGroup } from '@angular/forms';

export const hasError = (form: FormGroup, controlName: string): boolean => {
  const control = form.get(controlName);
  return !!(control && control.invalid && (control.dirty || control.touched));
};
