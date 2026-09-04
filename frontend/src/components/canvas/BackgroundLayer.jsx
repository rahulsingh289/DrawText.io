import React from 'react';
import { Layer, Line, Circle, Rect } from 'react-konva';
import { useCanvasStore } from '../../store/useCanvasStore';

export const BackgroundLayer = ({ width, height }) => {
  const { backgroundSettings, stagePos, stageScale } = useCanvasStore();
  const { template, backgroundColor, gridColor, spacing } = backgroundSettings;

  if (template === 'blank') {
    return (
      <Layer listening={false}>
        <Rect
          x={-stagePos.x / stageScale - 2000}
          y={-stagePos.y / stageScale - 2000}
          width={(width / stageScale) + 4000}
          height={(height / stageScale) + 4000}
          fill={backgroundColor || '#12141c'}
        />
      </Layer>
    );
  }

  // Spacing sizes in pixels
  const spacingMap = {
    small: 20,
    medium: 36,
    large: 54,
  };
  const step = spacingMap[spacing] || 36;

  // Calculate visible bounds in world coordinates
  const minX = Math.floor((-stagePos.x / stageScale - 500) / step) * step;
  const maxX = Math.ceil(((width - stagePos.x) / stageScale + 500) / step) * step;
  const minY = Math.floor((-stagePos.y / stageScale - 500) / step) * step;
  const maxY = Math.ceil(((height - stagePos.y) / stageScale + 500) / step) * step;

  const lines = [];
  const dots = [];

  if (template === 'grid') {
    // Vertical grid lines
    for (let x = minX; x <= maxX; x += step) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, minY, x, maxY]}
          stroke={gridColor || '#262a3b'}
          strokeWidth={1 / stageScale}
        />
      );
    }
    // Horizontal grid lines
    for (let y = minY; y <= maxY; y += step) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[minX, y, maxX, y]}
          stroke={gridColor || '#262a3b'}
          strokeWidth={1 / stageScale}
        />
      );
    }
  } else if (template === 'ruled') {
    // Ruled horizontal notebook lines with a left margin line
    for (let y = minY; y <= maxY; y += step) {
      lines.push(
        <Line
          key={`ruled-${y}`}
          points={[minX, y, maxX, y]}
          stroke={gridColor || '#262a3b'}
          strokeWidth={1.2 / stageScale}
        />
      );
    }
    // Red / Accent Margin Line
    lines.push(
      <Line
        key="margin-line"
        points={[minX + step * 3, minY, minX + step * 3, maxY]}
        stroke="#f87171"
        opacity={0.5}
        strokeWidth={1.5 / stageScale}
      />
    );
  } else if (template === 'dots') {
    // Dot matrix pattern
    for (let x = minX; x <= maxX; x += step) {
      for (let y = minY; y <= maxY; y += step) {
        dots.push(
          <Circle
            key={`dot-${x}-${y}`}
            x={x}
            y={y}
            radius={1.5 / stageScale}
            fill={gridColor || '#333a4d'}
          />
        );
      }
    }
  }

  return (
    <Layer listening={false}>
      {/* Background Fill */}
      <Rect
        x={-stagePos.x / stageScale - 2000}
        y={-stagePos.y / stageScale - 2000}
        width={(width / stageScale) + 4000}
        height={(height / stageScale) + 4000}
        fill={backgroundColor || '#12141c'}
      />
      {/* Grid or Dot Elements */}
      {lines}
      {dots}
    </Layer>
  );
};
