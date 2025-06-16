import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoaderModalComponent } from './components/loader-modal/loader-modal.component';
import { LoaderService } from './services/loader.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    LoaderModalComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  @ViewChild('loader') private loader!: LoaderModalComponent;

  public title = 'eCommerce-Application';

  constructor(private loaderService: LoaderService) {}

  public ngAfterViewInit(): void {
    this.loaderService.register(this.loader);
  }
}
