import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';
import { LocalStorageService } from '../../services/local-storage.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { SignInService } from '../../services/sign-in.service';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [NgIf, RouterLink, AsyncPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  @ViewChild('dropdown') public dropdown!: ElementRef;
  public isLogin = new BehaviorSubject<boolean>(false);
  public showHeader = true;
  public showProfileMenu = false;
  public isMobile = false;
  public basketItemCount: number = 0;
  public firstName = '';

  private subscription!: Subscription;

  constructor(
    private router: Router,
    private signInService: SignInService,
    private cartService: CartService,
  ) {}

  @HostListener('window:resize')
  public onWindowResize(): void {
    if (this.showProfileMenu) {
      this.adjustDropdownPosition();
    }
    this.isMobile = window.innerWidth <= 768;
  }

  public async ngOnInit(): Promise<void> {
    if (LocalStorageService.getLoginState() === 'true') {
      const customer_id = LocalStorageService.getCustomerId();
      await this.cartService.updateCartCount(customer_id);
    }

    this.cartService.cartCount$.subscribe((count) => {
      if (LocalStorageService.getLoginState()) {
        this.basketItemCount = count;
      }
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.showHeader =
          this.router.url === '/login' ||
          this.router.url === '/registration' ||
          this.router.url === '/**'
            ? false
            : true;
      });

    this.subscription = this.signInService.isLogin$.subscribe(
      async (isLoggedIn) => {
        this.isLogin.next(isLoggedIn);

        if (!isLoggedIn) {
          this.firstName = '';
          this.basketItemCount = 0;
        }

        if (isLoggedIn) {
          await this.getUserName();
        }
      },
    );

    this.isMobile = window.innerWidth <= 768;

    // await this.getCoundProductsQuantity();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public buttonLoginHandler(): void {
    this.router.navigate(['/login']);
  }

  public buttonRegistrationHandler(): void {
    this.router.navigate(['/registration']);
  }

  public toggleProfileMenu(event?: Event): void {
    if (this.isMobile && event) {
      event.preventDefault();
      this.showProfileMenu = !this.showProfileMenu;

      setTimeout(() => {
        this.adjustDropdownPosition();
      }, 0);
    }
  }

  public onMouseEnter(): void {
    if (!this.isMobile) {
      this.showProfileMenu = true;
    }
    if (this.showProfileMenu) {
      setTimeout(() => {
        this.adjustDropdownPosition();
      }, 0);
    }
  }

  public onMouseLeave(): void {
    if (!this.isMobile) {
      this.showProfileMenu = false;
    }
  }

  public logout(): void {
    this.signInService.logout();
    this.showProfileMenu = false;
    this.router.navigate(['/']);
  }

  private adjustDropdownPosition(): void {
    if (!this.showProfileMenu || !this.dropdown) return;

    const dropdownElement: HTMLElement = this.dropdown.nativeElement;
    const rect: DOMRect = dropdownElement.getBoundingClientRect();

    if (rect.right > window.innerWidth - 20) {
      dropdownElement.style.transform = 'translateY(0)';
    }
    if (rect.left < 20) {
      dropdownElement.style.transform = 'translateY(0)';
    }
    if (window.innerWidth > 768) {
      dropdownElement.style.transform = 'translateY(0)';
    }
  }

  private async getUserName(): Promise<void> {
    const localStorageName = LocalStorageService.getCustomerId();

    const getfirstName = await ApiService.getCustomerById(localStorageName);

    if (!getfirstName?.firstName) {
      this.firstName = '';

      return;
    }

    const nameSlice =
      getfirstName?.firstName.length > 8
        ? getfirstName?.firstName.slice(0, 8) + '...'
        : getfirstName?.firstName;

    this.firstName = nameSlice;
  }
}
