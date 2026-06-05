import React, { useMemo, useRef, useState } from "react";

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

// ── Thin wrapper for SVG animations ──────────────────────────────────────────
function AnimatedPath({ d, stroke, strokeWidth = 2, fill = "none" }: {
  d: string; stroke: string; strokeWidth?: number; fill?: string;
}) {
  return (
    <path
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
export function DonutChart({
  segments,
  size = 120,
  thickness = 18,
  centerLabel,
  centerSub,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
}) {
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = seg.value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const arc = { ...seg, dash, gap, offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1f2937" strokeWidth={thickness} />
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={thickness}
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeDashoffset={-arc.offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        ))}
      </svg>
      {(centerLabel || centerSub) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {centerLabel && <span className="text-lg font-black text-white font-mono leading-none">{centerLabel}</span>}
          {centerSub && <span className="text-[10px] text-zinc-500 font-mono mt-0.5">{centerSub}</span>}
        </div>
      )}
    </div>
  );
}

// ── Sparkline (mini line chart) ───────────────────────────────────────────────
export function Sparkline({
  data,
  color = "#3b82f6",
  width = 120,
  height = 36,
  filled = true,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  filled?: boolean;
}) {
  if (data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const points = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * w,
    y: pad + h - ((v - min) / range) * h,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = [
    `M ${points[0].x} ${height}`,
    ...points.map((p) => `L ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${height}`,
    "Z",
  ].join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {filled && (
        <defs>
          <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
      )}
      {filled && (
        <path d={areaPath} fill={`url(#grad-${color.replace("#","")})`} />
      )}
      <path d={linePath} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={3}
        fill={color}
        stroke="#0d1117"
        strokeWidth={1.5}
      />
    </svg>
  );
}

// ── Horizontal Bar Chart ──────────────────────────────────────────────────────
export function HorizontalBarChart({
  data,
  maxValue,
}: {
  data: DataPoint[];
  maxValue?: number;
}) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-2.5">
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-zinc-400">{item.label}</span>
            <span className="text-zinc-300 font-bold">{item.value}</span>
          </div>
          <div className="w-full h-2 bg-[#1f2937] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: item.color ?? "#3b82f6",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Vertical Bar / Column Chart ───────────────────────────────────────────────
export function ColumnChart({
  data,
  height = 80,
  color = "#3b82f6",
  labelEvery = 1,
}: {
  data: DataPoint[];
  height?: number;
  color?: string;
  labelEvery?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => {
        const barH = Math.max((d.value / max) * (height - 20), d.value > 0 ? 4 : 0);
        return (
          <div key={i} className="flex flex-col items-center justify-end flex-1 gap-0.5 group" style={{ height }}>
            <span className="text-[8px] font-mono text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
              {d.value}
            </span>
            <div
              className="w-full rounded-t-sm transition-all duration-500"
              style={{
                height: barH,
                background: d.color ?? color,
                minWidth: 4,
              }}
              title={`${d.label}: ${d.value}`}
            />
            {i % labelEvery === 0 && (
              <span className="text-[8px] font-mono text-zinc-700 truncate w-full text-center">
                {d.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
