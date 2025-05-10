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

@Component({
  selector: 'app-registration-page',
  imports: [ReactiveFormsModule, NgIf, NgClass, RouterModule],
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
    postalCode: new FormControl('', [Validators.required, postalCodeValidator]),
    address: new FormControl('', [Validators.required]),
  });

  public countries = countries;
  public inputFields = inputFields;
  public hasError = hasError;

  constructor(private router: Router) {}

  public get passwordErrorCount(): number {
    const errors = this.profileForm.get('password')?.errors;
    return errors ? Object.keys(errors).length : 0;
  }

  public async submitButtonHandler(event: Event): Promise<void> {
    event.preventDefault();

    if (this.profileForm.invalid) {
      console.log('false');
      this.profileForm.markAllAsTouched();
      return;
    }

    const valueForm = this.profileForm.value;

    // requests for ecommerce tools
    if(valueForm.address && valueForm.birthDate && valueForm.city && valueForm.country && valueForm.email && valueForm.firstName && valueForm.lastName && valueForm.password && valueForm.postalCode) {
      const { new_customer_id, request_error_message } = await ApiService.createNewCustomer(valueForm.email, valueForm.firstName, valueForm.lastName, valueForm.password);

      if(request_error_message === '') {
        await ApiService.setAddressesToCustomer(new_customer_id, valueForm.firstName, valueForm.lastName, valueForm.country, valueForm.city, valueForm.postalCode, valueForm.address);
        await ApiService.setBirthDayToCustomer(new_customer_id, valueForm.birthDate);
        const new_customer_cart_id: string = await ApiService.createNewCart();
        await ApiService.setUserIdToCart(new_customer_cart_id, new_customer_id);
        await ApiService.setUserEmailToCart(new_customer_cart_id, valueForm.email);
      } else {
        // add message "There is already an existing customer with the provided email."
      }
    }

    // add mesage for success registration (modal window with button "ok")

    this.profileForm.reset();
    this.goToMainPage();
  }

  public goToMainPage(): void {
    this.router.navigate(['/']);
  }
}
