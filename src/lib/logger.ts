/**
 * Centralized logging utility
 * Provides consistent logging with environment-aware behavior
 */

import { isDevelopment } from './env';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    // In production, only log errors and warnings
    if (!isDevelopment) {
      return level === 'error' || level === 'warn';
    }
    return true;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message}\nContext: ${JSON.stringify(context, null, 2)}`;
    }
    
    return `${prefix} ${message}`;
  }

  error(message: string, error?: any, context?: LogContext): void {
    if (!this.shouldLog('error')) return;

    const fullContext = {
      ...context,
      ...(error && { error: error.message || error }),
    };

    console.error(this.formatMessage('error', message, fullContext));
    
    // In production, you could send this to an error tracking service
    // if (isProduction && window.Sentry) {
    //   window.Sentry.captureException(error || new Error(message), { extra: context });
    // }
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, context));
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    console.info(this.formatMessage('info', message, context));
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    console.debug(this.formatMessage('debug', message, context));
  }

  // Specialized logging methods for common use cases
  authError(message: string, error?: any): void {
    this.error(`Authentication Error: ${message}`, error, { category: 'auth' });
  }

  dbError(message: string, error?: any): void {
    this.error(`Database Error: ${message}`, error, { category: 'database' });
  }

  apiError(message: string, error?: any, endpoint?: string): void {
    this.error(`API Error: ${message}`, error, { category: 'api', endpoint });
  }

  routeError(message: string, path?: string): void {
    this.error(`Route Error: ${message}`, undefined, { category: 'routing', path });
  }
}

// Export a singleton instance
export const logger = new Logger();

// Export individual methods for convenience
export const { error, warn, info, debug, authError, dbError, apiError, routeError } = logger;
