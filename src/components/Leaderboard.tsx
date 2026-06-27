import React, { useEffect, useState, useCallback } from "react";
import {
  Trophy,
  Zap,
  GitMerge,
  GitPullRequest,
  CheckCircle2,
  RefreshCw,
  Medal,
  Crown,
} from "lucide-react";

interface LeaderboardEntry {
  login: string;
  name: string;
  avatarUrl: string;
  level: string;
  interest: string;
  skills: string[];
  xp: number;
  completedTasks: number;
  totalTasks: number;
  mergedPRs: number;
  pendingPRs: number;
}

const LEVEL_COLORS: Record<string, string> = {
  Advanced: "text-rose-400 bg-rose-950/30 border-rose-800/50",
  Intermediate: "text-sky-400 bg-sky-950/30 border-sky-800/50",
  Beginner: "text-emerald-400 bg-emerald-950/30 border-emerald-800/50",
};

const INTEREST_COLORS: Record<string, string> = {
  Frontend: "text-violet-400",
  Backend: "text-cyan-400",
  Fullstack: "text-amber-400",
  "AI / Machine Learning": "text-pink-400",
  "DevOps / Infrastructure": "text-orange-400",
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-amber-950/40 border border-amber-700/60 shadow-lg shadow-amber-900/20">
        <Crown className="w-4.5 h-4.5 text-amber-400" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-700/40 border border-zinc-500/50">
        <Medal className="w-4.5 h-4.5 text-zinc-300" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-950/40 border border-orange-800/50">
        <Medal className="w-4.5 h-4.5 text-orange-400" />
      </div>
    );
  return (
    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#161b22] border border-[#30363d]">
      <span className="text-sm font-bold font-mono text-zinc-500">#{rank}</span>
    </div>
  );
}

function XPBar({ xp, maxXp }: { xp: number; maxXp: number }) {
  const pct = maxXp > 0 ? Math.min(100, (xp / maxXp) * 100) : 0;
  return (
    <div className="w-full h-1.5 bg-[#0d1117] rounded-full overflow-hidden border border-[#21262d]">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

interface LeaderboardProps {
  currentLogin?: string;
}

export default function Leaderboard({ currentLogin }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Failed to load leaderboard");
      const data = await res.json();
      setEntries(data.entries || []);
      setLastRefreshed(new Date());
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const maxXp = entries[0]?.xp || 1;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] font-sans antialiased">
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[350px] bg-amber-600/4 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[300px] bg-blue-600/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-amber-950/30 border border-amber-800/40 rounded-lg">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Contributor Leaderboard</h1>
            </div>
            <p className="text-zinc-500 text-sm">
              Ranked by XP — earned through roadmap milestones and merged pull requests.
            </p>
          </div>

          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#30363d] bg-[#161b22] hover:border-zinc-600 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-all shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* XP Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl border border-[#30363d] bg-[#161b22] text-[11px] font-mono text-zinc-500">
          <span className="font-bold text-zinc-400 uppercase tracking-wider">XP Formula:</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Task: +50 XP
          </span>
          <span className="flex items-center gap-1">
            <GitMerge className="w-3.5 h-3.5 text-purple-400" /> Merged PR: +200 XP
          </span>
          <span className="flex items-center gap-1">
            <GitPullRequest className="w-3.5 h-3.5 text-blue-400" /> Open PR: +30 XP
          </span>
          <span className="ml-auto text-zinc-600">
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </span>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-900/40 bg-red-950/20 text-red-400 text-sm font-mono">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl border border-[#30363d] bg-[#161b22] animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && entries.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <Trophy className="w-12 h-12 text-zinc-700 mx-auto" />
            <p className="text-zinc-500 font-mono text-sm">No contributors on the board yet.</p>
            <p className="text-zinc-600 text-xs">
              Complete roadmap tasks and merge PRs to appear here!
            </p>
          </div>
        )}

        {/* Leaderboard entries */}
        {!loading && entries.length > 0 && (
          <div className="space-y-3">
            {entries.map((entry, idx) => {
              const rank = idx + 1;
              const isCurrentUser = entry.login === currentLogin;
              const taskPct =
                entry.totalTasks > 0
                  ? Math.round((entry.completedTasks / entry.totalTasks) * 100)
                  : 0;

              return (
                <div
                  key={entry.login}
                  className={`
                    relative rounded-xl border p-4 transition-all duration-200
                    ${
                      isCurrentUser
                        ? "border-blue-700/60 bg-blue-950/15 ring-1 ring-blue-700/30"
                        : rank <= 3
                          ? "border-[#30363d] bg-gradient-to-r from-[#161b22] to-[#161b22] hover:border-zinc-600"
                          : "border-[#30363d] bg-[#161b22] hover:border-zinc-700"
                    }
                  `}
                >
                  {isCurrentUser && (
                    <span className="absolute top-2 right-2 text-[9px] font-mono font-bold text-blue-400 bg-blue-950/50 border border-blue-800/40 px-1.5 py-0.5 rounded">
                      YOU
                    </span>
                  )}

                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <RankBadge rank={rank} />

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={entry.avatarUrl}
                        alt={entry.login}
                        className={`w-10 h-10 rounded-full border-2 ${
                          rank === 1
                            ? "border-amber-600"
                            : rank === 2
                              ? "border-zinc-500"
                              : rank === 3
                                ? "border-orange-600"
                                : "border-[#30363d]"
                        }`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://avatars.dicebear.com/api/identicon/${entry.login}.svg`;
                        }}
                      />
                    </div>

                    {/* Identity + stats */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-zinc-100 font-mono">
                          @{entry.login}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                            LEVEL_COLORS[entry.level] || LEVEL_COLORS["Beginner"]
                          }`}
                        >
                          {entry.level}
                        </span>
                        <span
                          className={`text-[10px] font-mono ${
                            INTEREST_COLORS[entry.interest] || "text-zinc-400"
                          }`}
                        >
                          {entry.interest}
                        </span>
                      </div>

                      {/* Skills chips */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {entry.skills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0d1117] border border-[#21262d] text-zinc-500"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* XP bar */}
                      <XPBar xp={entry.xp} maxXp={maxXp} />
                    </div>

                    {/* Right stats column */}
                    <div className="shrink-0 text-right space-y-1 hidden sm:block">
                      <div className="flex items-center justify-end gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-base font-bold font-mono text-white">
                          {entry.xp.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-zinc-600 font-mono">XP</span>
                      </div>
                      <div className="flex items-center justify-end gap-3 text-[10px] font-mono text-zinc-500">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {entry.completedTasks}/{entry.totalTasks}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitMerge className="w-3 h-3 text-purple-400" />
                          {entry.mergedPRs}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-600">{taskPct}% roadmap</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        {!loading && entries.length > 0 && (
          <p className="text-center text-[11px] font-mono text-zinc-700 mt-8">
            Showing top {entries.length} contributors · Updates every time a PR is merged or a task
            is completed
          </p>
        )}
      </div>
    </div>
  );
}
