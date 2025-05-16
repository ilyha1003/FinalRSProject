import { Injectable } from '@angular/core';
import { LoaderModalComponent } from '../components/loader-modal/loader-modal.component';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loaderRef?: LoaderModalComponent;

  constructor() {}

  public register(loader: LoaderModalComponent): void {
    this.loaderRef = loader;
  }

  public show(): void {
    this.loaderRef?.show();
  }

  public hide(): void {
    this.loaderRef?.hide();
  }
}
