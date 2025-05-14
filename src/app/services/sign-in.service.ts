import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})

export class SignInService {
  private _isLogin$ = new BehaviorSubject<boolean>(SignInService.getLoginStatusFromLocalStorage());

  constructor() { }

  public get isLogin$(): Observable<boolean> {
    return this._isLogin$.asObservable();
  }

  public static getLoginStatusFromLocalStorage(): boolean {
    return LocalStorageService.getLoginState() === 'true';
  }

  public login(customer_id: string, customer_access_token: string): void {
    LocalStorageService.setCustomerId(customer_id);
    LocalStorageService.setCustomerAccessToken(customer_access_token);
    LocalStorageService.setLoginState('true');
    this._isLogin$.next(true);
  }

  public logout(): void {
    LocalStorageService.removeCustomerId();
    LocalStorageService.removeCustomerAccessToken();
    LocalStorageService.removeLoginState();
    this._isLogin$.next(false);
  }

  public initAuthState(): void {
    globalThis.addEventListener('storage', this.handleStorageChange);
    const isLogin = SignInService.getLoginStatusFromLocalStorage();
    this._isLogin$.next(isLogin);
  }

  private handleStorageChange = (event: StorageEvent): void => {
    if (event.key === 'loginState') {
      const value = event.newValue === 'true';
      this._isLogin$.next(value);
    }
  };
}
