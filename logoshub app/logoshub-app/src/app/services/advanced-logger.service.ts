import { Injectable } from '@angular/core';
import { ErrorService, ErrorLog } from './error.service';
import { environment } from '../../environments/environment';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

export enum LogCategory {
  AUTH = 'AUTH',
  NAVIGATION = 'NAVIGATION',
  API = 'API',
  UI = 'UI',
  PERFORMANCE = 'PERFORMANCE',
  SECURITY = 'SECURITY',
  BUSINESS = 'BUSINESS',
  SYSTEM = 'SYSTEM'
}

export interface AdvancedLogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: any;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  duration?: number; // For performance logs
  tags?: string[];
  metadata?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class AdvancedLoggerService {
  private logs: AdvancedLogEntry[] = [];
  private sessionId: string;
  private performanceMarks: Map<string, number> = new Map();

  constructor(private errorService: ErrorService) {
    this.sessionId = this.generateSessionId();
    this.setupPerformanceMonitoring();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private setupPerformanceMonitoring() {
    // Monitor page load performance
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.logPerformance('page_load', 'Page Load Complete');
      });

      // Monitor memory usage
      if ((performance as any).memory) {
        setInterval(() => {
          const memory = (performance as any).memory;
          if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
            this.warn(LogCategory.PERFORMANCE, 'High memory usage detected', {
              used: memory.usedJSHeapSize,
              limit: memory.jsHeapSizeLimit,
              percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
            });
          }
        }, 30000); // Check every 30 seconds
      }
    }
  }

  // Basic logging methods
  debug(category: LogCategory, message: string, details?: any, tags?: string[]) {
    this.log(LogLevel.DEBUG, category, message, details, tags);
  }

  info(category: LogCategory, message: string, details?: any, tags?: string[]) {
    this.log(LogLevel.INFO, category, message, details, tags);
  }

  warn(category: LogCategory, message: string, details?: any, tags?: string[]) {
    this.log(LogLevel.WARN, category, message, details, tags);
  }

  error(category: LogCategory, message: string, details?: any, tags?: string[]) {
    this.log(LogLevel.ERROR, category, message, details, tags);
  }

  fatal(category: LogCategory, message: string, details?: any, tags?: string[]) {
    this.log(LogLevel.FATAL, category, message, details, tags);
  }

  // Performance logging
  startTimer(operation: string) {
    this.performanceMarks.set(operation, performance.now());
  }

  endTimer(operation: string, category: LogCategory = LogCategory.PERFORMANCE) {
    const startTime = this.performanceMarks.get(operation);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.performanceMarks.delete(operation);
      
      this.log(LogLevel.INFO, category, `Operation completed: ${operation}`, {
        operation,
        duration: Math.round(duration * 100) / 100
      }, ['performance']);
    }
  }

  logPerformance(operation: string, message: string, details?: any) {
    this.log(LogLevel.INFO, LogCategory.PERFORMANCE, message, {
      operation,
      ...details
    }, ['performance']);
  }

  // Security logging
  logSecurityEvent(event: string, details?: any) {
    this.log(LogLevel.WARN, LogCategory.SECURITY, `Security event: ${event}`, details, ['security']);
  }

  logAuthentication(operation: string, success: boolean, details?: any) {
    this.log(
      success ? LogLevel.INFO : LogLevel.WARN,
      LogCategory.AUTH,
      `Authentication ${operation}: ${success ? 'SUCCESS' : 'FAILED'}`,
      { operation, success, ...details },
      ['auth']
    );
  }

  // API logging
  logApiCall(method: string, url: string, status: number, duration?: number, details?: any) {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, LogCategory.API, `API ${method} ${url}`, {
      method,
      url,
      status,
      duration,
      ...details
    }, ['api']);
  }

  // Navigation logging
  logNavigation(from: string, to: string, duration?: number) {
    this.log(LogLevel.INFO, LogCategory.NAVIGATION, `Navigation: ${from} → ${to}`, {
      from,
      to,
      duration
    }, ['navigation']);
  }

  // Business logic logging
  logBusinessEvent(event: string, details?: any) {
    this.log(LogLevel.INFO, LogCategory.BUSINESS, `Business event: ${event}`, details, ['business']);
  }

  // UI interaction logging
  logUserInteraction(element: string, action: string, details?: any) {
    this.log(LogLevel.DEBUG, LogCategory.UI, `User interaction: ${action} on ${element}`, {
      element,
      action,
      ...details
    }, ['ui', 'interaction']);
  }

  // Error logging with advanced features
  logError(error: any, category: LogCategory = LogCategory.SYSTEM, context?: any) {
    const errorDetails = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context
    };

    this.log(LogLevel.ERROR, category, `Error: ${error.message}`, errorDetails, ['error']);

    // Also log to the error service for backward compatibility
    this.errorService.logComponentError(error, 'AdvancedLogger', 'logError');
  }

  // Private logging method
  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    details?: any,
    tags?: string[]
  ) {
    const logEntry: AdvancedLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      level,
      category,
      message,
      details,
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      tags: tags || [],
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    };

    this.logs.push(logEntry);

    // Console output based on level
    this.outputToConsole(logEntry);

    // Store in localStorage
    this.storeLog(logEntry);

    // Send to external service in production
    if (this.isProduction()) {
      this.sendToExternalService(logEntry);
    }
  }

  private generateLogId(): string {
    return 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getCurrentUserId(): string | undefined {
    return localStorage.getItem('userId') || undefined;
  }

  private outputToConsole(logEntry: AdvancedLogEntry) {
    const timestamp = logEntry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${logEntry.level}] [${logEntry.category}]`;
    
    switch (logEntry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, logEntry.message, logEntry.details);
        break;
      case LogLevel.INFO:
        console.info(prefix, logEntry.message, logEntry.details);
        break;
      case LogLevel.WARN:
        console.warn(prefix, logEntry.message, logEntry.details);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(prefix, logEntry.message, logEntry.details);
        break;
    }
  }

  private storeLog(logEntry: AdvancedLogEntry) {
    try {
      const storedLogs = JSON.parse(localStorage.getItem('advancedLogs') || '[]');
      storedLogs.push(logEntry);
      
      // Keep only last 500 logs
      if (storedLogs.length > 500) {
        storedLogs.splice(0, storedLogs.length - 500);
      }
      
      localStorage.setItem('advancedLogs', JSON.stringify(storedLogs));
    } catch (error) {
      console.error('Failed to store advanced log:', error);
    }
  }

  private sendToExternalService(logEntry: AdvancedLogEntry) {
    // Placeholder for external logging service integration
    // Example: Send to your backend API, Sentry, LogRocket, etc.
    try {
      // this.http.post('/api/logs', logEntry).subscribe();
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  private isProduction(): boolean {
    return environment.production;
  }

  // Query methods
  getLogs(level?: LogLevel, category?: LogCategory, hours?: number): AdvancedLogEntry[] {
    let filteredLogs = [...this.logs];

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    if (hours) {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      filteredLogs = filteredLogs.filter(log => log.timestamp > cutoffTime);
    }

    return filteredLogs;
  }

  getLogsByTag(tag: string): AdvancedLogEntry[] {
    return this.logs.filter(log => log.tags?.includes(tag));
  }

  getLogsByUser(userId: string): AdvancedLogEntry[] {
    return this.logs.filter(log => log.userId === userId);
  }

  getPerformanceLogs(): AdvancedLogEntry[] {
    return this.logs.filter(log => log.category === LogCategory.PERFORMANCE);
  }

  getErrorLogs(): AdvancedLogEntry[] {
    return this.logs.filter(log => log.level === LogLevel.ERROR || log.level === LogLevel.FATAL);
  }

  // Statistics methods
  getLogStatistics(hours: number = 24) {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentLogs = this.logs.filter(log => log.timestamp > cutoffTime);

    const stats = {
      total: recentLogs.length,
      byLevel: {} as Record<LogLevel, number>,
      byCategory: {} as Record<LogCategory, number>,
      errors: recentLogs.filter(log => log.level === LogLevel.ERROR || log.level === LogLevel.FATAL).length,
      warnings: recentLogs.filter(log => log.level === LogLevel.WARN).length,
      performance: recentLogs.filter(log => log.category === LogCategory.PERFORMANCE).length
    };

    // Count by level
    Object.values(LogLevel).forEach(level => {
      stats.byLevel[level] = recentLogs.filter(log => log.level === level).length;
    });

    // Count by category
    Object.values(LogCategory).forEach(category => {
      stats.byCategory[category] = recentLogs.filter(log => log.category === category).length;
    });

    return stats;
  }

  // Utility methods
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('advancedLogs');
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  getSessionId(): string {
    return this.sessionId;
  }
} 