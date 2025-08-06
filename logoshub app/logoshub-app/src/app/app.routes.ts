import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { ErrorLogViewerComponent } from './components/error-log-viewer/error-log-viewer.component';
import { AdvancedLogViewerComponent } from './components/advanced-log-viewer/advanced-log-viewer.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'logs', component: ErrorLogViewerComponent, canActivate: [AuthGuard] },
  { path: 'advanced-logs', component: AdvancedLogViewerComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];
