import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-profile-modal',
  imports: [],
  templateUrl: './profile-modal.component.html',
  styleUrl: './profile-modal.component.scss',
})
export class ProfileModalComponent {
  @Input() public message: string = '';
  @Input() public header: string = '';
  @Output() public closeModalEvent = new EventEmitter<void>();
  public isBodyScrolling: boolean = true;

  public static unlockScroll(): void {
    document.body.classList.remove('scroll-lock');
  }

  public closeModal(): void {
    ProfileModalComponent.unlockScroll();
    this.closeModalEvent.emit();
  }
}
