import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  imports: [],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss',
})
export class ConfirmationModalComponent {
  @Input() public message: string = '';
  @Input() public header: string = '';
  @Output() public closeModalEvent = new EventEmitter<void>();
  @Output() public confirmModalEvent = new EventEmitter<void>();
  public isBodyScrolling: boolean = true;

  public static unlockScroll(): void {
    document.body.classList.remove('scroll-lock');
  }

  public closeModal(): void {
    ConfirmationModalComponent.unlockScroll();
    this.closeModalEvent.emit();
  }

  public confirmModal(): void {
    ConfirmationModalComponent.unlockScroll();
    this.confirmModalEvent.emit();
  }
}
