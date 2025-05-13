import { FormControl, FormGroup } from '@angular/forms';

export const trimFormValues = (form: FormGroup): void => {
  for (const key of Object.keys(form.controls)) {
    const control = form.get(key);

    if (
      control instanceof FormControl &&
      typeof control.value === 'string' &&
      key !== 'password'
    ) {
      control.setValue(control.value.trim(), { emitEvent: false });
    }
  }
};
