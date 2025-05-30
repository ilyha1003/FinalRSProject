import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SignInService } from '../../services/sign-in.service';

@Component({
  selector: 'app-profile-modal',
  imports: [RouterModule],
  templateUrl: './profile-modal.component.html',
  styleUrl: './profile-modal.component.scss',
})
export class ProfileModalComponent {
  @Input() public message: string = '';
  @Input() public header: string = '';
  @Input() public isPasswordChanged: boolean = false;
  @Output() public closeModalEvent = new EventEmitter<void>();
  public isBodyScrolling: boolean = true;

  constructor(
    private router: Router,
    private signInService: SignInService,
  ) {}

  public static unlockScroll(): void {
    document.body.classList.remove('scroll-lock');
  }

  public closeModal(): void {
    ProfileModalComponent.unlockScroll();
    this.closeModalEvent.emit();
  }

  public closeModalAfterPasswordChange(): void {
    ProfileModalComponent.unlockScroll();
    this.goToMainPage();
    this.signInService.logout();
    this.closeModalEvent.emit();
  }

  public goToMainPage(): void {
    this.router.navigate(['/']);
  }

  public onModalClose(state: boolean): void {
    if (state) {
      this.closeModalAfterPasswordChange();
    } else {
      this.closeModal();
    }
  }
}
