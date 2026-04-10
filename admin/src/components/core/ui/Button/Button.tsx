import { ButtonHTMLAttributes, useState, useCallback, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'regular' | 'info' | 'success' | 'warning' | 'error';
type IconPosition = 'start' | 'end';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  variant: ButtonVariant;
  icon?: string;
  iconPosition?: IconPosition; /* for button list check*/
  isOutlined?: boolean;
  isDisabled?: boolean;
  onLoadingReset?: (resetFn: () => void) => void;
}

const variantStyles: Record<ButtonVariant, { solid: string; outlined: string }> = {
  regular: {
    solid: 'bg-accent hover:bg-accent/90 text-neutral border-accent',
    outlined: 'bg-transparent hover:bg-accent/10 text-accent border-accent border',
  },
  info: {
    solid: 'bg-info-light hover:bg-info-light/90 text-white dark:bg-info-dark dark:hover:bg-info-dark/90 border-info-light dark:border-info-dark',
    outlined: 'bg-transparent hover:bg-info-light/10 text-info-light dark:text-info-dark border-info-light dark:border-info-dark border',
  },
  success: {
    solid: 'bg-success-light hover:bg-success-light/90 text-white dark:bg-success-dark dark:hover:bg-success-dark/90 border-success-light dark:border-success-dark',
    outlined: 'bg-transparent hover:bg-success-light/10 text-success-light dark:text-success-dark border-success-light dark:border-success-dark border',
  },
  warning: {
    solid: 'bg-warning-light hover:bg-warning-light/90 text-black dark:bg-warning-dark dark:hover:bg-warning-dark/90 dark:text-black border-warning-light dark:border-warning-dark',
    outlined: 'bg-transparent hover:bg-warning-light/10 text-black dark:text-black border-warning-light dark:border-warning-dark border',
  },
  error: {
    solid: 'bg-error-light hover:bg-error-light/90 text-white dark:bg-error-dark dark:hover:bg-error-dark/90 border-error-light dark:border-error-dark',
    outlined: 'bg-transparent hover:bg-error-light/10 text-error-light dark:text-error-dark border-error-light dark:border-error-dark border',
  },
};

export function Button({ text = 'no-text', variant, icon, iconPosition, isOutlined = false, isDisabled = false, onLoadingReset, className = '', ...props }: ButtonProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const isLoading = isClicked;

  const resetLoading = useCallback(() => {
    setIsClicked(false);
    setShowSpinner(false);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || isDisabled) return;
    setIsClicked(true);
    setShowSpinner(true);
    const enhancedEvent = { ...e, resetLoading };
    props.onClick?.(enhancedEvent as typeof e);
  };

  useMemo(() => {
    onLoadingReset?.(resetLoading);
  }, [onLoadingReset, resetLoading]);

  if (icon && !iconPosition) {
    throw new Error('iconPosition is required when icon is provided');
  }

  const IconComponent = icon ? (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon] : null;

  const showDisabledStyle = isDisabled && !isLoading;

  return (
    <button
      type="submit"
      className={`px-4 py-2 rounded font-medium transition-colors flex items-center gap-2 min-w-[80px] justify-center ${showDisabledStyle ? 'opacity-50 cursor-not-allowed' : ''} ${isOutlined ? variantStyles[variant].outlined : variantStyles[variant].solid} ${className}`}
      onClick={handleClick}
    >
      {iconPosition === 'start' && IconComponent && !showSpinner && <IconComponent className="w-4 h-4" />}
      {showSpinner && <Loader2 className="w-4 h-4 animate-spin" />}
      {text}
      {iconPosition === 'end' && IconComponent && !showSpinner && <IconComponent className="w-4 h-4" />}
    </button>
  );
}
