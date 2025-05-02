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

@Component({
  selector: 'app-registration-page',
  imports: [ReactiveFormsModule, NgIf, NgClass, RouterModule],
  templateUrl: './registration-page.component.html',
  styleUrl: './registration-page.component.scss',
})
export class RegistrationPageComponent {
  public profileForm = new FormGroup({
    // nickName: new FormControl('', [
    //   Validators.required,
    //   Validators.minLength(4),
    //   Validators.maxLength(12),
    // ]),
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
    // birthDate: new FormControl('', [Validators.required]),
    // country: new FormControl('', [Validators.required]),
  });

  public countries = countries;
  public inputFields = inputFields;
  public hasError = hasError;

  constructor(private router: Router) {}

  public submitButtonHandler(event: Event): void {
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
