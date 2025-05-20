import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';
import { SignInService } from '../services/sign-in.service';

@Injectable({
  providedIn: 'root'
})
export class NotSignInGuard implements CanActivate {
  constructor(private router: Router) {}

  public canActivate(): boolean {
    const isLogin = SignInService.getLoginStatusFromLocalStorage();

    if (!isLogin) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}