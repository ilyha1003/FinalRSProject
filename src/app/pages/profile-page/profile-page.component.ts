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
import { CustomerAddress } from '../../utils/interfaces';

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
    isShippingDefault: new FormControl(false),
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
    isBillingDefault: new FormControl(false),
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
  public defaultShippingAddress: string = '';
  public defaultBillingAddress: string = '';
  public activeMainButton: string = 'general';
  public isEditMode: boolean = false;
  public isShippingDefaultChecked: boolean = false;
  public isBillingDefaultChecked: boolean = false;
  public isShippingCreationMode: boolean = true;
  public isBillingCreationMode: boolean = true;

  public generalInputFields = generalInputFields;
  public generalInputFieldBirthDate = generalInputFieldBirthDate;
  public shippingAddress = shippingAddresses;
  public billingAddress = billingAddresses;
  public countries = countries;
  public passwords = passwords;
  public passwordForDeleting = passwordForDeleting;

  public shippingAddressesIds: (CustomerAddress | undefined)[] = [];
  public billingAddressesIds: (CustomerAddress | undefined)[] = [];
  public selectedShippingAddressId: string = '';
  public selectedBillingAddressId: string = '';

  public isFocused: Record<string, boolean> = {};
  public isInputNotEmpty: Record<string, boolean> = {};
  public hasError = hasError;

  public get passwordErrorCount(): number {
    const errors = this.generalProfileForm.get('password')?.errors;
    return errors ? Object.keys(errors).length : 0;
  }

  public static checkFormValidity(form: FormGroup): boolean {
    form.updateValueAndValidity({
      onlySelf: false,
      emitEvent: true,
    });

    if (form.invalid) {
      form.markAllAsTouched();
      return true;
    }
    return false;
  }

  public setActiveMainButton(buttonName: string): void {
    if (this.activeMainButton !== buttonName) {
      this.isEditMode = false;
      this.disableGeneralForm();
    }
    this.activeMainButton = buttonName;
  }

  public async checkSelectedShippingAddressIsDefault(
    customer_id: string,
    address_id: string,
  ): Promise<boolean> {
    const defaultShippingAddress =
      await ProfileService.getDefaultShippingAddress(customer_id);
    if (defaultShippingAddress === address_id) {
      this.isShippingDefaultChecked = true;
      return true;
    } else {
      this.isShippingDefaultChecked = false;
      return false;
    }
  }

  public async checkSelectedBillingAddressIsDefault(
    customer_id: string,
    address_id: string,
  ): Promise<boolean> {
    const defaultBillingAddress =
      await ProfileService.getDefaultBillingAddress(customer_id);
    if (defaultBillingAddress === address_id) {
      this.isBillingDefaultChecked = true;
      return true;
    } else {
      this.isBillingDefaultChecked = false;
      return false;
    }
  }

  public setActiveEditMode(): void {
    this.isEditMode = true;
    this.enableGeneralForm();
    this.enableShippingForm();
    this.enableBillingForm();
  }

  public setInactiveEditMode(): void {
    this.isEditMode = false;
    this.disableGeneralForm();
    this.disableShippingForm();
    this.disableBillingForm();
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

  public disableGeneralForm(): void {
    this.generalProfileForm.disable();
  }

  public enableGeneralForm(): void {
    this.generalProfileForm.enable();
  }

  public disableShippingForm(): void {
    this.shippingProfileForm.disable();
  }

  public enableShippingForm(): void {
    this.shippingProfileForm.enable();
  }

  public disableBillingForm(): void {
    this.billingProfileForm.disable();
  }

  public enableBillingForm(): void {
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
    this.fillGeneralInputsValues();
  }

  public async cancelShippingFormChanges(): Promise<void> {
    this.setInactiveEditMode();
    this.fillShippingInputsValues(this.selectedShippingAddressId);
  }

  public async cancelBillingFormChanges(): Promise<void> {
    this.setInactiveEditMode();
    this.fillBillingInputsValues(this.selectedBillingAddressId);
  }

  // main method for general submit
  public async submitGeneralFormChanges(event: Event): Promise<void> {
    event.preventDefault();

    if (ProfilePageComponent.checkFormValidity(this.generalProfileForm)) {
      return;
    }

    const generalForm = this.generalProfileForm.value;

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

  public async fillGeneralInputsValues(): Promise<void> {
    const customerData = await ProfileService.getCustomerDataById(
      LocalStorageService.getCustomerId(),
    );

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

  public async fillShippingInputsValues(address_id: string): Promise<void> {
    const customer_id = LocalStorageService.getCustomerId();

    if (address_id === 'new') {
      this.enableShippingForm();
      await this.checkSelectedShippingAddressIsDefault(customer_id, address_id);
      this.isShippingCreationMode = true;
      this.resetShippingInputValues();
      return;
    } else {
      this.disableShippingForm();
      this.isShippingCreationMode = false;
      this.isEditMode = false;
      const address_data = await ProfileService.getAddressData(
        customer_id,
        address_id,
      );

      if (address_data) {
        this.isInputNotEmpty['shippingCountry'] = true;
        this.isInputNotEmpty['shippingCity'] = true;
        this.isInputNotEmpty['shippingPostalCode'] = true;
        this.isInputNotEmpty['shippingAddress'] = true;

        this.shippingProfileForm
          .get('shippingCountry')
          ?.setValue(address_data?.country);
        this.shippingProfileForm
          .get('shippingCity')
          ?.setValue(address_data?.city);
        this.shippingProfileForm
          .get('shippingPostalCode')
          ?.setValue(address_data?.postalCode);
        this.shippingProfileForm
          .get('shippingAddress')
          ?.setValue(address_data?.streetName);

        await this.checkSelectedShippingAddressIsDefault(
          customer_id,
          address_id,
        );
      }
    }
  }

  //main method for shipping submit
  public async submitShippingFormChanges(event: Event): Promise<void> {
    event.preventDefault();
    if (ProfilePageComponent.checkFormValidity(this.shippingProfileForm)) {
      return;
    }
    const customer_id = LocalStorageService.getCustomerId();
    const formData = this.shippingProfileForm.value;
    console.log(formData);

    if (
      formData.shippingAddress &&
      formData.shippingPostalCode &&
      formData.shippingCity &&
      formData.shippingCountry
    ) {
      await ProfileService.changeAddress(
        customer_id,
        this.selectedShippingAddressId,
        formData.shippingAddress,
        formData.shippingPostalCode,
        formData.shippingCity,
        formData.shippingCountry,
      );
      if (formData.isShippingDefault) {
        await ProfileService.setDefaultShippingAddress(
          customer_id,
          this.selectedShippingAddressId,
        );
      } else {
        if (
          await this.checkSelectedShippingAddressIsDefault(
            customer_id,
            this.selectedShippingAddressId,
          )
        ) {
          await ProfileService.removeDefaultShippingAddress(customer_id);
          this.isShippingDefaultChecked = false;
        }
      }
      await this.updateShippingSelectAfterCreation(
        this.selectedShippingAddressId,
      );
    }

    this.setInactiveEditMode();
  }

  public resetShippingInputValues(): void {
    this.shippingProfileForm.get('shippingCountry')?.setValue('');
    this.shippingProfileForm.get('shippingCity')?.setValue('');
    this.shippingProfileForm.get('shippingPostalCode')?.setValue('');
    this.shippingProfileForm.get('shippingAddress')?.setValue('');
    this.isInputNotEmpty['shippingCountry'] = false;
    this.isInputNotEmpty['shippingCity'] = false;
    this.isInputNotEmpty['shippingPostalCode'] = false;
    this.isInputNotEmpty['shippingAddress'] = false;
  }

  public resetBillingInputValues(): void {
    this.billingProfileForm.get('billingCountry')?.setValue('');
    this.billingProfileForm.get('billingCity')?.setValue('');
    this.billingProfileForm.get('billingPostalCode')?.setValue('');
    this.billingProfileForm.get('billingAddress')?.setValue('');
    this.isInputNotEmpty['billingCountry'] = false;
    this.isInputNotEmpty['billingCity'] = false;
    this.isInputNotEmpty['billingPostalCode'] = false;
    this.isInputNotEmpty['billingAddress'] = false;
  }

  public async fillShippingSelect(): Promise<void> {
    this.shippingAddressesIds = [];
    const customer_id: string = LocalStorageService.getCustomerId();
    const shippingAddressesIds =
      await ProfileService.getCustomerShippingAddressIds(customer_id);
    for (const shippingAddress of shippingAddressesIds) {
      const addressData = await ProfileService.getAddressData(
        customer_id,
        shippingAddress,
      );
      this.shippingAddressesIds.push(addressData);
    }
    this.defaultShippingAddress =
      await ProfileService.getDefaultShippingAddress(customer_id);
  }

  public async updateShippingSelectAfterCreation(
    newAddressId: string,
  ): Promise<void> {
    this.selectedShippingAddressId = newAddressId;
    await this.fillShippingSelect();
    this.isShippingCreationMode = false;
    this.disableShippingForm();
  }

  public async updateBillingSelectAfterCreation(
    newAddressId: string,
  ): Promise<void> {
    this.selectedBillingAddressId = newAddressId;
    await this.fillBillingSelect();
    this.isBillingCreationMode = false;
    this.disableBillingForm();
  }

  public async updateShippingSelectAfterDeletion(): Promise<void> {
    this.selectedShippingAddressId = 'new';
    await this.fillShippingSelect();
    this.isShippingCreationMode = true;
    this.enableShippingForm();
    await this.markShippingFormAsUntouched();
  }

  public async updateBillingSelectAfterDeletion(): Promise<void> {
    this.selectedBillingAddressId = 'new';
    await this.fillBillingSelect();
    this.isBillingCreationMode = true;
    this.enableBillingForm();
    await this.markBillingFormAsUntouched();
  }

  public async onShippingOptionSelect(event: Event): Promise<void> {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      this.selectedShippingAddressId = target.value;
    }
    await this.fillShippingInputsValues(this.selectedShippingAddressId);
    await this.markShippingFormAsUntouched();
  }

  public async markShippingFormAsUntouched(): Promise<void> {
    this.shippingProfileForm.get('shippingCity')?.markAsUntouched();
    this.shippingProfileForm.get('shippingCountry')?.markAsUntouched();
    this.shippingProfileForm.get('shippingPostalCode')?.markAsUntouched();
    this.shippingProfileForm.get('shippingAddress')?.markAsUntouched();
  }

  public async markBillingFormAsUntouched(): Promise<void> {
    this.billingProfileForm.get('billingCity')?.markAsUntouched();
    this.billingProfileForm.get('billingCountry')?.markAsUntouched();
    this.billingProfileForm.get('billingPostalCode')?.markAsUntouched();
    this.billingProfileForm.get('billingAddress')?.markAsUntouched();
  }

  public async createNewShippingAddress(): Promise<void> {
    const customer_id = LocalStorageService.getCustomerId();

    if (ProfilePageComponent.checkFormValidity(this.shippingProfileForm)) {
      return;
    }

    const formData = this.shippingProfileForm.value;
    if (
      formData.shippingCountry &&
      formData.shippingCity &&
      formData.shippingPostalCode &&
      formData.shippingAddress
    ) {
      const newAddressId: string = await ProfileService.addNewAddress(
        customer_id,
        formData.shippingCountry,
        formData.shippingCity,
        formData.shippingPostalCode,
        formData.shippingAddress,
      );
      await (formData.isShippingDefault === true
        ? ProfileService.setDefaultShippingAddress(customer_id, newAddressId)
        : ProfileService.addAddressToShippingAddresses(
            customer_id,
            newAddressId,
          ));

      await this.updateShippingSelectAfterCreation(newAddressId);
    }
  }

  public async createNewBillingAddress(): Promise<void> {
    const customer_id = LocalStorageService.getCustomerId();

    if (ProfilePageComponent.checkFormValidity(this.billingProfileForm)) {
      return;
    }

    const formData = this.billingProfileForm.value;
    if (
      formData.billingCountry &&
      formData.billingCity &&
      formData.billingPostalCode &&
      formData.billingAddress
    ) {
      const newAddressId: string = await ProfileService.addNewAddress(
        customer_id,
        formData.billingCountry,
        formData.billingCity,
        formData.billingPostalCode,
        formData.billingAddress,
      );
      await (formData.isBillingDefault === true
        ? ProfileService.setDefaultBillingAddress(customer_id, newAddressId)
        : ProfileService.addAddressToBillingAddresses(
            customer_id,
            newAddressId,
          ));

      await this.updateBillingSelectAfterCreation(newAddressId);
    }
  }

  public async deleteSelectedShippingAddress(): Promise<void> {
    const customer_id = LocalStorageService.getCustomerId();
    await ProfileService.removeShippingAddressId(
      customer_id,
      this.selectedShippingAddressId,
    );
    await this.updateShippingSelectAfterDeletion();
    this.resetShippingInputValues();
  }

  public async deleteSelectedBillingAddress(): Promise<void> {
    const customer_id = LocalStorageService.getCustomerId();
    await ProfileService.removeBillingAddressId(
      customer_id,
      this.selectedBillingAddressId,
    );
    await this.updateBillingSelectAfterDeletion();
    this.resetBillingInputValues();
  }

  //billing
  public async submitBillingFormChanges(event: Event): Promise<void> {
    event.preventDefault();
    if (ProfilePageComponent.checkFormValidity(this.billingProfileForm)) {
      return;
    }
    const customer_id = LocalStorageService.getCustomerId();
    const formData = this.billingProfileForm.value;
    console.log(formData);

    if (
      formData.billingAddress &&
      formData.billingPostalCode &&
      formData.billingCity &&
      formData.billingCountry
    ) {
      await ProfileService.changeAddress(
        customer_id,
        this.selectedBillingAddressId,
        formData.billingAddress,
        formData.billingPostalCode,
        formData.billingCity,
        formData.billingCountry,
      );
      if (formData.isBillingDefault) {
        await ProfileService.setDefaultBillingAddress(
          customer_id,
          this.selectedBillingAddressId,
        );
      } else {
        if (
          await this.checkSelectedBillingAddressIsDefault(
            customer_id,
            this.selectedBillingAddressId,
          )
        ) {
          await ProfileService.removeDefaultBillingAddress(customer_id);
          this.isBillingDefaultChecked = false;
        }
      }
      await this.updateBillingSelectAfterCreation(
        this.selectedBillingAddressId,
      );
    }

    this.setInactiveEditMode();
  }

  public async fillBillingSelect(): Promise<void> {
    this.billingAddressesIds = [];
    const customer_id: string = LocalStorageService.getCustomerId();
    const billingAddressesIds =
      await ProfileService.getCustomerBillingAddressIds(customer_id);
    for (const billingAddress of billingAddressesIds) {
      const addressData = await ProfileService.getAddressData(
        customer_id,
        billingAddress,
      );
      this.billingAddressesIds.push(addressData);
    }
    this.defaultBillingAddress =
      await ProfileService.getDefaultBillingAddress(customer_id);
  }

  public async onBillingOptionSelect(event: Event): Promise<void> {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      this.selectedBillingAddressId = target.value;
    }
    await this.fillBillingInputsValues(this.selectedBillingAddressId);
    await this.markBillingFormAsUntouched();
  }

  public async fillBillingInputsValues(address_id: string): Promise<void> {
    const customer_id = LocalStorageService.getCustomerId();

    if (address_id === 'new') {
      this.enableBillingForm();
      await this.checkSelectedBillingAddressIsDefault(customer_id, address_id);
      this.isBillingCreationMode = true;
      this.resetBillingInputValues();
      return;
    } else {
      this.disableBillingForm();
      this.isBillingCreationMode = false;
      this.isEditMode = false;
      const address_data = await ProfileService.getAddressData(
        customer_id,
        address_id,
      );

      if (address_data) {
        this.isInputNotEmpty['billingCountry'] = true;
        this.isInputNotEmpty['billingCity'] = true;
        this.isInputNotEmpty['billingPostalCode'] = true;
        this.isInputNotEmpty['billingAddress'] = true;

        this.billingProfileForm
          .get('billingCountry')
          ?.setValue(address_data?.country);
        this.billingProfileForm
          .get('billingCity')
          ?.setValue(address_data?.city);
        this.billingProfileForm
          .get('billingPostalCode')
          ?.setValue(address_data?.postalCode);
        this.billingProfileForm
          .get('billingAddress')
          ?.setValue(address_data?.streetName);

        await this.checkSelectedBillingAddressIsDefault(
          customer_id,
          address_id,
        );
      }
    }
  }

  public async ngOnInit(): Promise<void> {
    this.disableGeneralForm();
    await this.fillGeneralInputsValues();
    await this.fillShippingSelect();
    await this.fillBillingSelect();
  }
}
