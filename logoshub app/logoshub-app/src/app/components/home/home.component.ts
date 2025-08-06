import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { ErrorService } from '../../services/error.service';
import { AdvancedLoggerService, LogCategory } from '../../services/advanced-logger.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  searchQuery: string = '';
  isNavCollapsed: boolean = false;
  showUserMenu: boolean = false;
  showNotifications: boolean = false;
  currentUser: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private errorService: ErrorService,
    private advancedLogger: AdvancedLoggerService
  ) {
    this.currentUser = this.authService.getCurrentUser();
    
    // Log page load
    this.advancedLogger.info(LogCategory.NAVIGATION, 'Home page loaded', {
      user: this.currentUser?.email,
      timestamp: new Date().toISOString()
    });
  }

  async logout() {
    try {
      this.advancedLogger.startTimer('logout');
      await this.authService.signOut();
      this.advancedLogger.endTimer('logout', LogCategory.AUTH);
      this.advancedLogger.logAuthentication('logout', true, { user: this.currentUser?.email });
    } catch (error) {
      this.errorService.logComponentError(error, 'HomeComponent', 'logout');
      this.advancedLogger.logAuthentication('logout', false, { 
        user: this.currentUser?.email,
        error: (error as any).message 
      });
      console.error('Logout error:', error);
      this.router.navigate(['/login']);
    }
  }

  toggleNav() {
    try {
      this.isNavCollapsed = !this.isNavCollapsed;
      this.advancedLogger.logUserInteraction('navigation-toggle', 'click', {
        collapsed: this.isNavCollapsed
      });
    } catch (error) {
      this.errorService.logComponentError(error, 'HomeComponent', 'toggleNav');
    }
  }

  toggleUserMenu() {
    try {
      this.showUserMenu = !this.showUserMenu;
      this.showNotifications = false;
      this.advancedLogger.logUserInteraction('user-menu', 'toggle', {
        visible: this.showUserMenu
      });
    } catch (error) {
      this.errorService.logComponentError(error, 'HomeComponent', 'toggleUserMenu');
    }
  }

  toggleNotifications() {
    try {
      this.showNotifications = !this.showNotifications;
      this.showUserMenu = false;
      this.advancedLogger.logUserInteraction('notifications', 'toggle', {
        visible: this.showNotifications
      });
    } catch (error) {
      this.errorService.logComponentError(error, 'HomeComponent', 'toggleNotifications');
    }
  }

  onSearch() {
    try {
      this.advancedLogger.info(LogCategory.UI, 'Search performed', {
        query: this.searchQuery,
        timestamp: new Date().toISOString()
      });
      console.log('Searching for:', this.searchQuery);
      // Implement search functionality here
    } catch (error) {
      this.errorService.logComponentError(error, 'HomeComponent', 'onSearch');
    }
  }

  navigateTo(route: string) {
    try {
      this.advancedLogger.logNavigation(window.location.pathname, route);
      console.log('Navigating to:', route);
      
      // Handle specific navigation
      switch (route) {
        case 'logs':
          this.router.navigate(['/logs']);
          break;
        case 'advanced-logs':
          this.router.navigate(['/advanced-logs']);
          break;
        default:
          // Implement other navigation logic here
          break;
      }
    } catch (error) {
      this.errorService.logNavigationError(error, route);
    }
  }

  changeColorScheme(scheme: string) {
    try {
      this.advancedLogger.info(LogCategory.UI, 'Color scheme changed', {
        scheme,
        timestamp: new Date().toISOString()
      });
      console.log('Changing color scheme to:', scheme);
      // Implement color scheme change logic here
    } catch (error) {
      this.errorService.logComponentError(error, 'HomeComponent', 'changeColorScheme');
    }
  }

  closeMenus() {
    try {
      this.showUserMenu = false;
      this.showNotifications = false;
    } catch (error) {
      this.errorService.logComponentError(error, 'HomeComponent', 'closeMenus');
    }
  }

  // Additional logging methods
  logBusinessEvent(event: string, details?: any) {
    this.advancedLogger.logBusinessEvent(event, details);
  }

  logPerformanceMetric(operation: string, duration: number) {
    this.advancedLogger.logPerformance(operation, `Operation completed in ${duration}ms`, {
      duration,
      timestamp: new Date().toISOString()
    });
  }
} 