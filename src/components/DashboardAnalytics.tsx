import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart2,
  Zap,
  GitMerge,
  CheckCircle2,
  Flame,
  TrendingUp,
  Target,
  Clock,
  Award,
  GitPullRequest,
  Star,
} from "lucide-react";
import { calculateXP, getLevelInfo, LEVELS } from "../lib/levelSystem";
import { DonutChart, Sparkline, HorizontalBarChart, ColumnChart } from "./Charts";
import { PersonalizedRoadmap } from "../types";

// ── Local activity log helpers ────────────────────────────────────────────────
const LS_ACTIVITY = "ob_activity_log";

function readActivityLog(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LS_ACTIVITY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function computeStreak(log: Record<string, number>): number {
  let streak = 0;
  const now = new Date();
  const todayKey = toDateKey(now);
  const startOffset = log[todayKey] ? 0 : 1;
  for (let i = startOffset; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if ((log[toDateKey(d)] ?? 0) > 0) streak++;
    else break;
  }
  return streak;
}

// Build last-N-days activity series
function buildActivitySeries(
  log: Record<string, number>,
  days: number,
): { label: string; value: number }[] {
  const out: { label: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    out.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: log[key] ?? 0,
    });
  }
  return out;
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  sparkData,
  sparkColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  sparkData?: number[];
  sparkColor?: string;
}) {
  return (
    <div
      className={`rounded-xl border bg-[#161b22] p-4 space-y-3 hover:border-zinc-600 transition-colors ${color}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            {label}
          </span>
          <span className="block text-2xl font-black text-white font-mono leading-none">
            {value}
          </span>
          {sub && <span className="block text-[11px] text-zinc-500 font-mono">{sub}</span>}
        </div>
        <div className="shrink-0 p-2 rounded-lg bg-[#0d1117] border border-[#30363d]">{icon}</div>
      </div>
      {sparkData && sparkData.length > 1 && (
        <Sparkline data={sparkData} color={sparkColor ?? "#3b82f6"} width={120} height={32} />
      )}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface DashboardAnalyticsProps {
  completedTasks: number;
  totalTasks: number;
  checkedRoadmapTasks: Record<string, boolean>;
  roadmap: PersonalizedRoadmap | null;
  pullRequests: any[];
  profile: { skills: string[]; level: string; interest: string };
  githubUser?: { login: string; public_repos: number; followers: number } | null;
  activityRefreshKey?: number;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DashboardAnalytics({
  completedTasks,
  totalTasks,
  checkedRoadmapTasks,
  roadmap,
  pullRequests,
  profile,
  githubUser,
  activityRefreshKey = 0,
}: DashboardAnalyticsProps) {
  const [activityLog, setActivityLog] = useState<Record<string, number>>({});
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setActivityLog(readActivityLog());
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [activityRefreshKey]);

  // ── Derived metrics ────────────────────────────────────────────────────────
  const xp = calculateXP(completedTasks, pullRequests.filter((p) => p.status === "MERGED").length);
  const levelInfo = getLevelInfo(xp);
  const streak = useMemo(() => computeStreak(activityLog), [activityLog]);

  const mergedPRs = pullRequests.filter((p) => p.status === "MERGED").length;
  const openPRs = pullRequests.filter(
    (p) => p.status === "PENDING" || p.status === "VERIFYING",
  ).length;
  const closedPRs = pullRequests.filter((p) => p.status === "FAILED").length;

  const roadmapCompletionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Week-by-week completion breakdown
  const weekBreakdown = useMemo(() => {
    if (!roadmap) return [];
    return (["week1", "week2", "week3", "week4"] as const).map((wk, i) => {
      const tasks = roadmap[wk] ?? [];
      const done = tasks.filter((_, ti) => checkedRoadmapTasks[`${wk}-${ti}`]).length;
      return {
        label: `W${i + 1}`,
        value: done,
        color: done === tasks.length && tasks.length > 0 ? "#10b981" : "#3b82f6",
      };
    });
  }, [roadmap, checkedRoadmapTasks]);

  // Activity series — last 14 days
  const activitySeries = useMemo(() => buildActivitySeries(activityLog, 14), [activityLog]);
  const activityValues = activitySeries.map((d) => d.value);
  const totalActivities = activityValues.reduce((a, b) => a + b, 0);

  // PR status donut
  const prDonutSegments = [
    { value: mergedPRs, color: "#10b981", label: "Merged" },
    { value: openPRs, color: "#3b82f6", label: "Open" },
    { value: closedPRs, color: "#f85149", label: "Closed" },
  ].filter((s) => s.value > 0);

  // Roadmap donut
  const roadmapDonutSegments = [
    { value: completedTasks, color: "#10b981", label: "Done" },
    { value: Math.max(totalTasks - completedTasks, 0), color: "#1f2937", label: "Remaining" },
  ];

  // XP level ladder
  const xpDonutSegments = [
    {
      value: xp,
      color: levelInfo.gradientFrom.replace("from-", "").includes("zinc")
        ? "#52525b"
        : levelInfo.gradientFrom.includes("blue")
          ? "#3b82f6"
          : levelInfo.gradientFrom.includes("orange")
            ? "#f97316"
            : levelInfo.gradientFrom.includes("violet")
              ? "#8b5cf6"
              : "#eab308",
      label: "Earned",
    },
    { value: Math.max(100 - xp, 0), color: "#1f2937", label: "Remaining" },
  ];

  // Skills top bar
  const skillBars = profile.skills.slice(0, 6).map((s, i) => ({
    label: s,
    value: Math.max(20, 100 - i * 15),
    color: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#f97316", "#06b6d4"][i % 6],
  }));

  return (
    <div
      className={`space-y-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-800/40">
            <BarChart2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100 tracking-tight">
              Analytics Dashboard
            </h2>
            <p className="text-[11px] text-zinc-500 font-mono">
              {githubUser ? `@${githubUser.login}` : "guest-committer"} · all-time progress
            </p>
          </div>
        </div>
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono font-bold ${levelInfo.bgColor} ${levelInfo.borderColor} ${levelInfo.textColor}`}
        >
          <span>{levelInfo.emoji}</span>
          <span>{levelInfo.name}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400">{xp} XP</span>
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Zap className="w-4 h-4 text-amber-400" />}
          label="Total XP"
          value={xp}
          sub={`of 100 max`}
          color="border-[#30363d]"
          sparkData={[0, 5, 10, xp * 0.4, xp * 0.7, xp]}
          sparkColor="#f59e0b"
        />
        <StatCard
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          label="Tasks Done"
          value={`${completedTasks}/${totalTasks}`}
          sub={`${roadmapCompletionPct}% complete`}
          color="border-[#30363d]"
          sparkData={weekBreakdown.map((w) => w.value)}
          sparkColor="#10b981"
        />
        <StatCard
          icon={<GitMerge className="w-4 h-4 text-purple-400" />}
          label="Merged PRs"
          value={mergedPRs}
          sub={`${openPRs} open · ${closedPRs} closed`}
          color="border-[#30363d]"
        />
        <StatCard
          icon={<Flame className="w-4 h-4 text-orange-400" />}
          label="Day Streak"
          value={streak}
          sub={`${totalActivities} actions · 14 days`}
          color="border-[#30363d]"
          sparkData={activityValues}
          sparkColor="#f97316"
        />
      </div>

      {/* ── Charts Row 1: Activity + Donuts ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity column chart */}
        <div className="lg:col-span-2 bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Activity
              </span>
              <h3 className="text-sm font-bold text-zinc-200">Last 14 Days</h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              {activityValues.filter((v) => v > 0).length} active days
            </div>
          </div>
          <ColumnChart data={activitySeries} height={100} color="#3b82f6" labelEvery={2} />
          <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-600 border-t border-[#21262d] pt-3">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Each bar = task completions on that day
          </div>
        </div>

        {/* Three donuts */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Breakdown
          </span>

          {/* Roadmap donut */}
          <div className="flex items-center gap-4">
            <DonutChart
              segments={roadmapDonutSegments}
              size={72}
              thickness={10}
              centerLabel={`${roadmapCompletionPct}%`}
              centerSub="done"
            />
            <div>
              <p className="text-xs font-bold text-zinc-300">Roadmap</p>
              <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                {completedTasks} of {totalTasks} tasks
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-mono text-zinc-600">Complete</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] border border-zinc-700" />
                <span className="text-[9px] font-mono text-zinc-600">Remaining</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#21262d]" />

          {/* XP donut */}
          <div className="flex items-center gap-4">
            <DonutChart
              segments={xpDonutSegments}
              size={72}
              thickness={10}
              centerLabel={`${xp}`}
              centerSub="XP"
            />
            <div>
              <p className="text-xs font-bold text-zinc-300">XP Progress</p>
              <p className={`text-[10px] font-mono mt-0.5 ${levelInfo.textColor}`}>
                {levelInfo.name} {levelInfo.emoji}
              </p>
              {levelInfo.nextLevel && (
                <p className="text-[9px] font-mono text-zinc-600 mt-0.5">
                  {levelInfo.xpToNext} XP to {levelInfo.nextLevel.name}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-[#21262d]" />

          {/* PR donut */}
          <div className="flex items-center gap-4">
            <DonutChart
              segments={
                prDonutSegments.length > 0
                  ? prDonutSegments
                  : [{ value: 1, color: "#1f2937", label: "None" }]
              }
              size={72}
              thickness={10}
              centerLabel={`${pullRequests.length}`}
              centerSub="PRs"
            />
            <div>
              <p className="text-xs font-bold text-zinc-300">Pull Requests</p>
              <div className="space-y-0.5 mt-1">
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {mergedPRs} Merged
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {openPRs} Open
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {closedPRs} Closed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts Row 2: Week breakdown + Skills + Level ──────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Week-by-week */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-zinc-400" />
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Roadmap
              </span>
              <h3 className="text-sm font-bold text-zinc-200">Week-by-Week</h3>
            </div>
          </div>
          {roadmap ? (
            <div className="space-y-3">
              {(["week1", "week2", "week3", "week4"] as const).map((wk, i) => {
                const tasks = roadmap[wk] ?? [];
                const done = tasks.filter((_, ti) => checkedRoadmapTasks[`${wk}-${ti}`]).length;
                const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
                const isComplete = pct === 100 && tasks.length > 0;
                return (
                  <div key={wk} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span
                        className={`flex items-center gap-1.5 ${isComplete ? "text-emerald-400" : "text-zinc-400"}`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3 text-zinc-600" />
                        )}
                        Week {i + 1}
                      </span>
                      <span
                        className={`font-bold ${isComplete ? "text-emerald-400" : "text-zinc-300"}`}
                      >
                        {done}/{tasks.length}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0d1117] rounded-full overflow-hidden border border-[#21262d]">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isComplete ? "bg-emerald-500" : "bg-blue-500/60"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-600 font-mono italic">No roadmap generated yet.</p>
          )}
        </div>

        {/* Skills */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-zinc-400" />
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Stack
              </span>
              <h3 className="text-sm font-bold text-zinc-200">Your Skills</h3>
            </div>
          </div>
          <HorizontalBarChart data={skillBars} maxValue={100} />
          <div className="pt-1 border-t border-[#21262d]">
            <span className="text-[10px] font-mono text-zinc-600">
              {profile.interest} · {profile.level}
            </span>
          </div>
        </div>

        {/* Level ladder */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-zinc-400" />
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Progression
              </span>
              <h3 className="text-sm font-bold text-zinc-200">Level Ladder</h3>
            </div>
          </div>
          <div className="space-y-2.5">
            {LEVELS.map((level) => {
              const isUnlocked = xp >= level.minXp;
              const isCurrent = level.name === levelInfo.name;
              const levelPct = isCurrent ? levelInfo.progressToNext : isUnlocked ? 100 : 0;
              return (
                <div key={level.name} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span
                      className={`flex items-center gap-1.5 ${isCurrent ? level.textColor : isUnlocked ? "text-zinc-400" : "text-zinc-700"}`}
                    >
                      <span>{level.emoji}</span>
                      <span className={isCurrent ? "font-bold" : ""}>{level.name}</span>
                      {isCurrent && (
                        <span className="text-[8px] px-1 py-0.5 rounded bg-white/10 border border-white/10">
                          CURRENT
                        </span>
                      )}
                    </span>
                    <span className={isUnlocked ? "text-zinc-400" : "text-zinc-700"}>
                      {level.minXp} XP
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#0d1117] rounded-full overflow-hidden border border-[#21262d]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${levelPct}%`,
                        background: isUnlocked
                          ? level.gradientFrom.includes("zinc")
                            ? "#52525b"
                            : level.gradientFrom.includes("blue")
                              ? "#3b82f6"
                              : level.gradientFrom.includes("orange")
                                ? "#f97316"
                                : level.gradientFrom.includes("violet")
                                  ? "#8b5cf6"
                                  : "#eab308"
                          : "#1f2937",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom: XP Breakdown table ───────────────────────────────────────── */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <GitPullRequest className="w-4 h-4 text-zinc-400" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            XP Sources
          </span>
          <h3 className="text-sm font-bold text-zinc-200 ml-1">Breakdown</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: "Roadmap Tasks",
              formula: `${Math.min(completedTasks, 12)} tasks × 5 XP`,
              earned: Math.min(completedTasks, 12) * 5,
              max: 60,
              color: "#10b981",
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
            },
            {
              label: "Merged PRs",
              formula: `${Math.min(mergedPRs, 4)} PRs × 10 XP`,
              earned: Math.min(mergedPRs, 4) * 10,
              max: 40,
              color: "#8b5cf6",
              icon: <GitMerge className="w-4 h-4 text-violet-400" />,
            },
            {
              label: "Total XP",
              formula: `${xp} / 100 max XP`,
              earned: xp,
              max: 100,
              color: levelInfo.gradientFrom.includes("zinc")
                ? "#52525b"
                : levelInfo.gradientFrom.includes("blue")
                  ? "#3b82f6"
                  : levelInfo.gradientFrom.includes("orange")
                    ? "#f97316"
                    : levelInfo.gradientFrom.includes("violet")
                      ? "#8b5cf6"
                      : "#eab308",
              icon: <Zap className="w-4 h-4 text-amber-400" />,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-[#0d1117] border border-[#21262d] rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="text-xs font-bold text-zinc-300">{item.label}</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-black text-white font-mono">{item.earned}</span>
                <span className="text-zinc-600 text-sm font-mono mb-0.5">/ {item.max}</span>
              </div>
              <div className="w-full h-2 bg-[#161b22] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(item.earned / item.max) * 100}%`, background: item.color }}
                />
              </div>
              <span className="block text-[10px] text-zinc-600 font-mono">{item.formula}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
