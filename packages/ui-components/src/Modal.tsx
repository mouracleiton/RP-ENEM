import React, { useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { Button } from './Button';
import { Text } from './Text';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdropClick = true,
  footer,
  className = '',
  style = {},
}) => {
  const { currentTheme } = useTheme();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'small':
        return {
          maxWidth: '400px',
          width: '90%',
        };
      case 'medium':
        return {
          maxWidth: '600px',
          width: '90%',
        };
      case 'large':
        return {
          maxWidth: '800px',
          width: '95%',
        };
      default:
        return {
          maxWidth: '600px',
          width: '90%',
        };
    }
  };

  const backdropStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  };

  const modalStyles: React.CSSProperties = {
    backgroundColor: currentTheme.colors.surface,
    border: `2px solid ${currentTheme.colors.primary}`,
    borderRadius: '12px',
    boxShadow: `0 0 30px ${currentTheme.colors.primary}`,
    position: 'relative',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...getSizeStyles(),
    ...style,
  };

  const headerStyles: React.CSSProperties = {
    padding: '1.5rem',
    borderBottom: `1px solid ${currentTheme.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: currentTheme.colors.background,
  };

  const contentStyles: React.CSSProperties = {
    padding: '1.5rem',
    flex: 1,
    overflowY: 'auto',
    color: currentTheme.colors.text,
  };

  const footerStyles: React.CSSProperties = {
    padding: '1.5rem',
    borderTop: `1px solid ${currentTheme.colors.border}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    backgroundColor: currentTheme.colors.background,
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: currentTheme.colors.textSecondary,
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <div
      className={`cyberpunk-modal-backdrop ${className}`}
      style={backdropStyles}
      onClick={handleBackdropClick}
    >
      <div
        className="cyberpunk-modal"
        style={modalStyles}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div style={headerStyles}>
            {title && (
              <Text
                variant="heading"
                size="lg"
                color={currentTheme.colors.primary}
                glow
              >
                {title}
              </Text>
            )}
            {showCloseButton && (
              <button
                style={closeButtonStyles}
                onClick={onClose}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = currentTheme.colors.primary;
                  e.currentTarget.style.backgroundColor = currentTheme.colors.surface;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = currentTheme.colors.textSecondary;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div style={contentStyles}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={footerStyles}>
            {footer}
          </div>
        )}

        {/* Corner decorations */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '12px',
            height: '12px',
            borderTop: `2px solid ${currentTheme.colors.primary}`,
            borderRight: `2px solid ${currentTheme.colors.primary}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            width: '12px',
            height: '12px',
            borderBottom: `2px solid ${currentTheme.colors.primary}`,
            borderLeft: `2px solid ${currentTheme.colors.primary}`,
          }}
        />
      </div>
    </div>
  );
};