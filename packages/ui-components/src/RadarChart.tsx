import React from 'react';

interface DataPoint {
  label: string;
  value: number; // 0-100
  color?: string;
}

interface RadarChartProps {
  title: string;
  data: DataPoint[];
  size?: number;
  levels?: number;
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

export const RadarChart: React.FC<RadarChartProps> = ({
  title,
  data,
  size = 300,
  levels = 5,
  theme,
}) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - 60) / 2;

  // Calculate points for the polygon
  const getPolygonPoints = (values: number[]) => {
    const angleStep = (2 * Math.PI) / values.length;
    return values.map((value, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius * value / 100);
      const y = centerY + Math.sin(angle) * (radius * value / 100);
      return `${x},${y}`;
    }).join(' ');
  };

  // Generate grid points
  const getGridPoints = (level: number) => {
    const angleStep = (2 * Math.PI) / data.length;
    return Array.from({ length: data.length }, (_, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius * level / levels);
      const y = centerY + Math.sin(angle) * (radius * level / levels);
      return `${x},${y}`;
    }).join(' ');
  };

  // Generate label positions
  const getLabelPositions = () => {
    const angleStep = (2 * Math.PI) / data.length;
    return data.map((_, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const labelRadius = radius + 30;
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;
      return { x, y, angle: angle * 180 / Math.PI };
    });
  };

  const polygonPoints = getPolygonPoints(data.map(d => d.value));
  const labelPositions = getLabelPositions();

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: '16px',
        padding: '20px',
        border: `1px solid ${theme.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Title */}
      <h3
        style={{
          fontFamily: theme.fonts.primary,
          fontSize: '1rem',
          color: theme.colors.text,
          margin: 0,
          marginBottom: '20px',
        }}
      >
        {title}
      </h3>

      {/* Chart */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: `${size}px`,
        }}
      >
        {/* Grid circles */}
        {Array.from({ length: levels }, (_, level) => (
          <circle
            key={level}
            cx={centerX}
            cy={centerY}
            r={(radius * (level + 1)) / levels}
            fill="none"
            stroke={theme.colors.border}
            strokeWidth="1"
            opacity="0.3"
          />
        ))}

        {/* Grid polygon */}
        <polygon
          points={getGridPoints(levels)}
          fill="none"
          stroke={theme.colors.border}
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Lines from center to vertices */}
        {data.map((_, index) => {
          const angleStep = (2 * Math.PI) / data.length;
          const angle = angleStep * index - Math.PI / 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          return (
            <line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke={theme.colors.border}
              strokeWidth="1"
              opacity="0.3"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill={`${theme.colors.primary}20`}
          stroke={theme.colors.primary}
          strokeWidth="2"
          style={{
            filter: `drop-shadow(0 0 8px ${theme.colors.primary}40)`,
          }}
        />

        {/* Data points */}
        {data.map((point, index) => {
          const angleStep = (2 * Math.PI) / data.length;
          const angle = angleStep * index - Math.PI / 2;
          const x = centerX + Math.cos(angle) * (radius * point.value / 100);
          const y = centerY + Math.sin(angle) * (radius * point.value / 100);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={point.color || theme.colors.primary}
              stroke={theme.colors.surface}
              strokeWidth="2"
              style={{
                cursor: 'pointer',
                transition: 'r 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.setAttribute('r', '6');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.setAttribute('r', '4');
              }}
            />
          );
        })}

        {/* Labels */}
        {labelPositions.map((pos, index) => {
          const dataPoint = data[index];
          const isRight = pos.x > centerX;
          const isBottom = pos.y > centerY;

          return (
            <text
              key={index}
              x={pos.x}
              y={pos.y}
              textAnchor={isRight ? 'start' : 'end'}
              dominantBaseline={isBottom ? 'hanging' : 'middle' as any}
              fill={theme.colors.text}
              fontSize="12"
              fontFamily={theme.fonts.secondary}
              style={{
                fontWeight: '500',
              }}
            >
              {dataPoint.label}
            </text>
          );
        })}

        {/* Level indicators */}
        {Array.from({ length: levels }, (_, level) => {
          const levelValue = Math.round((100 * (level + 1)) / levels);
          return (
            <text
              key={level}
              x={centerX + 5}
              y={centerY - (radius * (level + 1)) / levels + 4}
              fill={theme.colors.textSecondary}
              fontSize="10"
              fontFamily={theme.fonts.secondary}
            >
              {levelValue}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
        }}
      >
        {data.map((point, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: theme.fonts.secondary,
              fontSize: '0.8rem',
              color: theme.colors.textSecondary,
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: point.color || theme.colors.primary,
              }}
            />
            <span>{point.label}: {point.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RadarChart;