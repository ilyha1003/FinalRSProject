import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-modal',
  imports: [],
  templateUrl: './form-modal.component.html',
  styleUrl: './form-modal.component.scss',
})
export class FormModalComponent {
  @Input() public message: string = '';
  @Input() public header: string = '';
  @Output() public closeModalEvent = new EventEmitter<void>();
  public isBodyScrolling: boolean = true;

  public static unlockScroll(): void {
    document.body.classList.remove('scroll-lock');
  }

  public closeModal(): void {
    FormModalComponent.unlockScroll();
    this.closeModalEvent.emit();
  }
}
