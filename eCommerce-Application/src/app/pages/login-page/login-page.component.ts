import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { NgClass } from '@angular/common';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { customEmailValidator } from '../../utils/email-custom-validator';
import { strengthPasswordValidator } from '../../utils/strength-password-validator';
import { Router } from '@angular/router';
import { hasError } from '../../utils/has-error';
import { inputFieldsLogin } from './input-fields-login';

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
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      strengthPasswordValidator,
    ]),
  });

  public inputFieldsLogin = inputFieldsLogin;
  public hasError = hasError;

  constructor(private router: Router) {}

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
