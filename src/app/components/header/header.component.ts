import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';
// import { LocalStorageService } from '../../services/local-storage.service';
import { Subscription } from 'rxjs';
import { SignInService } from '../../services/sign-in.service';

@Component({
  selector: 'app-header',
  imports: [NgIf, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  @ViewChild('dropdown') public dropdown!: ElementRef;
  public isLogin = false;
  public showHeader = true;
  public showProfileMenu = false;
  public isMobile = false;
  public basketItemCount = 0;

  private subscription!: Subscription;

  constructor(private router: Router, private signInService: SignInService) {}

  @HostListener('window:resize')
  public onWindowResize(): void {
    if (this.showProfileMenu) {
      this.adjustDropdownPosition();
    }
    this.isMobile = window.innerWidth <= 768;
  }

  public ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.showHeader =
          this.router.url === '/login' || this.router.url === '/registration' || this.router.url === '/**'
            ? false
            : true;
      });
    
    this.subscription = this.signInService.isLogin$.subscribe((isLoggedIn) => {
      this.isLogin = isLoggedIn;
    })
    
    this.isMobile = window.innerWidth <= 768;
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
    this.router.navigate(['/']);
  }

  private adjustDropdownPosition(): void {
    if (!this.showProfileMenu || !this.dropdown) return;

    const dropdownElement: HTMLElement = this.dropdown.nativeElement;
    const rect: DOMRect = dropdownElement.getBoundingClientRect();

    if (rect.right > window.innerWidth - 20) {
      dropdownElement.style.left = 'auto';
      dropdownElement.style.right = '0';
      dropdownElement.style.transform = 'translateY(0)';
    }
    if (rect.left < 20) {
      dropdownElement.style.left = '0';
      dropdownElement.style.right = 'auto';
      dropdownElement.style.transform = 'translateY(0)';
    }
    if (window.innerWidth > 768) {
      dropdownElement.style.left = '-40px';
      dropdownElement.style.right = 'auto';
      dropdownElement.style.transform = 'translateY(0)';
    }
  }
}
