/**
 * Skeleton Loading Component
 * Displays placeholder loading animations
 */

import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className,
  style,
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'circular':
        return {
          borderRadius: '50%',
          width: width || '40px',
          height: height || '40px',
        };
      case 'rectangular':
        return {
          borderRadius: '0',
          width: width || '100%',
          height: height || '100px',
        };
      case 'rounded':
        return {
          borderRadius: '12px',
          width: width || '100%',
          height: height || '100px',
        };
      case 'text':
      default:
        return {
          borderRadius: '4px',
          width: width || '100%',
          height: height || '1em',
        };
    }
  };

  const getAnimationStyles = (): string => {
    switch (animation) {
      case 'wave':
        return `
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.05) 75%
          );
          background-size: 200% 100%;
          animation: skeleton-wave 1.5s ease-in-out infinite;
        `;
      case 'pulse':
        return `
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        `;
      default:
        return '';
    }
  };

  return (
    <>
      <div
        className={className}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          ...getVariantStyles(),
          ...style,
        }}
      />
      {animation !== 'none' && (
        <style>
          {`
            @keyframes skeleton-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.4; }
            }
            @keyframes skeleton-wave {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}
        </style>
      )}
    </>
  );
};

// Pre-built skeleton components for common patterns

interface SkeletonCardProps {
  showImage?: boolean;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showImage = true,
  lines = 3,
}) => (
  <div
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }}
  >
    {showImage && (
      <Skeleton
        variant="rounded"
        height="120px"
        style={{ marginBottom: '16px' }}
      />
    )}
    <Skeleton
      variant="text"
      width="60%"
      height="24px"
      style={{ marginBottom: '12px' }}
    />
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? '80%' : '100%'}
        height="14px"
        style={{ marginBottom: i < lines - 1 ? '8px' : '0' }}
      />
    ))}
  </div>
);

export const SkeletonDisciplineCard: React.FC = () => (
  <div
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
      <Skeleton variant="circular" width="56px" height="56px" />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" width="70%" height="20px" style={{ marginBottom: '8px' }} />
        <Skeleton variant="text" width="40%" height="14px" />
      </div>
    </div>
    <Skeleton variant="rounded" height="8px" style={{ marginBottom: '12px' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Skeleton variant="text" width="30%" height="12px" />
      <Skeleton variant="text" width="20%" height="12px" />
    </div>
  </div>
);

export const SkeletonSkillCard: React.FC = () => (
  <div
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <Skeleton variant="circular" width="40px" height="40px" />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" width="80%" height="16px" style={{ marginBottom: '6px' }} />
        <Skeleton variant="text" width="50%" height="12px" />
      </div>
    </div>
    <Skeleton variant="rounded" height="32px" />
  </div>
);


export const SkeletonStats: React.FC = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '16px',
    }}
  >
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Skeleton
          variant="circular"
          width="48px"
          height="48px"
          style={{ margin: '0 auto 12px' }}
        />
        <Skeleton
          variant="text"
          width="60%"
          height="24px"
          style={{ margin: '0 auto 8px' }}
        />
        <Skeleton
          variant="text"
          width="80%"
          height="14px"
          style={{ margin: '0 auto' }}
        />
      </div>
    ))}
  </div>
);

export const SkeletonPage: React.FC<{ title?: boolean }> = ({ title = true }) => (
  <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
    {title && (
      <div style={{ marginBottom: '24px' }}>
        <Skeleton variant="text" width="200px" height="32px" style={{ marginBottom: '8px' }} />
        <Skeleton variant="text" width="300px" height="16px" />
      </div>
    )}
    <SkeletonStats />
    <div style={{ marginTop: '24px' }}>
      <Skeleton variant="text" width="150px" height="24px" style={{ marginBottom: '16px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonDisciplineCard key={i} />
        ))}
      </div>
    </div>
  </div>
);

export default Skeleton;
