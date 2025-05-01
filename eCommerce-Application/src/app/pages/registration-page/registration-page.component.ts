import { Component } from '@angular/core';
import { countries } from './countries';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { inputFields } from './input-fields';
import { Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { hasError } from '../../utils/has-error';

@Component({
  selector: 'app-registration-page',
  imports: [ReactiveFormsModule, NgIf, NgClass],
  templateUrl: './registration-page.component.html',
  styleUrl: './registration-page.component.scss',
})
export class RegistrationPageComponent {
  public profileForm = new FormGroup({
    nickName: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(12),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      RegistrationPageComponent.strengthPasswordValidator,
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    birthDate: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
  });

  public countries = countries;
  public inputFields = inputFields;
  public hasError = hasError;

  constructor(private router: Router) {}

  private static strengthPasswordValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const isUpperCase = /[A-Z]/.test(value);
    const isLowerCase = /[a-z]/.test(value);

    const isValid = isUpperCase && isLowerCase;

    return isValid ? null : { passwordStrength: true };
  }

  public submitHandler(event: Event): void {
    event.preventDefault();

    if (this.profileForm.invalid) {
      console.log('false');
      this.profileForm.markAllAsTouched();
      return;
    }

    const valueForm = this.profileForm.value;

    console.log(valueForm);

    console.log(this.profileForm.reset());

    this.goToMainPage();
  }

  public goToMainPage(): void {
    this.router.navigate(['/']);
  }
}
