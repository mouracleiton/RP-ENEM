import React, { useMemo } from 'react';

interface DataPoint {
  x: number;
  y: number;
  label?: string;
}

interface LineChartProps {
  title: string;
  data: DataPoint[];
  color?: string;
  height?: number;
  showGrid?: boolean;
  showDots?: boolean;
  showLabels?: boolean;
  curve?: 'linear' | 'smooth';
  theme: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      border: string;
    };
    fonts: {
      primary: string;
      secondary: string;
    };
  };
}

export const LineChart: React.FC<LineChartProps> = ({
  title,
  data,
  color,
  height = 200,
  showGrid = true,
  showDots = true,
  showLabels = false,
  curve = 'smooth',
  theme,
}) => {
  const chartColor = color || theme.colors.primary;

  const { path, minX, maxX, minY, maxY } = useMemo(() => {
    if (data.length === 0) return { path: '', minX: 0, maxX: 1, minY: 0, maxY: 1 };

    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 600 - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Normalize data points
    const normalizedPoints = data.map(point => ({
      x: ((point.x - minX) / (maxX - minX || 1)) * width + padding.left,
      y: chartHeight - ((point.y - minY) / (maxY - minY || 1)) * chartHeight + padding.top,
    }));

    // Generate path
    let path = '';
    if (curve === 'smooth') {
      // Smooth curve using quadratic bezier curves
      for (let i = 0; i < normalizedPoints.length; i++) {
        const point = normalizedPoints[i];
        if (i === 0) {
          path += `M ${point.x} ${point.y}`;
        } else {
          const prevPoint = normalizedPoints[i - 1];
          const cpx = (prevPoint.x + point.x) / 2;
          const cpy1 = prevPoint.y;
          const cpy2 = point.y;
          path += ` C ${cpx} ${cpy1}, ${cpx} ${cpy2}, ${point.x} ${point.y}`;
        }
      }
    } else {
      // Linear path
      path = normalizedPoints.map((point, i) =>
        `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
      ).join(' ');
    }

    return { path, minX, maxX, minY, maxY };
  }, [data, height, curve]);

  if (data.length === 0) {
    return (
      <div
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${theme.colors.border}`,
          height: `${height + 60}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: theme.colors.textSecondary }}>
          Nenhum dado disponível
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: '16px',
        padding: '20px',
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* Title */}
      <h3
        style={{
          fontFamily: theme.fonts.primary,
          fontSize: '1rem',
          color: theme.colors.text,
          margin: 0,
          marginBottom: '16px',
        }}
      >
        {title}
      </h3>

      {/* Chart */}
      <svg
        width="600"
        height={height}
        viewBox="0 0 600 300"
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: '100%',
        }}
      >
        {/* Grid */}
        {showGrid && (
          <g opacity="0.1">
            {/* Horizontal lines */}
            {[0, 25, 50, 75, 100].map((percent) => (
              <line
                key={`h-${percent}`}
                x1="40"
                y1={`${height * (1 - percent / 100)}px`}
                x2="580"
                y2={`${height * (1 - percent / 100)}px`}
                stroke={theme.colors.border}
                strokeWidth="1"
              />
            ))}
            {/* Vertical lines */}
            {[0, 25, 50, 75, 100].map((percent) => (
              <line
                key={`v-${percent}`}
                x1={`${40 + 540 * (percent / 100)}px`}
                y1="0"
                x2={`${40 + 540 * (percent / 100)}px`}
                y2={height}
                stroke={theme.colors.border}
                strokeWidth="1"
              />
            ))}
          </g>
        )}

        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke={chartColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: `drop-shadow(0 0 4px ${chartColor}40)`,
          }}
        />

        {/* Area under curve */}
        <path
          d={`${path} L 580 ${height} L 40 ${height} Z`}
          fill={chartColor}
          opacity="0.1"
        />

        {/* Dots */}
        {showDots && data.map((point, index) => {
          const x = ((point.x - minX) / (maxX - minX || 1)) * 540 + 40;
          const y = height - ((point.y - minY) / (maxY - minY || 1)) * height;

          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="5"
                fill={chartColor}
                stroke={theme.colors.surface}
                strokeWidth="2"
                style={{
                  cursor: 'pointer',
                  transition: 'r 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.setAttribute('r', '7');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.setAttribute('r', '5');
                }}
              />
              {showLabels && point.label && (
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  fill={theme.colors.text}
                  fontSize="12"
                  fontFamily={theme.fonts.secondary}
                >
                  {point.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Y-axis labels */}
        <g>
          {[0, 25, 50, 75, 100].map((percent) => {
            const value = minY + (maxY - minY) * (percent / 100);
            return (
              <text
                key={`y-label-${percent}`}
                x="35"
                y={`${height * (1 - percent / 100) + 4}px`}
                textAnchor="end"
                fill={theme.colors.textSecondary}
                fontSize="11"
                fontFamily={theme.fonts.secondary}
              >
                {Math.round(value)}
              </text>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      {data.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px',
            fontFamily: theme.fonts.secondary,
            fontSize: '0.875rem',
            color: theme.colors.textSecondary,
          }}
        >
          <div
            style={{
              width: '12px',
              height: '3px',
              backgroundColor: chartColor,
              borderRadius: '2px',
            }}
          />
          <span>
            Min: {Math.round(minY)} • Max: {Math.round(maxY)}
          </span>
        </div>
      )}
    </div>
  );
};

export default LineChart;