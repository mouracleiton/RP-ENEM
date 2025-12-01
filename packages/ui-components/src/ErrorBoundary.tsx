/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you could send to error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0f3460 100%)',
            padding: '20px',
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              padding: '40px',
              border: '1px solid rgba(255, 100, 100, 0.3)',
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(255, 100, 100, 0.1)',
            }}
          >
            {/* Error Icon */}
            <div
              style={{
                fontSize: '64px',
                marginBottom: '24px',
                animation: 'shake 0.5s ease-in-out',
              }}
            >
              <span role="img" aria-label="Error">
                &#x26A0;&#xFE0F;
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                margin: '0 0 16px 0',
                color: '#ff6b6b',
                fontSize: '28px',
                fontWeight: 'bold',
              }}
            >
              Ops! Algo deu errado
            </h1>

            {/* Description */}
            <p
              style={{
                margin: '0 0 24px 0',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '16px',
                lineHeight: 1.6,
              }}
            >
              Encontramos um problema inesperado. Seu progresso foi salvo automaticamente.
              Tente novamente ou recarregue a pagina.
            </p>

            {/* Error Details (optional) */}
            {this.props.showDetails && this.state.error && (
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    color: '#ff6b6b',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}
                >
                  Detalhes do erro:
                </div>
                <code
                  style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    wordBreak: 'break-word',
                    display: 'block',
                  }}
                >
                  {this.state.error.message}
                </code>
                {this.state.errorInfo && (
                  <details style={{ marginTop: '12px' }}>
                    <summary
                      style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      Stack trace
                    </summary>
                    <pre
                      style={{
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '10px',
                        marginTop: '8px',
                        maxHeight: '150px',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
              }}
            >
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '14px 28px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4caf50, #81c784)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 20px rgba(76, 175, 80, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Tentar Novamente
              </button>

              <button
                onClick={this.handleReload}
                style={{
                  padding: '14px 28px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                Recarregar
              </button>
            </div>

            {/* Support Link */}
            <p
              style={{
                marginTop: '24px',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '12px',
              }}
            >
              Se o problema persistir, entre em contato com o suporte.
            </p>
          </div>

          {/* CSS Animation */}
          <style>
            {`
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
              }
            `}
          </style>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap any component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `WithErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithErrorBoundary;
}

export default ErrorBoundary;
