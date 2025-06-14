import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartCounterService {
  public cartCount: Observable<number>;

  private cartCountSubject = new BehaviorSubject<number>(0);

  constructor() {
    this.cartCount = this.cartCountSubject.asObservable();
  }

  public updateCount(count: number): void {
    this.cartCountSubject.next(count);
  }
}
