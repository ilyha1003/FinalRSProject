import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { inputFields } from './input-fields';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { customEmailValidator } from '../../utils/validations/email-custom-validator';
import { birthDateValidator } from '../../utils/validations/birth-date-validator';
import { hasError } from '../../utils/validations/has-error';

@Component({
  selector: 'app-profile-page',
  imports: [NgIf, NgClass, ReactiveFormsModule],
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

  public activeMainButton = 'general';
  public inputFields = inputFields;
  public hasError = hasError;

  public get passwordErrorCount(): number {
    const errors = this.generalProfileForm.get('password')?.errors;
    return errors ? Object.keys(errors).length : 0;
  }

  public setActiveMainButton(buttonName: string): void {
    this.activeMainButton = buttonName;
  }
}
