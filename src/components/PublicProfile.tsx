import React, { useState, useEffect } from "react";
import {
  GitFork,
  Star,
  Award,
  CheckCircle2,
  Circle,
  ExternalLink,
  Share2,
  Check,
  ArrowLeft,
  Sparkles,
  Code,
  Globe,
  Zap,
  GitPullRequest,
  Calendar,
} from "lucide-react";
import LevelBadge from "./LevelBadge";

interface PublicProfileProps {
  login: string;
}

interface ProfileData {
  profile: {
    skills: string[];
    level: string;
    interest: string;
  };
  repos: Array<{
    name: string;
    description: string;
    match: string;
    difficulty: string;
    reason?: string;
    issues: string[];
  }>;
  roadmap: {
    week1: string[];
    week2: string[];
    week3: string[];
    week4: string[];
  } | null;
  checkedRoadmapTasks: { [key: string]: boolean };
}

const WEEK_LABELS = ["Week 1", "Week 2", "Week 3", "Week 4"];
const WEEK_SUBTITLES = ["Git & Setup", "Documentation", "Bug Fixing", "First PR"];

export default function PublicProfile({ login }: PublicProfileProps) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/user/${login}`);
        if (res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 80);
      }
    };
    fetchProfile();
  }, [login]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getCompletedCount = () => {
    if (!data?.checkedRoadmapTasks) return 0;
    return Object.values(data.checkedRoadmapTasks).filter(Boolean).length;
  };

  const getTotalTasks = () => {
    if (!data?.roadmap) return 12;
    return Object.values(data.roadmap).reduce((acc, w) => acc + w.length, 0);
  };

  const getLevelColor = (level: string) => {
    if (level === "Advanced") return "text-rose-400 border-rose-900/50 bg-rose-950/20";
    if (level === "Intermediate") return "text-sky-400 border-sky-900/50 bg-sky-950/20";
    return "text-emerald-400 border-emerald-900/50 bg-emerald-950/20";
  };

  const completedCount = getCompletedCount();
  const totalTasks = getTotalTasks();
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 font-mono text-sm">Loading @{login}'s profile…</p>
        </div>
      </div>
    );
  }

  // ── 404 ──────────────────────────────────────────────────────────────────
  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
            <span className="text-2xl">🔍</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100 font-mono">Profile not found</h1>
            <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
              <span className="text-zinc-300 font-semibold">@{login}</span> hasn't completed the
              OpenBridge onboarding yet, or the profile doesn't exist.
            </p>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-sm font-mono transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to OpenBridge
          </a>
        </div>
      </div>
    );
  }

  const { profile, repos, roadmap, checkedRoadmapTasks } = data;
  const weeks = roadmap ? (["week1", "week2", "week3", "week4"] as const) : [];

  // ── Profile page ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc]">
      {/* Ambient glow blobs */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[300px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top navigation bar */}
      <nav className="sticky top-0 z-50 border-b border-[#30363d] bg-[#0d1117]/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <span className="text-blue-400 font-bold tracking-tight">OB</span>
            <span className="hidden sm:inline text-zinc-600">/</span>
            <span className="hidden sm:inline text-zinc-300 font-semibold">@{login}</span>
          </a>

          <div className="flex items-center gap-2">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </a>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" /> Share
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* ── Hero: Identity Card ────────────────────────────────────────── */}
        <div
          className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6 sm:p-8 relative overflow-hidden">
            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Avatar placeholder */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-2xl font-bold text-white border-4 border-[#0d1117] shrink-0 font-mono shadow-xl select-none">
                {login.charAt(0).toUpperCase()}
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-white tracking-tight">@{login}</h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/40 border border-emerald-900/50 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    Active Contributor
                  </span>
                </div>

                <p className="text-zinc-400 text-sm leading-relaxed">
                  Open-source onboarding journey tracked via{" "}
                  <a href="/" className="text-blue-400 hover:underline font-semibold">
                    OpenBridge
                  </a>
                  . Specializing in{" "}
                  <span className="text-zinc-200 font-semibold">{profile.interest}</span>{" "}
                  development.
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${getLevelColor(profile.level)}`}
                  >
                    {profile.level}
                  </span>
                  {profile.skills.map((s, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-md text-[11px] font-mono bg-[#0d1117] border border-[#30363d] text-zinc-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Level badge chip */}
                <div className="mt-3">
                  <LevelBadge completedTasks={completedCount} mergedPRs={0} variant="profile" />
                </div>
              </div>

              {/* Progress ring / stat block */}
              <div className="flex gap-3 sm:flex-col sm:items-end shrink-0">
                <div className="text-center bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3">
                  <span className="block text-2xl font-bold text-white font-mono">
                    {progressPct}
                    <span className="text-base text-zinc-500">%</span>
                  </span>
                  <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 mt-0.5">
                    Roadmap Complete
                  </span>
                </div>
                <div className="text-center bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3">
                  <span className="block text-2xl font-bold text-white font-mono">
                    {completedCount}
                    <span className="text-sm text-zinc-500">/{totalTasks}</span>
                  </span>
                  <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 mt-0.5">
                    Tasks Done
                  </span>
                </div>
              </div>
            </div>

            {/* Overall progress bar */}
            <div className="relative z-10 mt-6 pt-5 border-t border-[#30363d]">
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-2">
                <span>Overall onboarding progress</span>
                <span className="text-zinc-300 font-bold">
                  {completedCount} / {totalTasks} milestones
                </span>
              </div>
              <div className="w-full h-2 bg-[#0d1117] border border-[#21262d] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── SVG Passport ──────────────────────────────────────────────── */}
        <div
          className={`transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                  OSS Credential
                </span>
                <h2 className="text-base font-bold text-zinc-100">Contribution Passport</h2>
              </div>
              <a
                href={`/api/badge/${login}.svg`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-700 text-[10px] font-mono text-zinc-400 hover:text-zinc-200 transition-all"
              >
                <ExternalLink className="w-3 h-3" /> Raw SVG
              </a>
            </div>
            <div className="flex justify-center p-4 bg-[#0d1117] rounded-xl border border-[#30363d]">
              <img
                src={`/api/badge/${login}.svg?t=${Date.now()}`}
                alt={`${login} OpenBridge Passport`}
                className="max-w-full h-auto"
                style={{ maxHeight: "120px" }}
              />
            </div>
            <p className="text-[10.5px] font-mono text-zinc-500 text-center leading-relaxed">
              Paste this badge in your GitHub README →{" "}
              <code className="text-zinc-300 bg-[#0d1117] px-1.5 py-0.5 rounded border border-zinc-800 text-[10px]">
                {`[![OpenBridge](${window.location.origin}/api/badge/${login}.svg)](${window.location.origin}/p/${login})`}
              </code>
            </p>
          </div>
        </div>

        {/* ── Two-column: Roadmap + Repos ───────────────────────────────── */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* Roadmap Column */}
          <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Progress
              </span>
            </div>
            <h2 className="text-base font-bold text-zinc-100 -mt-2">4-Week Roadmap</h2>

            {roadmap ? (
              <div className="space-y-3">
                {weeks.map((weekKey, wi) => {
                  const tasks = roadmap[weekKey] || [];
                  const done = tasks.filter(
                    (_, ti) => checkedRoadmapTasks[`${weekKey}-${ti}`],
                  ).length;
                  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
                  const isComplete = pct === 100;

                  return (
                    <div key={weekKey} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold border ${
                              isComplete
                                ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-400"
                                : "bg-zinc-900 border-zinc-800 text-zinc-500"
                            }`}
                          >
                            {isComplete ? "✓" : wi + 1}
                          </span>
                          <div>
                            <span
                              className={`block font-semibold ${isComplete ? "text-zinc-300" : "text-zinc-400"}`}
                            >
                              {WEEK_LABELS[wi]}
                            </span>
                            <span className="block text-[9px] text-zinc-600">
                              {WEEK_SUBTITLES[wi]}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold ${isComplete ? "text-emerald-400" : "text-zinc-500"}`}
                        >
                          {done}/{tasks.length}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-[#0d1117] rounded-full overflow-hidden ml-7">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${isComplete ? "bg-emerald-500" : "bg-blue-500/60"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {/* Tasks list */}
                      <div className="ml-7 space-y-1">
                        {tasks.map((task, ti) => {
                          const isChecked = !!checkedRoadmapTasks[`${weekKey}-${ti}`];
                          return (
                            <div key={ti} className="flex items-start gap-2 text-[11px]">
                              {isChecked ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-zinc-700 shrink-0 mt-0.5" />
                              )}
                              <span
                                className={
                                  isChecked
                                    ? "text-zinc-500 line-through"
                                    : "text-zinc-400 leading-snug"
                                }
                              >
                                {task}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-600 text-xs font-mono">
                No roadmap generated yet.
              </div>
            )}
          </div>

          {/* Recommended Repos Column */}
          <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <GitFork className="w-4 h-4 text-zinc-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Matched Repositories
              </span>
            </div>
            <h2 className="text-base font-bold text-zinc-100 -mt-2">Top Repo Picks</h2>

            {repos && repos.length > 0 ? (
              <div className="space-y-3">
                {repos.slice(0, 3).map((repo, ri) => (
                  <div
                    key={ri}
                    className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] hover:border-zinc-700 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-zinc-200 font-mono group-hover:text-white transition-colors truncate">
                          {repo.name}
                        </h3>
                        <a
                          href={`https://github.com/${repo.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-zinc-600 hover:text-blue-400 mt-0.5 transition-colors font-mono"
                        >
                          github.com/{repo.name} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-sm font-bold font-mono text-emerald-400">
                          {repo.match}
                        </span>
                        <span className="block text-[9px] text-zinc-600 uppercase font-mono">
                          match
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-500 leading-relaxed mb-2">
                      {repo.description}
                    </p>

                    {repo.reason && (
                      <div className="flex items-start gap-1.5 p-2 rounded-lg bg-blue-950/10 border border-blue-900/20 text-[10.5px] text-zinc-400">
                        <Sparkles className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                        <span>{repo.reason}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-mono font-bold border rounded ${
                          repo.difficulty === "Beginner"
                            ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/40"
                            : "bg-amber-950/20 text-amber-400 border-amber-900/40"
                        }`}
                      >
                        {repo.difficulty}
                      </span>
                      <span className="text-[9px] text-zinc-600 font-mono">
                        {repo.issues?.length || 0} suggested issues
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-600 text-xs font-mono">
                No recommendations yet.
              </div>
            )}
          </div>
        </div>

        {/* ── Call to Action ─────────────────────────────────────────────── */}
        <div
          className={`transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="rounded-2xl border border-[#30363d] bg-gradient-to-r from-[#161b22] to-[#0d1117] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Start your open-source journey</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Join <span className="text-zinc-300 font-semibold">@{login}</span> and thousands of
                contributors on OpenBridge.
              </p>
            </div>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shrink-0 shadow-lg shadow-blue-900/30"
            >
              <Zap className="w-4 h-4" /> Get Started Free
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-2">
          <p className="text-[10px] font-mono text-zinc-700">
            Built with{" "}
            <a href="/" className="text-zinc-600 hover:text-zinc-400 transition-colors font-bold">
              OpenBridge
            </a>{" "}
            · Open-source contribution mentor
          </p>
        </div>
      </main>
    </div>
  );
}
