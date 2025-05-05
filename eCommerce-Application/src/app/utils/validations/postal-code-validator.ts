import { AbstractControl, ValidationErrors } from '@angular/forms';

export const postalCodeValidator = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;
  if (!value || !control.parent) return null;

  const country = control.parent.get('country')?.value;

  const patterns: { [key: string]: { regex: RegExp; format: string } } = {
    US: { regex: /^\d{5}(-\d{4})?$/, format: '12345 or 12345-6789' },
    CA: { regex: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/, format: 'A1B 2C3' },
    GB: { regex: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i, format: 'SW1A 1AA' },
    DE: { regex: /^\d{5}$/, format: '12345' },
    FR: { regex: /^\d{5}$/, format: '75008' },
    IT: { regex: /^\d{5}$/, format: '00100' },
    AU: { regex: /^\d{4}$/, format: '2000' },
    JP: { regex: /^\d{3}-\d{4}$/, format: '100-0001' },
    NL: { regex: /^\d{4} ?[A-Za-z]{2}$/, format: '1234 AB' },
    SE: { regex: /^\d{5}$/, format: '11455' },
    BR: { regex: /^\d{5}-?\d{3}$/, format: '01001-000' },
  };

  const pattern = patterns[country];

  if (!pattern) return null;

  const isValid = pattern.regex.test(value);

  return isValid ? null : { invalidPostalCode: pattern.format };
};
