import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Set profilesSampleRate to 1.0 to profile every transaction.
  // Since profilesSampleRate is relative to tracesSampleRate,
  // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
  // For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
  // results in 25% of transactions being profiled (0.5*0.5=0.25)
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // ...

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps

  environment: process.env.NODE_ENV || 'development',

  beforeSend(event) {
    // Filter out development errors in server-side
    if (process.env.NODE_ENV === 'development') {
      // Allow some errors for debugging
      if (event.exception && 
          event.exception.values &&
          event.exception.values[0] &&
          event.exception.values[0].value?.includes('ECONNREFUSED')) {
        return null; // Don't send connection errors in dev
      }
    }
    return event;
  },
});