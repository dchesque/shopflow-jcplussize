import * as Sentry from '@sentry/nextjs';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface CustomError {
  message: string;
  context?: Record<string, any>;
  severity?: ErrorSeverity;
  tags?: Record<string, string>;
}

/**
 * Log an error with additional context
 */
export function logError(error: Error | string | CustomError, extra?: Record<string, any>) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    console.error('Error:', error, extra);
    return;
  }

  if (typeof error === 'string') {
    Sentry.captureMessage(error, 'error');
  } else if (error instanceof Error) {
    Sentry.captureException(error);
  } else {
    // CustomError
    Sentry.withScope((scope) => {
      if (error.context) {
        scope.setContext('custom_context', error.context);
      }
      if (error.tags) {
        Object.entries(error.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      if (error.severity) {
        scope.setLevel(error.severity as any);
      }
      if (extra) {
        scope.setContext('extra', extra);
      }
      Sentry.captureMessage(error.message, 'error');
    });
  }
}

/**
 * Log a warning
 */
export function logWarning(message: string, context?: Record<string, any>) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    console.warn('Warning:', message, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('warning_context', context);
    }
    scope.setLevel('warning');
    Sentry.captureMessage(message, 'warning');
  });
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    console.log('Event:', eventName, properties);
    return;
  }

  Sentry.addBreadcrumb({
    message: eventName,
    category: 'custom',
    level: 'info',
    data: properties,
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Performance monitoring
 */
export function startTransaction(name: string, operation: string = 'navigation') {
  return Sentry.startSpan({ name, op: operation }, () => {});
}

/**
 * API call monitoring
 */
export function monitorApiCall<T>(
  apiCall: () => Promise<T>,
  endpoint: string
): Promise<T> {
  return Sentry.startSpan(
    {
      name: `API ${endpoint}`,
      op: 'http.client',
    },
    async () => {
      try {
        const result = await apiCall();
        Sentry.setTag('api.status', 'success');
        return result;
      } catch (error) {
        Sentry.setTag('api.status', 'error');
        logError({
          message: `API call failed: ${endpoint}`,
          context: { endpoint, error: error instanceof Error ? error.message : 'Unknown error' },
          severity: 'medium',
          tags: { component: 'api' },
        });
        throw error;
      }
    }
  );
}

/**
 * Component error boundary
 */
export function captureComponentError(
  error: Error,
  errorInfo: { componentStack: string }
) {
  Sentry.withScope((scope) => {
    scope.setTag('errorBoundary', true);
    scope.setContext('componentStack', errorInfo);
    scope.setLevel('error');
    Sentry.captureException(error);
  });
}