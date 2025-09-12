import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Here you could send error to logging service
    // reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="max-w-lg mx-auto mt-8">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Something went wrong</CardTitle>
            <CardDescription>
              An unexpected error occurred. Please try refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => window.location.reload()}
              className="mb-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-muted p-4 rounded text-sm">
                <summary className="cursor-pointer font-medium mb-2">
                  Error Details (Development)
                </summary>
                <div className="whitespace-pre-wrap">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div>
                    <strong>Stack:</strong>
                    <pre className="text-xs mt-1">{this.state.error.stack}</pre>
                  </div>
                  {this.state.errorInfo && (
                    <div className="mt-2">
                      <strong>Component Stack:</strong>
                      <pre className="text-xs mt-1">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components to reset error boundary
export const useErrorBoundary = () => {
  return {
    resetError: () => {
      // This would typically work with a state management solution
      window.location.reload();
    }
  };
};

// Specialized Query Error Boundary for React Query errors
interface QueryErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

export const QueryErrorBoundary: React.FC<QueryErrorBoundaryProps> = ({ 
  children, 
  onReset 
}) => {
  return (
    <ErrorBoundary
      fallback={
        <Card className="max-w-lg mx-auto mt-8">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Failed to load data</CardTitle>
            <CardDescription>
              There was a problem loading the requested data. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => {
                if (onReset) {
                  onReset();
                } else {
                  window.location.reload();
                }
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  );
};
