import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  imports: [MatIconModule, NgIf],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  public showFooter = true;

  constructor(private router: Router) {}

  public ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.showFooter =
          this.router.url === '/login' ||
          this.router.url === '/registration' ||
          this.router.url === '/**'
            ? false
            : true;
      });
  }
}
