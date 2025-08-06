import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { ErrorService } from '../services/error.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const errorService = inject(ErrorService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log HTTP errors
      errorService.logHttpError(error, request.url);

      // Handle specific HTTP error codes
      switch (error.status) {
        case 400:
          console.error('Bad Request:', error.error);
          break;
        case 401:
          console.error('Unauthorized:', error.error);
          // Redirect to login if unauthorized
          // this.router.navigate(['/login']);
          break;
        case 403:
          console.error('Forbidden:', error.error);
          break;
        case 404:
          console.error('Not Found:', error.error);
          break;
        case 429:
          console.error('Rate Limited:', error.error);
          errorService.logRateLimitError(error, request.url);
          break;
        case 500:
          console.error('Internal Server Error:', error.error);
          break;
        case 502:
          console.error('Bad Gateway:', error.error);
          break;
        case 503:
          console.error('Service Unavailable:', error.error);
          break;
        case 504:
          console.error('Gateway Timeout:', error.error);
          break;
        default:
          console.error('HTTP Error:', error);
      }

      // Handle network errors
      if (error.status === 0) {
        errorService.logNetworkError(error, 'HTTP_REQUEST');
      }

      return throwError(() => error);
    })
  );
}; 