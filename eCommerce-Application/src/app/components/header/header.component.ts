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

  public goToRegistrationPage(): void {
    this.router.navigate(['/registration']);
  }

  public logout(): void {
    console.log(this.isLogin);
  }
}
