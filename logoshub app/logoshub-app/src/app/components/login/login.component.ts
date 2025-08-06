import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private errorService: ErrorService
  ) {}

  async onLogin() {
    // Reset error message
    this.errorMessage = '';

    // Validation
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      this.errorService.logValidationError('login_form', { email: this.email, password: '***' }, 'required_fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      this.errorService.logValidationError('email', this.email, 'email_format');
      return;
    }

    this.isLoading = true;

    try {
      // Sign in with Firebase
      await this.authService.signInWithEmail(this.email, this.password);
      
      console.log('User logged in successfully');
      this.isLoading = false;
      // Navigation is handled by the AuthService
    } catch (error: any) {
      this.isLoading = false;
      
      // Log the error
      this.errorService.logAuthError(error, 'email_password');
      
      // Handle Firebase Auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          this.errorMessage = 'No account found with this email address';
          break;
        case 'auth/wrong-password':
          this.errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'Please enter a valid email address';
          break;
        case 'auth/user-disabled':
          this.errorMessage = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          this.errorMessage = 'Too many failed attempts. Please try again later';
          break;
        case 'auth/network-request-failed':
          this.errorMessage = 'Network error. Please check your internet connection';
          this.errorService.logNetworkError(error, 'login_request');
          break;
        default:
          this.errorMessage = error.message || 'Login failed. Please try again.';
      }
      
      console.error('Login error:', error);
    }
  }

  async onGoogleLogin() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.signInWithGoogle();
      this.isLoading = false;
    } catch (error: any) {
      this.isLoading = false;
      this.errorService.logAuthError(error, 'google_oauth');
      this.errorMessage = error.message || 'Google sign-in failed. Please try again.';
      console.error('Google OAuth error:', error);
    }
  }

  navigateToSignup() {
    try {
      this.router.navigate(['/signup']);
    } catch (error) {
      this.errorService.logNavigationError(error, '/signup');
    }
  }
} 