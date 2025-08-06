import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ErrorLog {
  timestamp: Date;
  errorType: string;
  errorCode?: string;
  message: string;
  stack?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  additionalData?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorLogs: ErrorLog[] = [];

  constructor() {
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers() {
    // Only set up global error handlers in browser environment
    if (typeof window !== 'undefined') {
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.logError('UNHANDLED_PROMISE_REJECTION', {
          message: event.reason?.message || 'Unhandled Promise Rejection',
          stack: event.reason?.stack,
          additionalData: { reason: event.reason }
        });
      });

      // Handle JavaScript errors
      window.addEventListener('error', (event) => {
        this.logError('JAVASCRIPT_ERROR', {
          message: event.message,
          stack: event.error?.stack,
          url: event.filename,
          additionalData: { 
            lineNumber: event.lineno,
            columnNumber: event.colno,
            error: event.error
          }
        });
      });
    }
  }

  // HTTP Error Logging
  logHttpError(error: any, context?: string) {
    const errorData = {
      message: error.message || 'HTTP Request Failed',
      errorCode: error.status?.toString(),
      additionalData: {
        context,
        url: error.url,
        method: error.method,
        status: error.status,
        statusText: error.statusText,
        response: error.error
      }
    };

    this.logError('HTTP_ERROR', errorData);
  }

  // Authentication Error Logging
  logAuthError(error: any, authMethod?: string) {
    const errorData = {
      message: error.message || 'Authentication Failed',
      errorCode: error.code,
      additionalData: {
        authMethod,
        errorCode: error.code,
        email: error.email
      }
    };

    this.logError('AUTH_ERROR', errorData);
  }

  // Firebase Error Logging
  logFirebaseError(error: any, operation?: string) {
    const errorData = {
      message: error.message || 'Firebase Operation Failed',
      errorCode: error.code,
      additionalData: {
        operation,
        errorCode: error.code,
        errorDetails: error
      }
    };

    this.logError('FIREBASE_ERROR', errorData);
  }

  // Network Error Logging
  logNetworkError(error: any, requestType?: string) {
    const errorData = {
      message: error.message || 'Network Connection Failed',
      additionalData: {
        requestType,
        errorType: error.name,
        errorDetails: error
      }
    };

    this.logError('NETWORK_ERROR', errorData);
  }

  // Validation Error Logging
  logValidationError(field: string, value: any, validationRule: string) {
    const errorData = {
      message: `Validation failed for field: ${field}`,
      additionalData: {
        field,
        value,
        validationRule,
        timestamp: new Date().toISOString()
      }
    };

    this.logError('VALIDATION_ERROR', errorData);
  }

  // Navigation Error Logging
  logNavigationError(error: any, route?: string) {
    const errorData = {
      message: error.message || 'Navigation Failed',
      additionalData: {
        route,
        errorType: error.name,
        errorDetails: error
      }
    };

    this.logError('NAVIGATION_ERROR', errorData);
  }

  // Component Error Logging
  logComponentError(error: any, componentName: string, method?: string) {
    const errorData = {
      message: error.message || 'Component Error',
      additionalData: {
        componentName,
        method,
        errorType: error.name,
        errorDetails: error
      }
    };

    this.logError('COMPONENT_ERROR', errorData);
  }

  // Service Error Logging
  logServiceError(error: any, serviceName: string, method?: string) {
    const errorData = {
      message: error.message || 'Service Error',
      additionalData: {
        serviceName,
        method,
        errorType: error.name,
        errorDetails: error
      }
    };

    this.logError('SERVICE_ERROR', errorData);
  }

  // Database Error Logging
  logDatabaseError(error: any, operation?: string, table?: string) {
    const errorData = {
      message: error.message || 'Database Operation Failed',
      additionalData: {
        operation,
        table,
        errorType: error.name,
        errorDetails: error
      }
    };

    this.logError('DATABASE_ERROR', errorData);
  }

  // File Upload Error Logging
  logFileUploadError(error: any, fileName?: string, fileSize?: number) {
    const errorData = {
      message: error.message || 'File Upload Failed',
      additionalData: {
        fileName,
        fileSize,
        errorType: error.name,
        errorDetails: error
      }
    };

    this.logError('FILE_UPLOAD_ERROR', errorData);
  }

  // API Rate Limit Error Logging
  logRateLimitError(error: any, endpoint?: string) {
    const errorData = {
      message: error.message || 'Rate Limit Exceeded',
      additionalData: {
        endpoint,
        retryAfter: error.headers?.get('Retry-After'),
        errorDetails: error
      }
    };

    this.logError('RATE_LIMIT_ERROR', errorData);
  }

  // Memory/Performance Error Logging
  logPerformanceError(error: any, metric?: string) {
    const errorData = {
      message: error.message || 'Performance Issue Detected',
      additionalData: {
        metric,
        memoryUsage: (performance as any).memory,
        errorDetails: error
      }
    };

    this.logError('PERFORMANCE_ERROR', errorData);
  }

  // Generic Error Logging
  private logError(errorType: string, errorData: Partial<ErrorLog>) {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      errorType,
      message: errorData.message || 'Unknown Error',
      errorCode: errorData.errorCode,
      stack: errorData.stack,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userId: this.getCurrentUserId(),
      additionalData: errorData.additionalData
    };

    this.errorLogs.push(errorLog);
    
    // Log to console in development
    if (!environment.production) {
      console.error(`[${errorType}]`, errorLog);
    }

    // Send to external logging service in production
    if (environment.production) {
      this.sendToLoggingService(errorLog);
    }

    // Store in localStorage for debugging
    this.storeErrorLog(errorLog);
  }

  private getCurrentUserId(): string | undefined {
    // Get current user ID from your auth service
    // This is a placeholder - implement based on your auth system
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('userId') || undefined;
    }
    return undefined;
  }

  private sendToLoggingService(errorLog: ErrorLog) {
    // Send to external logging service (e.g., Sentry, LogRocket, etc.)
    // This is a placeholder - implement based on your logging service
    try {
      // Example: Send to your backend API
      // this.http.post('/api/logs', errorLog).subscribe();
      
      // Example: Send to Sentry
      // Sentry.captureException(new Error(errorLog.message), {
      //   extra: errorLog.additionalData
      // });
    } catch (error) {
      console.error('Failed to send error to logging service:', error);
    }
  }

  private storeErrorLog(errorLog: ErrorLog) {
    try {
      if (typeof localStorage !== 'undefined') {
        const storedLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
        storedLogs.push(errorLog);
        
        // Keep only last 100 errors
        if (storedLogs.length > 100) {
          storedLogs.splice(0, storedLogs.length - 100);
        }
        
        localStorage.setItem('errorLogs', JSON.stringify(storedLogs));
      }
    } catch (error) {
      console.error('Failed to store error log:', error);
    }
  }

  // Get all error logs
  getErrorLogs(): ErrorLog[] {
    return [...this.errorLogs];
  }

  // Get error logs by type
  getErrorLogsByType(errorType: string): ErrorLog[] {
    return this.errorLogs.filter(log => log.errorType === errorType);
  }

  // Get recent error logs
  getRecentErrorLogs(hours: number = 24): ErrorLog[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.errorLogs.filter(log => log.timestamp > cutoffTime);
  }

  // Clear error logs
  clearErrorLogs() {
    this.errorLogs = [];
    localStorage.removeItem('errorLogs');
  }

  // Export error logs
  exportErrorLogs(): string {
    return JSON.stringify(this.errorLogs, null, 2);
  }
} 