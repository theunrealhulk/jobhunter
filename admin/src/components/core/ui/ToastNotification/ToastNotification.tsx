import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';

type ToastVariant = 'regular' | 'info' | 'success' | 'warning' | 'error';
type ToastLocation = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

interface ToastNotificationProps {
  text: string;
  variant?: ToastVariant;
  location?: ToastLocation;
  duration?: number;
  onDismiss?: () => void;
}

const variantIcons: Record<ToastVariant, string> = {
  regular: 'Flag',
  info: 'Info',
  success: 'CircleCheck',
  warning: 'TriangleAlert',
  error: 'CircleX',
};

const variantStyles: Record<ToastVariant, { bg: string; border: string; text: string; iconColor: string }> = {
  regular: {
    bg: 'bg-white dark:bg-gray-800',
    border: 'border-gray-300 dark:border-gray-600',
    text: 'text-neutral dark:text-white',
    iconColor: 'text-gray-600 dark:text-gray-300',
  },
  info: {
    bg: 'bg-info-light/10 dark:bg-info-dark/10',
    border: 'border-info-light dark:border-info-dark',
    text: 'text-info-light dark:text-info-dark',
    iconColor: 'text-info-light dark:text-info-dark',
  },
  success: {
    bg: 'bg-success-light/10 dark:bg-success-dark/10',
    border: 'border-success-light dark:border-success-dark',
    text: 'text-success-light dark:text-success-dark',
    iconColor: 'text-success-light dark:text-success-dark',
  },
  warning: {
    bg: 'bg-warning-light/10 dark:bg-warning-dark/10',
    border: 'border-warning-light dark:border-warning-dark',
    text: 'text-warning-light dark:text-warning-dark',
    iconColor: 'text-warning-light dark:text-warning-dark',
  },
  error: {
    bg: 'bg-error-light/10 dark:bg-error-dark/10',
    border: 'border-error-light dark:border-error-dark',
    text: 'text-error-light dark:text-error-dark',
    iconColor: 'text-error-light dark:text-error-dark',
  },
};

const locationStyles: Record<ToastLocation, string> = {
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
};

export function ToastNotification({
  text,
  variant = 'regular',
  location = 'top-right',
  duration = 5000,
  onDismiss,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss?.(), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), 300);
  };

  const IconComponent = LucideIcons[variantIcons[variant] as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>;
  const styles = variantStyles[variant];

  return (
    <div
      className={`
        fixed ${locationStyles[location]} z-50
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border
        ${styles.bg} ${styles.border}
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      {IconComponent && <IconComponent className={`w-5 h-5 flex-shrink-0 ${styles.iconColor}`} />}
      <span className={`text-sm font-medium ${styles.text}`}>{text}</span>
      <button
        onClick={handleDismiss}
        className={`ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${styles.iconColor}`}
      >
        <LucideIcons.X className="w-4 h-4" />
      </button>
    </div>
  );
}
