import { useState, useId } from 'react';
import { formatDate } from '../utils/weatherUtils';

interface WeatherChartProps {
  dates: string[];
  maxTemps: number[];
  minTemps: number[];
}

export default function WeatherChart({ dates, maxTemps, minTemps }: WeatherChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const chartId = useId();

  // Guard for empty or mismatched data
  if (!dates || dates.length === 0 || maxTemps.length === 0 || minTemps.length === 0) {
    return (
      <div id="chart-placeholder" className="flex h-48 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400">
        No temperature trend data available
      </div>
    );
  }

  // Find min and max for scaling
  const allTemps = [...maxTemps, ...minTemps];
  const absoluteMax = Math.max(...allTemps);
  const absoluteMin = Math.min(...allTemps);
  
  // Give some padding on top/bottom of y-axis range
  const tempRange = absoluteMax - absoluteMin;
  const paddingValue = tempRange === 0 ? 4 : Math.max(tempRange * 0.15, 2);
  const yAxisMax = absoluteMax + paddingValue;
  const yAxisMin = absoluteMin - paddingValue;
  const yRange = yAxisMax - yAxisMin;

  // SVG Chart Dimensions
  const svgWidth = 600;
  const svgHeight = 240;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Helper to get X/Y coordinates
  const getX = (index: number) => {
    return paddingLeft + (index / (dates.length - 1)) * chartWidth;
  };

  const getY = (temp: number) => {
    // scale from yAxisMin (bottom of chart) to yAxisMax (top of chart)
    const ratio = (temp - yAxisMin) / yRange;
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  // Generate path points
  const maxPoints = maxTemps.map((temp, idx) => ({ x: getX(idx), y: getY(temp), temp, date: dates[idx] }));
  const minPoints = minTemps.map((temp, idx) => ({ x: getX(idx), y: getY(temp), temp, date: dates[idx] }));

  // Create SVG path strings
  const createLinePath = (points: { x: number; y: number }[]) => {
    return points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');
  };

  // Create area path strings (for background fill)
  const createAreaPath = (points: { x: number; y: number }[], baselineY: number) => {
    if (points.length === 0) return '';
    const linePath = createLinePath(points);
    const startX = points[0].x;
    const endX = points[points.length - 1].x;
    return `${linePath} L ${endX} ${baselineY} L ${startX} ${baselineY} Z`;
  };

  const maxLinePath = createLinePath(maxPoints);
  const minLinePath = createLinePath(minPoints);

  const baselineY = paddingTop + chartHeight;
  const maxAreaPath = createAreaPath(maxPoints, baselineY);
  const minAreaPath = createAreaPath(minPoints, baselineY);

  // Grid lines (3 horizontal levels)
  const gridLevels = 4;
  const gridLines = Array.from({ length: gridLevels }).map((_, idx) => {
    const tempValue = yAxisMin + (idx / (gridLevels - 1)) * yRange;
    return {
      y: getY(tempValue),
      value: Math.round(tempValue * 10) / 10,
    };
  });

  return (
    <div id={`${chartId}-weather-chart-container`} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-sans text-base font-bold text-slate-800">Weekly Forecast Trend</h3>
          <p className="font-sans text-xs text-slate-500">Weekly high and low temperature curves</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500"></span>
            <span className="text-slate-500">Max Temp</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500"></span>
            <span className="text-slate-500">Min Temp</span>
          </div>
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
          id={`${chartId}-trend-svg`}
        >
          <defs>
            <linearGradient id={`${chartId}-grad-max`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id={`${chartId}-grad-min`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLines.map((line, idx) => (
            <g key={idx} className="opacity-60">
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={svgWidth - paddingRight}
                y2={line.y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={line.y + 3}
                textAnchor="end"
                className="fill-slate-400 font-mono text-[10px]"
              >
                {line.value}°C
              </text>
            </g>
          ))}

          {/* Area under curves */}
          <path d={maxAreaPath} fill={`url(#${chartId}-grad-max)`} />
          <path d={minAreaPath} fill={`url(#${chartId}-grad-min)`} />

          {/* Main curve lines */}
          <path
            d={maxLinePath}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
          <path
            d={minLinePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Dynamic interaction vertical line */}
          {hoveredIdx !== null && (
            <line
              x1={getX(hoveredIdx)}
              y1={paddingTop}
              x2={getX(hoveredIdx)}
              y2={baselineY}
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* Interactive data points */}
          {maxPoints.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g key={`max-pt-${idx}`}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill="#ffffff"
                  stroke="#f43f5e"
                  strokeWidth={isHovered ? 3 : 2}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}

          {minPoints.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g key={`min-pt-${idx}`}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill="#ffffff"
                  stroke="#3b82f6"
                  strokeWidth={isHovered ? 3 : 2}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}

          {/* X Axis Labels */}
          {dates.map((date, idx) => {
            const labelX = getX(idx);
            const isHovered = hoveredIdx === idx;
            return (
              <text
                key={idx}
                x={labelX}
                y={svgHeight - 15}
                textAnchor="middle"
                className={`font-sans text-[10px] transition-colors duration-200 ${
                  isHovered ? 'fill-slate-800 font-semibold' : 'fill-slate-400 font-bold uppercase'
                }`}
              >
                {formatDate(date).split(',')[0]}
              </text>
            );
          })}

          {/* Hover columns (transparent for better touch & hover targeting) */}
          {dates.map((_, idx) => {
            const colWidth = chartWidth / (dates.length - 1);
            const startX = getX(idx) - colWidth / 2;
            return (
              <rect
                key={`hitbox-${idx}`}
                x={idx === 0 ? paddingLeft : startX}
                y={paddingTop}
                width={idx === 0 || idx === dates.length - 1 ? colWidth / 2 : colWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Floating Tooltip Div */}
        {hoveredIdx !== null && (
          <div
            id={`${chartId}-tooltip`}
            className="absolute top-1 z-10 flex -translate-x-1/2 flex-col rounded-lg border border-slate-200 bg-white/95 p-2.5 shadow-md backdrop-blur-sm transition-all duration-150"
            style={{
              left: `${((getX(hoveredIdx) - paddingLeft) / chartWidth) * 100}%`,
              marginLeft: `${(paddingLeft / svgWidth) * 100}%`,
            }}
          >
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {formatDate(dates[hoveredIdx])}
            </p>
            <div className="flex flex-col gap-0.5 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-600">High:</span>
                <span className="font-mono font-bold text-rose-600">{maxTemps[hoveredIdx]}°C</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-600">Low:</span>
                <span className="font-mono font-bold text-blue-600">{minTemps[hoveredIdx]}°C</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
