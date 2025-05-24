import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { countries } from '../../utils/countries';
import {
  generalInputFields,
  generalInputFieldBirthDate,
  shippingAddresses,
  billingAddresses,
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

  public activeMainButton: string = 'general';
  public isEditMode: boolean = false;
  public isShippingDefaultChecked: boolean = false;

  public generalInputFields = generalInputFields;
  public generalInputFieldBirthDate = generalInputFieldBirthDate;
  public shippingAddress = shippingAddresses;
  public billingAddress = billingAddresses;
  public countries = countries;

  public isFocused: Record<string, boolean> = {};
  public hasError = hasError;

  public get passwordErrorCount(): number {
    const errors = this.generalProfileForm.get('password')?.errors;
    return errors ? Object.keys(errors).length : 0;
  }

  public setActiveMainButton(buttonName: string): void {
    this.activeMainButton = buttonName;
  }

  public setActiveEditMode(): void {
    this.isEditMode = true;
  }

  public setInactiveEditMode(): void {
    this.isEditMode = false;
  }

  public onCheckboxChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.isShippingDefaultChecked = target.checked;
    }
  }
}
