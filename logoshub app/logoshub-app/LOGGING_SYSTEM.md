# LogoHub Logging System Documentation

## Overview

The LogoHub application includes a comprehensive logging system designed to capture, store, and analyze various types of application events, errors, and performance metrics. The system consists of two main components:

1. **ErrorService** - Basic error logging for common HTTP/web app errors
2. **AdvancedLoggerService** - Advanced logging with categories, levels, and performance monitoring

## Features

### 🔍 **Error Tracking**
- HTTP errors (400, 401, 403, 404, 429, 500, 502, 503, 504)
- Authentication errors (Firebase, Google OAuth)
- Network connectivity issues
- Validation errors
- Navigation errors
- Component and service errors
- Database operation errors
- File upload errors
- Rate limiting errors
- Performance issues

### 📊 **Advanced Logging**
- Multiple log levels (DEBUG, INFO, WARN, ERROR, FATAL)
- Categorized logging (AUTH, NAVIGATION, API, UI, PERFORMANCE, SECURITY, BUSINESS, SYSTEM)
- Performance monitoring with timers
- User interaction tracking
- Session management
- Tag-based filtering
- Real-time statistics

### 🎯 **Log Viewers**
- **Error Log Viewer** (`/logs`) - View and filter error logs
- **Advanced Log Viewer** (`/advanced-logs`) - Comprehensive log analysis with statistics

## Quick Start

### 1. Basic Error Logging

```typescript
import { ErrorService } from './services/error.service';

constructor(private errorService: ErrorService) {}

// Log HTTP errors
this.errorService.logHttpError(error, 'API call');

// Log authentication errors
this.errorService.logAuthError(error, 'google_oauth');

// Log validation errors
this.errorService.logValidationError('email', 'invalid@email', 'email_format');
```

### 2. Advanced Logging

```typescript
import { AdvancedLoggerService, LogCategory, LogLevel } from './services/advanced-logger.service';

constructor(private logger: AdvancedLoggerService) {}

// Basic logging
this.logger.info(LogCategory.API, 'API call successful', { endpoint: '/users' });
this.logger.warn(LogCategory.SECURITY, 'Multiple failed login attempts', { ip: '192.168.1.1' });
this.logger.error(LogCategory.SYSTEM, 'Database connection failed', { error: 'Connection timeout' });

// Performance logging
this.logger.startTimer('user-registration');
// ... perform operation
this.logger.endTimer('user-registration', LogCategory.PERFORMANCE);

// User interaction logging
this.logger.logUserInteraction('login-button', 'click', { timestamp: new Date() });

// Authentication logging
this.logger.logAuthentication('login', true, { method: 'email_password' });
```

## Log Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| **DEBUG** | Detailed information for debugging | Development, troubleshooting |
| **INFO** | General information about application flow | User actions, successful operations |
| **WARN** | Warning messages for potentially harmful situations | Deprecated features, performance issues |
| **ERROR** | Error events that might still allow the application to continue | API failures, validation errors |
| **FATAL** | Severe errors that will prevent the application from running | System crashes, critical failures |

## Log Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **AUTH** | Authentication and authorization events | Login, logout, permission checks |
| **NAVIGATION** | Page navigation and routing | Route changes, navigation errors |
| **API** | API calls and responses | HTTP requests, API errors |
| **UI** | User interface interactions | Button clicks, form submissions |
| **PERFORMANCE** | Performance metrics and timing | Page load times, operation duration |
| **SECURITY** | Security-related events | Failed login attempts, suspicious activity |
| **BUSINESS** | Business logic events | User registration, data processing |
| **SYSTEM** | System-level events | Startup, shutdown, configuration changes |

## HTTP Interceptor

The application includes an automatic HTTP interceptor that logs all HTTP errors:

```typescript
// Automatically logs HTTP errors with context
GET /api/users → 404 Not Found
POST /api/auth → 401 Unauthorized
GET /api/data → 500 Internal Server Error
```

## Performance Monitoring

### Automatic Monitoring
- Page load performance
- Memory usage monitoring
- Network request timing

### Manual Performance Tracking
```typescript
// Start timing an operation
this.logger.startTimer('complex-calculation');

// Perform the operation
const result = await this.performComplexCalculation();

// End timing and log the result
this.logger.endTimer('complex-calculation', LogCategory.PERFORMANCE);
```

## Log Storage

### Development Mode
- Logs are stored in browser's localStorage
- Console output for immediate debugging
- Maximum 500 advanced logs, 100 error logs

### Production Mode
- Logs can be sent to external services (configurable)
- Examples: Sentry, LogRocket, custom backend API
- Automatic cleanup to prevent memory issues

## Log Viewers

### Error Log Viewer (`/logs`)
- View all error logs
- Filter by error type
- Export logs as JSON
- Clear logs functionality

### Advanced Log Viewer (`/advanced-logs`)
- **Statistics Dashboard**: Real-time log statistics
- **Multi-level Filtering**: By type, level, category, time range
- **Search Functionality**: Search within log messages
- **Export Options**: Export filtered or all logs
- **Session Tracking**: View logs by session ID

## Configuration

### Environment Variables
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  // Add your logging service configurations here
  logging: {
    enableConsoleLogs: true,
    enableLocalStorage: true,
    enableExternalService: false,
    externalServiceUrl: 'https://your-logging-service.com/api/logs'
  }
};
```

### External Service Integration
```typescript
// Example: Sentry integration
import * as Sentry from '@sentry/angular';

private sendToExternalService(logEntry: AdvancedLogEntry) {
  Sentry.captureException(new Error(logEntry.message), {
    extra: logEntry.details,
    tags: logEntry.tags,
    level: logEntry.level.toLowerCase()
  });
}
```

## Best Practices

### 1. **Use Appropriate Log Levels**
```typescript
// ✅ Good
this.logger.debug(LogCategory.API, 'Making API call', { url: '/users' });
this.logger.info(LogCategory.AUTH, 'User logged in successfully');
this.logger.warn(LogCategory.PERFORMANCE, 'Slow API response', { duration: 5000 });
this.logger.error(LogCategory.SYSTEM, 'Database connection failed');

// ❌ Avoid
this.logger.error(LogCategory.UI, 'User clicked button'); // Should be INFO
this.logger.info(LogCategory.SYSTEM, 'Application crashed'); // Should be FATAL
```

### 2. **Include Relevant Context**
```typescript
// ✅ Good
this.logger.error(LogCategory.API, 'API call failed', {
  endpoint: '/users',
  method: 'POST',
  statusCode: 500,
  userId: currentUser.id,
  timestamp: new Date().toISOString()
});

// ❌ Avoid
this.logger.error(LogCategory.API, 'API call failed'); // No context
```

### 3. **Use Performance Timers**
```typescript
// ✅ Good
this.logger.startTimer('user-registration');
try {
  await this.registerUser(userData);
  this.logger.endTimer('user-registration', LogCategory.PERFORMANCE);
} catch (error) {
  this.logger.error(LogCategory.AUTH, 'User registration failed', { error });
}
```

### 4. **Tag Important Logs**
```typescript
// ✅ Good
this.logger.info(LogCategory.BUSINESS, 'New user registered', userData, ['user-registration', 'business-critical']);
this.logger.warn(LogCategory.SECURITY, 'Multiple failed login attempts', { ip, attempts }, ['security', 'alert']);
```

## Troubleshooting

### Common Issues

1. **Logs not appearing in viewer**
   - Check if localStorage is enabled
   - Verify the log viewer route is accessible
   - Check browser console for errors

2. **Performance impact**
   - Reduce log frequency in production
   - Use appropriate log levels
   - Implement log rotation

3. **External service not receiving logs**
   - Check network connectivity
   - Verify service configuration
   - Check authentication credentials

### Debug Mode
```typescript
// Enable debug logging
this.logger.debug(LogCategory.SYSTEM, 'Debug mode enabled', {
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  url: window.location.href
});
```

## API Reference

### ErrorService Methods
- `logHttpError(error, context?)`
- `logAuthError(error, authMethod?)`
- `logFirebaseError(error, operation?)`
- `logNetworkError(error, requestType?)`
- `logValidationError(field, value, validationRule)`
- `logNavigationError(error, route?)`
- `logComponentError(error, componentName, method?)`
- `logServiceError(error, serviceName, method?)`
- `logDatabaseError(error, operation?, table?)`
- `logFileUploadError(error, fileName?, fileSize?)`
- `logRateLimitError(error, endpoint?)`
- `logPerformanceError(error, metric?)`

### AdvancedLoggerService Methods
- `debug(category, message, details?, tags?)`
- `info(category, message, details?, tags?)`
- `warn(category, message, details?, tags?)`
- `error(category, message, details?, tags?)`
- `fatal(category, message, details?, tags?)`
- `startTimer(operation)`
- `endTimer(operation, category?)`
- `logPerformance(operation, message, details?)`
- `logSecurityEvent(event, details?)`
- `logAuthentication(operation, success, details?)`
- `logApiCall(method, url, status, duration?, details?)`
- `logNavigation(from, to, duration?)`
- `logBusinessEvent(event, details?)`
- `logUserInteraction(element, action, details?)`
- `logError(error, category?, context?)`

## Security Considerations

1. **Sensitive Data**: Never log passwords, tokens, or personal information
2. **Data Retention**: Implement log rotation and cleanup policies
3. **Access Control**: Restrict log viewer access to authorized users
4. **Data Encryption**: Encrypt logs when storing or transmitting

## Future Enhancements

- [ ] Real-time log streaming
- [ ] Log analytics and reporting
- [ ] Alert system for critical errors
- [ ] Integration with monitoring tools
- [ ] Custom log dashboards
- [ ] Log correlation and tracing
- [ ] Machine learning for error prediction 