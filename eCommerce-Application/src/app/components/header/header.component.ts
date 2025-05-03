import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  public isLogin = false;
  public showHeader = true;

  constructor(private router: Router) {}

  public ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.showHeader =
          this.router.url === '/login' || this.router.url === '/registration'
            ? false
            : true;
      });
  }

  public buttonLoginHandler(): void {
    this.router.navigate(['/login']);
  }

  public buttonRegistrationHandler(): void {
    this.router.navigate(['/registration']);
  }

  public logout(): void {
    console.log(this.isLogin);
  }
}
