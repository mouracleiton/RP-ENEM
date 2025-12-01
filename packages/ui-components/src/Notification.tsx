import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';

export interface NotificationProps {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  className?: string;
}

export const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  className = '',
}) => {
  const { currentTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / duration) * 100;
          return Math.max(0, newProgress);
        });
      }, 100);

      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: currentTheme.colors.success,
          icon: '✓',
        };
      case 'warning':
        return {
          backgroundColor: currentTheme.colors.warning,
          icon: '⚠',
        };
      case 'error':
        return {
          backgroundColor: currentTheme.colors.error,
          icon: '✕',
        };
      case 'info':
        return {
          backgroundColor: currentTheme.colors.primary,
          icon: 'ℹ',
        };
      default:
        return {
          backgroundColor: currentTheme.colors.primary,
          icon: 'ℹ',
        };
    }
  };

  const typeStyles = getTypeStyles();

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: currentTheme.colors.surface,
    borderLeft: `4px solid ${typeStyles.backgroundColor}`,
    borderRadius: '8px',
    boxShadow: `0 4px 12px rgba(0, 0, 0, 0.15)`,
    marginBottom: '8px',
    position: 'relative',
    overflow: 'hidden',
    transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
    opacity: isVisible ? 1 : 0,
    transition: 'all 0.3s ease-in-out',
    minWidth: '300px',
    maxWidth: '400px',
  };

  const iconStyles: React.CSSProperties = {
    fontSize: '1.25rem',
    color: typeStyles.backgroundColor,
    flexShrink: 0,
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
    color: currentTheme.colors.text,
  };

  const titleStyles: React.CSSProperties = {
    fontFamily: currentTheme.fonts.primary,
    fontSize: '0.875rem',
    fontWeight: 'bold',
    margin: '0 0 4px 0',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  };

  const messageStyles: React.CSSProperties = {
    fontFamily: currentTheme.fonts.secondary,
    fontSize: '0.875rem',
    margin: 0,
    lineHeight: 1.4,
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: currentTheme.colors.textSecondary,
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  };

  const progressBarStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '3px',
    backgroundColor: typeStyles.backgroundColor,
    transition: 'width 0.1s linear',
  };

  return (
    <div
      className={`cyberpunk-notification ${className}`}
      style={containerStyles}
    >
      {/* Icon */}
      <span style={iconStyles}>
        {typeStyles.icon}
      </span>

      {/* Content */}
      <div style={contentStyles}>
        {title && (
          <div style={titleStyles}>
            {title}
          </div>
        )}
        <div style={messageStyles}>
          {message}
        </div>
      </div>

      {/* Close button */}
      <button
        style={closeButtonStyles}
        onClick={handleClose}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = currentTheme.colors.background;
          e.currentTarget.style.color = typeStyles.backgroundColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = currentTheme.colors.textSecondary;
        }}
      >
        ×
      </button>

      {/* Progress bar */}
      {duration > 0 && (
        <div
          style={{
            ...progressBarStyles,
            width: `${progress}%`,
          }}
        />
      )}
    </div>
  );
};

// Notification container component
export interface NotificationContainerProps {
  notifications: Array<{
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title?: string;
    message: string;
    duration?: number;
  }>;
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onClose,
  position = 'top-right',
  className = '',
}) => {
  const { currentTheme } = useTheme();

  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case 'top-right':
        return {
          top: '20px',
          right: '20px',
        };
      case 'top-left':
        return {
          top: '20px',
          left: '20px',
        };
      case 'bottom-right':
        return {
          bottom: '20px',
          right: '20px',
        };
      case 'bottom-left':
        return {
          bottom: '20px',
          left: '20px',
        };
      default:
        return {
          top: '20px',
          right: '20px',
        };
    }
  };

  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    ...getPositionStyles(),
  };

  return (
    <div
      className={`cyberpunk-notification-container ${className}`}
      style={containerStyles}
    >
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};