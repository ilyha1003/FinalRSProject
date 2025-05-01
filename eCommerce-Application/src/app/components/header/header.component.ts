import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public isLogin = false;

  constructor(private router: Router) {}

  public buttonsHeaderHandler(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLButtonElement)) return;

    if (target.classList.contains('header__button_login')) {
      this.router.navigate(['/login']);
    } else if (target.classList.contains('header__button_registration')) {
      this.router.navigate(['/registration']);
    }
  }

  public logout(): void {
    console.log(this.isLogin);
  }
}
