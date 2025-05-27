import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { countries } from '../../utils/countries';
import {
  generalInputFields,
  generalInputFieldBirthDate,
  shippingAddresses,
  billingAddresses,
  passwords,
  passwordForDeleting,
} from './input-fields';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { customEmailValidator } from '../../utils/validations/email-custom-validator';
import { birthDateValidator } from '../../utils/validations/birth-date-validator';
import { hasError } from '../../utils/validations/has-error';
import { postalCodeValidator } from '../../utils/validations/postal-code-validator';
import { noSpacesValidator } from '../../utils/validations/no-spaces-validator';
import { FormsModule } from '@angular/forms';
import { strengthPasswordValidator } from '../../utils/validations/strength-password-validator';
// import { ApiService } from '../../services/api.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile-page',
  imports: [NgIf, NgClass, ReactiveFormsModule, FormsModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent {
  public generalProfileForm = new FormGroup({
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
  });

  public generalProfileFormFields = {
    email: 'test@mail.ru',
    firstName: 'Ilya',
    lastName: 'Sankovich',
    birthDate: '1999-03-10',
  };

  public shippingProfileForm = new FormGroup({
    shippingCountry: new FormControl('', [Validators.required]),
    shippingCity: new FormControl('', [
      Validators.required,
      Validators.pattern('^[A-Za-zА-Яа-яЁё]+$'),
    ]),
    shippingPostalCode: new FormControl('', [
      Validators.required,
      postalCodeValidator,
      noSpacesValidator,
    ]),
    shippingAddress: new FormControl('', [
      Validators.required,
      noSpacesValidator,
    ]),
  });

  public billingProfileForm = new FormGroup({
    billingCountry: new FormControl('', [Validators.required]),
    billingCity: new FormControl('', [
      Validators.required,
      Validators.pattern('^[A-Za-zА-Яа-яЁё]+$'),
    ]),
    billingPostalCode: new FormControl('', [
      Validators.required,
      postalCodeValidator,
      noSpacesValidator,
    ]),
    billingAddress: new FormControl('', [
      Validators.required,
      noSpacesValidator,
    ]),
  });

  public passwordsProfileForm = new FormGroup({
    oldPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      strengthPasswordValidator,
    ]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      strengthPasswordValidator,
    ]),
  });

  public deleteAccountProfileForm = new FormGroup({
    actualPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      strengthPasswordValidator,
    ]),
  });

  public firstName: string = '';
  public lastName: string = '';
  public activeMainButton: string = 'general';
  public isEditMode: boolean = false;
  public isShippingDefaultChecked: boolean = false;
  public isBillingDefaultChecked: boolean = false;

  public generalInputFields = generalInputFields;
  public generalInputFieldBirthDate = generalInputFieldBirthDate;
  public shippingAddress = shippingAddresses;
  public billingAddress = billingAddresses;
  public countries = countries;
  public passwords = passwords;
  public passwordForDeleting = passwordForDeleting;

  public isFocused: Record<string, boolean> = {};
  public isInputNotEmpty: Record<string, boolean> = {};
  public hasError = hasError;

  public get passwordErrorCount(): number {
    const errors = this.generalProfileForm.get('password')?.errors;
    return errors ? Object.keys(errors).length : 0;
  }

  public setActiveMainButton(buttonName: string): void {
    if (this.activeMainButton !== buttonName) {
      this.isEditMode = false;
      this.disableAllForms();
    }
    this.activeMainButton = buttonName;
  }

  public setActiveEditMode(): void {
    this.isEditMode = true;
    this.enableAllForms();
  }

  public setInactiveEditMode(): void {
    this.isEditMode = false;
    this.disableAllForms();
  }

  public onShippingCheckboxChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.isShippingDefaultChecked = target.checked;
    }
  }

  public onBillingCheckboxChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.isBillingDefaultChecked = target.checked;
    }
  }

  public onInputBlur(form: FormGroup, inputTrack: string): void {
    const input = form.get(inputTrack);
    this.isInputNotEmpty[inputTrack] = !!input?.value;
    this.isFocused[inputTrack] = false;
  }

  public disableAllForms(): void {
    this.generalProfileForm.disable();
    this.shippingProfileForm.disable();
    this.billingProfileForm.disable();
  }

  public enableAllForms(): void {
    this.generalProfileForm.enable();
    this.shippingProfileForm.enable();
    this.billingProfileForm.enable();
  }

  public async updateGreeting(
    firstName: string,
    lastName: string,
  ): Promise<void> {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  public async cancelGeneralFormChanges(): Promise<void> {
    this.setInactiveEditMode();
    this.setGeneralInputsValues();
  }

  public async submitGeneralFormChanges(event: Event): Promise<void> {
    event.preventDefault();
    this.generalProfileForm.updateValueAndValidity({
      onlySelf: false,
      emitEvent: true,
    });
    if (this.generalProfileForm.invalid) {
      this.generalProfileForm.markAllAsTouched();
      return;
    }
    console.log(this.generalProfileForm.value);

    const generalForm = this.generalProfileForm.value;

    console.log(generalForm.email);

    if (
      generalForm.email &&
      generalForm.firstName &&
      generalForm.lastName &&
      generalForm.birthDate
    ) {
      const customer_id = LocalStorageService.getCustomerId();
      await ProfileService.changeCustomerEmail(customer_id, generalForm.email);
      await ProfileService.changeCustomerFirstName(
        customer_id,
        generalForm.firstName,
      );
      await ProfileService.changeCustomerLastName(
        customer_id,
        generalForm.lastName,
      );
      await ProfileService.changeCustomerBirthDate(
        customer_id,
        generalForm.birthDate,
      );
      await this.updateGreeting(generalForm.firstName, generalForm.lastName);
    }

    this.setInactiveEditMode();
  }

  public async setGeneralInputsValues(): Promise<void> {
    const customerData = await ProfileService.getCustomerDataById(
      LocalStorageService.getCustomerId(),
    );
    console.log(customerData);

    this.isInputNotEmpty['email'] = true;
    this.isInputNotEmpty['firstName'] = true;
    this.isInputNotEmpty['lastName'] = true;
    this.isInputNotEmpty['birthDate'] = true;

    if (
      customerData?.email &&
      customerData?.firstName &&
      customerData?.lastName &&
      customerData?.dateOfBirth
    ) {
      await this.updateGreeting(
        customerData?.firstName,
        customerData?.lastName,
      );
      this.generalProfileForm.get('email')?.setValue(customerData.email);
      this.generalProfileForm
        .get('firstName')
        ?.setValue(customerData.firstName);
      this.generalProfileForm.get('lastName')?.setValue(customerData.lastName);
      this.generalProfileForm
        .get('birthDate')
        ?.setValue(customerData.dateOfBirth);
    }
  }

  public ngOnInit(): void {
    this.disableAllForms();
    this.setGeneralInputsValues();
  }
}
