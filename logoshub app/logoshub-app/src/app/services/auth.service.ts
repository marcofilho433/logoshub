import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private router: Router,
    private errorService: ErrorService
  ) {
    // Listen to authentication state changes
    this.auth.onAuthStateChanged((user) => {
      this.currentUserSubject.next(user);
    });
  }

  async signUpWithEmail(email: string, password: string): Promise<void> {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('Email sign-up successful:', result.user);
      
      // Navigate to home page after successful signup
      this.router.navigate(['/home']);
    } catch (error) {
      this.errorService.logFirebaseError(error, 'signUpWithEmail');
      console.error('Email sign-up error:', error);
      throw error;
    }
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Email sign-in successful:', result.user);
      
      // Navigate to home page after successful login
      this.router.navigate(['/home']);
    } catch (error) {
      this.errorService.logFirebaseError(error, 'signInWithEmail');
      console.error('Email sign-in error:', error);
      throw error;
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(this.auth, provider);
      console.log('Google sign-in successful:', result.user);
      
      // Navigate to home page after successful login
      this.router.navigate(['/home']);
    } catch (error) {
      this.errorService.logFirebaseError(error, 'signInWithGoogle');
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  async signUpWithGoogle(): Promise<void> {
    // For Google OAuth, sign up and sign in are the same process
    return this.signInWithGoogle();
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      console.log('Sign out successful');
      this.router.navigate(['/login']);
    } catch (error) {
      this.errorService.logFirebaseError(error, 'signOut');
      console.error('Sign out error:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
} 