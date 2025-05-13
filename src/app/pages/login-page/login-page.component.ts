import { Component } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { customEmailValidator } from '../../utils/validations/email-custom-validator';
import { Router } from '@angular/router';
import { hasError } from '../../utils/validations/has-error';
import { noTrimmedSpacesValidator } from '../../utils/validations/no-trimmed-spaces-validator';
import { strengthPasswordValidator } from '../../utils/validations/strength-password-validator';
import { ApiService } from '../../services/api.service';
import { FormModalComponent } from '../../components/form-modal/form-modal.component';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, NgIf, NgClass, RouterLink, FormModalComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  public profileForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      customEmailValidator,
      noTrimmedSpacesValidator,
    ]),
    password: new FormControl('', [
      Validators.required,
      noTrimmedSpacesValidator,
      strengthPasswordValidator,
      Validators.minLength(8),
    ]),
  });

  public hasError = hasError;
  public isPasswordOpen = false;
  public isModalShow: boolean = false;
  public modalErrorMessage: string = '';
  public modalHeader: string = '';

  constructor(private router: Router) {}

  public get passwordErrorCount(): number {
    const errors = this.profileForm.get('password')?.errors;
    return errors ? Object.keys(errors).length : 0;
  }

  public static lockScroll(): void {
    document.body.classList.add('scroll-lock');
  }

  public openModal(message: string, header: string): void {
    this.modalErrorMessage = message;
    this.modalHeader = header;
    this.isModalShow = true;
  }

  public closeModal(): void {
    this.isModalShow = false;
  }

  public async submitHandler(event: Event): Promise<void> {
    event.preventDefault();

    if (this.profileForm.invalid) {
      console.log('false');
      this.profileForm.markAllAsTouched();
      return;
    }

    const valueForm = this.profileForm.value;

    // requests for ecommerce tools
    if (valueForm.email && valueForm.password) {
      const { request_error_message } = await ApiService.loginCustomer(
        valueForm.email,
        valueForm.password,
      );
      if (request_error_message === '') {
        const customer_access_token = await ApiService.createUserAccessToken(
          valueForm.email,
          valueForm.password,
        );
        console.log('Customer access token - ' + customer_access_token);
        this.profileForm.reset();
        this.goToMainPage();
      } else {
        LoginPageComponent.lockScroll();
        this.openModal(request_error_message, '❗ Error ❗');
      }
    }
  }

  public togglePasswordVisibility(): void {
    this.isPasswordOpen = !this.isPasswordOpen;
  }

  public goToMainPage(): void {
    this.router.navigate(['/']);
  }
}
