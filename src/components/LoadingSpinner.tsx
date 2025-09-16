import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

/**
 * Reusable loading spinner component with customizable size and styling
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text
}) => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-2">
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-primary border-t-transparent',
            sizeClasses[size],
            className
          )}
        />
        {text && (
          <p className="text-sm text-muted-foreground">{text}</p>
        )}
      </div>
    </div>
  );
};

/**
 * Full-screen loading overlay
 */
export const LoadingOverlay: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};

/**
 * Inline loading state for smaller components
 */
export const InlineLoader: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <LoadingSpinner size="sm" />
      {text && <span>{text}</span>}
    </div>
  );
};
