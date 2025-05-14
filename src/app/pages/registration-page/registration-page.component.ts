import { Component } from '@angular/core';
import { countries } from '../../utils/countries';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { inputFields } from './input-fields';
import { Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { hasError } from '../../utils/validations/has-error';
import { strengthPasswordValidator } from '../../utils/validations/strength-password-validator';
import { customEmailValidator } from '../../utils/validations/email-custom-validator';
import { RouterModule } from '@angular/router';
import { birthDateValidator } from '../../utils/validations/birth-date-validator';
import { postalCodeValidator } from '../../utils/validations/postal-code-validator';
import { ApiService } from '../../services/api.service';
import { FormModalComponent } from '../../components/form-modal/form-modal.component';
import { RegistrationFormValues } from '../../data/interfaces/form-interfaces';
import { trimFormValues } from '../../utils/trim-form-values';
import { noSpacesValidator } from '../../utils/validations/no-spaces-validator';

@Component({
  selector: 'app-registration-page',
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgClass,
    RouterModule,
    FormModalComponent,
  ],
  templateUrl: './registration-page.component.html',
  styleUrl: './registration-page.component.scss',
})
export class RegistrationPageComponent {
  public profileForm = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      strengthPasswordValidator,
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      customEmailValidator,
    ]),
    firstName: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[A-Za-zА-Яа-яЁё]{1,}$/),
      Validators.maxLength(12),
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[A-Za-zА-Яа-яЁё]{1,}$/),
      Validators.maxLength(12),
    ]),
    birthDate: new FormControl('', [Validators.required, birthDateValidator]),
    country: new FormControl('', [Validators.required]),
    city: new FormControl('', [
      Validators.required,
      Validators.pattern('^[A-Za-zА-Яа-яЁё]+$'),
    ]),
    postalCode: new FormControl('', [
      Validators.required,
      postalCodeValidator,
      noSpacesValidator,
    ]),
    address: new FormControl('', [Validators.required, noSpacesValidator]),
    shippingAddress: new FormControl('', [
      Validators.required,
      noSpacesValidator,
    ]),
    isDefaultAddress: new FormControl(false),
    billingAddress: new FormControl('', [
      Validators.required,
      noSpacesValidator,
    ]),
    isSameAddress: new FormControl(false),
  });

  public countries = countries;
  public inputFields = inputFields;
  public hasError = hasError;
  public isModalShow: boolean = false;
  public modalErrorMessage: string = '';
  public modalHeader: string = '';

  constructor(private router: Router) {}

  public get passwordErrorCount(): number {
    const errors = this.profileForm.get('password')?.errors;
    return errors ? Object.keys(errors).length : 0;
  }

  public get postalCodeErrorCount(): number {
    const errors = this.profileForm.get('postalCode')?.errors;
    return errors ? Object.keys(errors).length : 0;
  }

  public static lockScroll(): void {
    document.body.classList.add('scroll-lock');
  }

  private static async createCustomer(
    formData: RegistrationFormValues,
  ): Promise<{ new_customer_id: string; request_error_message: string }> {
    return ApiService.createNewCustomer(
      formData.email,
      formData.firstName,
      formData.lastName,
      formData.password,
    );
  }

  private static async setCustomerAddress(
    customerId: string,
    formData: RegistrationFormValues,
  ): Promise<void> {
    const address = formData.address.replaceAll(/\s+/g, ' ');

    await ApiService.setAddressesToCustomer(
      customerId,
      formData.firstName,
      formData.lastName,
      formData.country,
      formData.city,
      formData.postalCode,
      address,
    );
  }

  public openModal(message: string, header: string): void {
    this.modalErrorMessage = message;
    this.modalHeader = header;
    this.isModalShow = true;
  }

  public closeModal(): void {
    this.isModalShow = false;
    if (this.modalErrorMessage === 'Registration success') {
      this.profileForm.reset();
      this.goToMainPage();
    }
  }

  public async submitButtonHandler(event: Event): Promise<void> {
    event.preventDefault();

    trimFormValues(this.profileForm);

    if (this.profileForm.invalid) {
      console.log('false');
      this.profileForm.markAllAsTouched();
      return;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const valueForm = this.profileForm.value as RegistrationFormValues;

    // requests for ecommerce tools
    const { new_customer_id, request_error_message } =
      await RegistrationPageComponent.createCustomer(valueForm);

    if (request_error_message === '') {
      await RegistrationPageComponent.setCustomerAddress(
        new_customer_id,
        valueForm,
      );
      await ApiService.setBirthDayToCustomer(
        new_customer_id,
        valueForm.birthDate,
      );
      const new_customer_cart_id: string = await ApiService.createNewCart();
      await ApiService.setUserIdToCart(new_customer_cart_id, new_customer_id);
      await ApiService.setUserEmailToCart(
        new_customer_cart_id,
        valueForm.email,
      );

      this.openModal('Registration success', 'Success ✅');
    } else {
      RegistrationPageComponent.lockScroll();
      this.openModal(request_error_message, '❗ Error ❗');
    }
  }

  public checkboxShippingHandler(): void {
    const isDefault = this.profileForm.get('isDefaultAddress')?.value;

    if (isDefault) {
      this.profileForm.get('shippingAddress')?.disable();
    } else {
      this.profileForm.get('shippingAddress')?.enable();
      this.profileForm.get('shippingAddress')?.setValue('');
    }
  }

  public checkboxBillingHandler(): void {
    const isSame = this.profileForm.get('isSameAddress')?.value;

    if (isSame) {
      this.profileForm.get('billingAddress')?.disable();
    } else {
      this.profileForm.get('billingAddress')?.enable();
      this.profileForm.get('billingAddress')?.setValue('');
    }
  }

  public goToMainPage(): void {
    this.router.navigate(['/']);
  }

  private ngOnInit(): void {
    this.profileForm.get('address')?.valueChanges.subscribe((addressValue) => {
      const isDefault = this.profileForm.get('isDefaultAddress')?.value;
      const isSame = this.profileForm.get('isSameAddress')?.value;

      if (isDefault) {
        this.profileForm
          .get('shippingAddress')
          ?.setValue(addressValue || '', { emitEvent: false });
      }

      if (isSame) {
        this.profileForm
          .get('billingAddress')
          ?.setValue(addressValue || '', { emitEvent: false });
      }
    });

    this.profileForm
      .get('isDefaultAddress')
      ?.valueChanges.subscribe((isDefault) => {
        const addressValue = this.profileForm.get('address')?.value;

        if (isDefault) {
          this.profileForm
            .get('shippingAddress')
            ?.setValue(addressValue || '', { emitEvent: false });
        }
      });

    this.profileForm.get('isSameAddress')?.valueChanges.subscribe((isSame) => {
      const shippingAddressValue =
        this.profileForm.get('shippingAddress')?.value;

      if (isSame) {
        this.profileForm
          .get('billingAddress')
          ?.setValue(shippingAddressValue || '', { emitEvent: false });
      }
    });
  }
}
