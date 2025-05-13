import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-modal',
  imports: [],
  templateUrl: './error-modal.component.html',
  styleUrl: './error-modal.component.scss'
})


export class ErrorModalComponent {
  @Input() public message: string = '';
  @Input() public header: string = '';
  @Output() public closeModalEvent = new EventEmitter<void>();
  public isBodyScrolling: boolean = true;

  public static unlockScroll(): void {
    document.body.classList.remove('scroll-lock');
  }

  public closeModal(): void {
    ErrorModalComponent.unlockScroll();
    this.closeModalEvent.emit();
  }
}
