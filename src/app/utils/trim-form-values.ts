import { FormControl, FormGroup } from '@angular/forms';

export const trimFormValues = (form: FormGroup): void => {
  for (const key of Object.keys(form.controls)) {
    const control = form.get(key);

    if (
      control instanceof FormControl &&
      typeof control.value === 'string' &&
      key !== 'password'
    ) {
      if (key === 'firstName' || key === 'lastName') {
        const name =
          control.value.slice(0, 1).toUpperCase() + control.value.slice(1);

        control.setValue(name, { emitEvent: false });
      }

      if (key === 'postalCode') {
        control.setValue(control.value.toUpperCase(), { emitEvent: false });
      }

      control.setValue(control.value.trim(), { emitEvent: false });
    }
  }
};
