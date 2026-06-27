import React, { useState, useEffect, useMemo } from "react";
import { Flame, Calendar } from "lucide-react";

const LS_KEY = "ob_activity_log";
const TOTAL_WEEKS = 15; // ~3.5 months of history
const DAYS_IN_WEEK = 7;

/** Normalise date to YYYY-MM-DD midnight UTC string */
function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Read the activity map from localStorage */
function readLog(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Record one activity event for today */
export function recordActivity() {
  const log = readLog();
  const today = toDateKey(new Date());
  log[today] = (log[today] || 0) + 1;
  localStorage.setItem(LS_KEY, JSON.stringify(log));
}

/** Compute current streak (consecutive days with ≥1 activity, ending today or yesterday) */
function computeStreak(log: Record<string, number>): number {
  let streak = 0;
  const now = new Date();
  // Check if today has activity, otherwise start from yesterday
  const todayKey = toDateKey(now);
  const startOffset = log[todayKey] ? 0 : 1;

  for (let i = startOffset; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    if (log[key] && log[key] > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function getIntensity(count: number): string {
  if (count === 0) return "bg-[#161b22] border-[#1b1f23]";
  if (count === 1) return "bg-emerald-950/60 border-emerald-900/40";
  if (count <= 3) return "bg-emerald-800/50 border-emerald-700/40";
  if (count <= 6) return "bg-emerald-600/60 border-emerald-500/40";
  return "bg-emerald-400/70 border-emerald-400/50";
}

function getTooltip(dateStr: string, count: number): string {
  const d = new Date(dateStr + "T00:00:00");
  const formatted = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (count === 0) return `No activity on ${formatted}`;
  return `${count} action${count > 1 ? "s" : ""} on ${formatted}`;
}

interface StreakHeatmapProps {
  /** Trigger a re-read when external state changes (e.g. a task is checked) */
  refreshKey?: number;
}

export default function StreakHeatmap({ refreshKey = 0 }: StreakHeatmapProps) {
  const [log, setLog] = useState<Record<string, number>>({});
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  useEffect(() => {
    setLog(readLog());
  }, [refreshKey]);

  // Build the grid: TOTAL_WEEKS columns × 7 rows
  const { grid, monthMarkers } = useMemo(() => {
    const now = new Date();
    const todayDay = now.getDay(); // 0=Sun .. 6=Sat
    const totalDays = TOTAL_WEEKS * DAYS_IN_WEEK;

    // Start date: go back totalDays from end of current week
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (totalDays - 1) - todayDay);

    const cells: { date: string; count: number; col: number; row: number }[] = [];
    const months: { label: string; col: number }[] = [];
    let lastMonth = -1;

    for (let i = 0; i < totalDays + todayDay + 1; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = toDateKey(d);
      const col = Math.floor(i / 7);
      const row = i % 7;

      // Track month labels at column boundaries
      if (d.getMonth() !== lastMonth && row === 0) {
        months.push({ label: MONTH_LABELS[d.getMonth()], col });
        lastMonth = d.getMonth();
      }

      // Don't render future dates
      if (d > now) continue;

      cells.push({ date: key, count: log[key] || 0, col, row });
    }

    return { grid: cells, monthMarkers: months };
  }, [log]);

  const streak = computeStreak(log);
  const totalActivities = Object.values(log).reduce((a, b) => a + b, 0);
  const activeDays = Object.values(log).filter((v) => v > 0).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-zinc-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            Activity Heatmap
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Streak counter */}
          <div className="flex items-center gap-1.5">
            <Flame className={`w-4 h-4 ${streak > 0 ? "text-orange-400" : "text-zinc-700"}`} />
            <span
              className={`text-sm font-bold font-mono ${streak > 0 ? "text-orange-400" : "text-zinc-600"}`}
            >
              {streak}
            </span>
            <span className="text-[10px] font-mono text-zinc-600">day streak</span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <span className="text-[10px] font-mono text-zinc-600">
            {activeDays} active days · {totalActivities} actions
          </span>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-block">
          {/* Month labels */}
          <div className="flex ml-8 mb-1">
            {monthMarkers.map((m, i) => (
              <span
                key={i}
                className="text-[9px] font-mono text-zinc-600"
                style={{ position: "relative", left: `${m.col * 14}px`, marginRight: "-10px" }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-1.5 pt-0">
              {DAY_LABELS.map((label, i) => (
                <span
                  key={i}
                  className="text-[8px] font-mono text-zinc-700 h-[12px] flex items-center justify-end w-6"
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Grid cells */}
            <div
              className="grid gap-[2px]"
              style={{
                gridTemplateRows: `repeat(7, 12px)`,
                gridTemplateColumns: `repeat(${TOTAL_WEEKS + 1}, 12px)`,
                gridAutoFlow: "column",
              }}
            >
              {grid.map((cell) => (
                <div
                  key={cell.date}
                  className={`w-[12px] h-[12px] rounded-[2px] border transition-all duration-150 cursor-default ${getIntensity(cell.count)} ${
                    hoveredCell === cell.date ? "ring-1 ring-zinc-500 scale-125 z-10" : ""
                  }`}
                  title={getTooltip(cell.date, cell.count)}
                  onMouseEnter={() => setHoveredCell(cell.date)}
                  onMouseLeave={() => setHoveredCell(null)}
                />
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-2 ml-8">
            <span className="text-[8px] font-mono text-zinc-700">Less</span>
            {[0, 1, 2, 5, 8].map((count, i) => (
              <div
                key={i}
                className={`w-[10px] h-[10px] rounded-[2px] border ${getIntensity(count)}`}
              />
            ))}
            <span className="text-[8px] font-mono text-zinc-700">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
