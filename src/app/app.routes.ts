import type { Routes } from '@angular/router';
import { RegistrationPageComponent } from './pages/registration-page/registration-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { CatalogPageComponent } from './pages/catalog-page/catalog-page.component';
import { AboutPageComponent } from './pages/about-page/about-page.component';
import { BasketPageComponent } from './pages/basket-page/basket-page.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'registration', component: RegistrationPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'catalog', component: CatalogPageComponent},
  { path: 'about', component: AboutPageComponent},
  { path: 'profile', component: ProfilePageComponent},
  { path: 'basket', component: BasketPageComponent},
  { path: '**', component: NotFoundComponent },
];
