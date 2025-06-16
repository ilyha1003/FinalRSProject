import { Component } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-loader-modal',
  imports: [NgIf],
  templateUrl: './loader-modal.component.html',
  styleUrl: './loader-modal.component.scss',
})
export class LoaderModalComponent {
  public isVisible = false;

  public show(): void {
    this.isVisible = true;
    document.body.classList.add('scroll-lock');
  }

  public hide(): void {
    this.isVisible = false;
    document.body.classList.remove('scroll-lock');
  }
}
