import type { Routes } from '@angular/router';
import { RegistrationPageComponent } from './pages/registration-page/registration-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { MainPageComponent } from './pages/main-page/main-page.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'registration', component: RegistrationPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: '**', component: NotFoundComponent },
];
