import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { SignInService } from '../../services/sign-in.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-basket-page',
  imports: [NgIf],
  templateUrl: './basket-page.component.html',
  styleUrl: './basket-page.component.scss',
})
export class BasketPageComponent {
  public isCartEmpty: boolean = true;
  public isLogin: boolean = false;

  private subscription!: Subscription;

  constructor(private signInService: SignInService) {}

  public async ngOnInit(): Promise<void> {
    this.subscription = this.signInService.isLogin$.subscribe(
      async (isLoggedIn) => {
        this.isLogin = isLoggedIn;
      },
    );
  }
}
