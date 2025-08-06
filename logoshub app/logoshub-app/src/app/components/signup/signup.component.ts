import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private errorService: ErrorService
  ) {}

  async onSignup() {
    // Reset error message
    this.errorMessage = '';

    // Validation
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      this.errorService.logValidationError('signup_form', { 
        name: this.name, 
        email: this.email, 
        password: '***', 
        confirmPassword: '***' 
      }, 'required_fields');
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      this.errorService.logValidationError('password', '***', 'min_length_6');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.errorService.logValidationError('confirmPassword', '***', 'password_mismatch');
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
      // Create user with Firebase
      await this.authService.signUpWithEmail(this.email, this.password);
      
      // Note: The name field is not automatically saved by Firebase Auth
      // You would typically save additional user data to Firestore or your backend
      console.log('User registered successfully:', { 
        name: this.name, 
        email: this.email 
      });
      
      this.isLoading = false;
      // Navigation is handled by the AuthService
    } catch (error: any) {
      this.isLoading = false;
      
      // Log the error
      this.errorService.logAuthError(error, 'email_signup');
      
      // Handle Firebase Auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'Please enter a valid email address';
          break;
        case 'auth/weak-password':
          this.errorMessage = 'Password is too weak. Please choose a stronger password';
          break;
        case 'auth/network-request-failed':
          this.errorMessage = 'Network error. Please check your internet connection';
          this.errorService.logNetworkError(error, 'signup_request');
          break;
        default:
          this.errorMessage = error.message || 'Sign up failed. Please try again.';
      }
      
      console.error('Signup error:', error);
    }
  }

  async onGoogleSignup() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.signUpWithGoogle();
      this.isLoading = false;
    } catch (error: any) {
      this.isLoading = false;
      this.errorService.logAuthError(error, 'google_signup');
      this.errorMessage = error.message || 'Google sign-up failed. Please try again.';
      console.error('Google OAuth error:', error);
    }
  }

  navigateToLogin() {
    try {
      this.router.navigate(['/login']);
    } catch (error) {
      this.errorService.logNavigationError(error, '/login');
    }
  }
} 