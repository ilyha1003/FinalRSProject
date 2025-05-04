import { Component } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { customEmailValidator } from '../../utils/validations/email-custom-validator';
import { Router } from '@angular/router';
import { hasError } from '../../utils/validations/has-error';
import { noSpacesValidator } from '../../utils/validations/no-spaces-validator';
import { strengthPasswordValidator } from '../../utils/validations/strength-password-validator';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, NgIf, NgClass],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  public profileForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      customEmailValidator,
      noSpacesValidator,
    ]),
    password: new FormControl('', [
      Validators.required,
      noSpacesValidator,
      strengthPasswordValidator,
      Validators.minLength(8),
    ]),
  });

  public hasError = hasError;
  public isPasswordOpen = false;

  constructor(private router: Router) {}

  public get passwordErrorCount(): number {
    const errors = this.profileForm.get('password')?.errors;
    return errors ? Object.keys(errors).length : 0;
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

  public togglePasswordVisibility(): void {
    this.isPasswordOpen = !this.isPasswordOpen;
  }

  public goToMainPage(): void {
    this.router.navigate(['/']);
  }
}
