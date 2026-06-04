import React, { useState, useEffect, useRef } from "react";
import { calculateXP, getLevelInfo, LEVELS, MAX_XP, LS_XP_KEY, LevelInfo } from "../lib/levelSystem";

interface LevelBadgeProps {
  completedTasks: number;
  mergedPRs: number;
  /** "full" = main ChallengeHub card | "compact" = sidebar chip | "profile" = public profile row */
  variant?: "full" | "compact" | "profile";
}

// ── Level-up Toast ──────────────────────────────────────────────────────────
function LevelUpToast({ info, onDone }: { info: LevelInfo; onDone: () => void }) {
  const [phase, setPhase] = useState<"enter" | "stay" | "exit">("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("stay"), 50);
    const t2 = setTimeout(() => setPhase("exit"), 3200);
    const t3 = setTimeout(onDone, 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className="fixed top-4 left-1/2 z-[9999] pointer-events-none select-none"
      style={{
        transform: `translateX(-50%) translateY(${phase === "stay" ? "0px" : phase === "enter" ? "-60px" : "-60px"})`,
        opacity: phase === "stay" ? 1 : 0,
        transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease",
      }}
    >
      <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl ${info.bgColor} ${info.borderColor}`}
        style={{ boxShadow: `0 0 40px 0 rgba(0,0,0,0.5), 0 0 20px 0 rgba(0,0,0,0.3)` }}
      >
        {/* Particles ring */}
        <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
          {[0,60,120,180,240,300].map((deg) => (
            <span
              key={deg}
              className={`absolute w-1.5 h-1.5 rounded-full ${info.gradientFrom.replace("from-","bg-")} animate-ping`}
              style={{
                transform: `rotate(${deg}deg) translateX(16px)`,
                animationDelay: `${deg / 300 * 0.4}s`,
                animationDuration: "1s",
              }}
            />
          ))}
          <span className="text-xl relative z-10">{info.emoji}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">Level Up!</span>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${info.bgColor} ${info.borderColor} border ${info.textColor}`}>
              {info.xp} XP
            </span>
          </div>
          <p className={`text-sm font-bold ${info.textColor} mt-0.5`}>
            You're now a <span className="font-black">{info.name}</span> {info.emoji}
          </p>
          <p className="text-[10.5px] text-zinc-500 mt-0.5 max-w-[220px] leading-snug">{info.tagline}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function LevelBadge({ completedTasks, mergedPRs, variant = "full" }: LevelBadgeProps) {
  const xp = calculateXP(completedTasks, mergedPRs);
  const info = getLevelInfo(xp);
  const [showToast, setShowToast] = useState(false);
  const prevXpRef = useRef<number | null>(null);
  const isFirstRender = useRef(true);

  // Detect level-up by comparing to stored XP
  useEffect(() => {
    const stored = parseInt(localStorage.getItem(LS_XP_KEY) ?? "-1", 10);

    if (isFirstRender.current) {
      isFirstRender.current = false;
      // First render: just record current xp, never toast
      if (stored === -1) {
        localStorage.setItem(LS_XP_KEY, String(xp));
      }
      prevXpRef.current = stored === -1 ? xp : stored;
      return;
    }

    const prevXp = prevXpRef.current ?? stored;
    const prevLevel = getLevelInfo(prevXp);
    const currLevel = getLevelInfo(xp);

    if (currLevel.name !== prevLevel.name && xp > prevXp) {
      setShowToast(true);
    }

    prevXpRef.current = xp;
    localStorage.setItem(LS_XP_KEY, String(xp));
  }, [xp]);

  // ── Compact chip (sidebar) ─────────────────────────────────────────────
  if (variant === "compact") {
    return (
      <>
        {showToast && <LevelUpToast info={info} onDone={() => setShowToast(false)} />}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold ${info.bgColor} ${info.borderColor} ${info.textColor} select-none`}>
          <span>{info.emoji}</span>
          <span>{info.name}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-500">{xp} XP</span>
        </div>
      </>
    );
  }

  // ── Profile row (public profile page) ─────────────────────────────────
  if (variant === "profile") {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${info.bgColor} ${info.borderColor}`}>
        <span className="text-base">{info.emoji}</span>
        <span className={`text-xs font-bold font-mono ${info.textColor}`}>{info.name}</span>
        <span className="text-zinc-600 text-xs">·</span>
        <span className="text-zinc-500 text-xs font-mono">{xp} XP</span>
      </div>
    );
  }

  // ── Full card (ChallengeHub) ────────────────────────────────────────────
  const currentIdx = LEVELS.findIndex((l) => l.name === info.name);

  return (
    <>
      {showToast && <LevelUpToast info={info} onDone={() => setShowToast(false)} />}

      <div className={`rounded-xl border p-5 relative overflow-hidden transition-all duration-300 ${info.bgColor} ${info.borderColor}`}
        style={{ boxShadow: `0 0 30px -8px var(--tw-shadow-color)` }}
      >
        {/* Decorative glow blob */}
        <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full blur-[50px] opacity-20 pointer-events-none bg-gradient-to-br ${info.gradientFrom} ${info.gradientTo}`} />

        {/* Header row */}
        <div className="relative z-10 flex items-start justify-between gap-4 mb-5">
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Contributor Rank</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{info.emoji}</span>
              <div>
                <h3 className={`text-lg font-black tracking-tight leading-none ${info.textColor}`}>{info.name}</h3>
                <p className="text-[10.5px] text-zinc-500 mt-0.5 leading-snug max-w-[180px]">{info.tagline}</p>
              </div>
            </div>
          </div>

          {/* XP counter */}
          <div className={`text-right shrink-0 p-2.5 rounded-lg border ${info.borderColor} ${info.bgColor}`}>
            <span className={`block text-xl font-black font-mono ${info.textColor}`}>{xp}</span>
            <span className="block text-[8px] font-mono uppercase text-zinc-500 tracking-wider">/ {MAX_XP} XP</span>
          </div>
        </div>

        {/* XP Progress bar */}
        <div className="relative z-10 mb-5">
          <div className="flex justify-between text-[9px] font-mono text-zinc-600 mb-1.5">
            <span>{info.name}</span>
            {info.nextLevel ? (
              <span>{info.nextLevel.name} in <span className={info.textColor + " font-bold"}>{info.xpToNext} XP</span></span>
            ) : (
              <span className={`${info.textColor} font-bold`}>MAX LEVEL 🎉</span>
            )}
          </div>
          <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${info.gradientFrom} ${info.gradientTo} transition-all duration-700`}
              style={{ width: `${info.progressToNext}%` }}
            >
              {/* Shimmer effect */}
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
          </div>
          <div className="flex justify-between text-[8px] font-mono text-zinc-700 mt-1">
            <span>{info.minXp} XP</span>
            <span>{info.progressToNext}%</span>
            <span>{info.nextLevel?.minXp ?? MAX_XP} XP</span>
          </div>
        </div>

        {/* XP Breakdown */}
        <div className="relative z-10 grid grid-cols-2 gap-2 mb-5">
          <div className={`p-2.5 rounded-lg border ${info.borderColor} bg-black/20`}>
            <span className="block text-[8px] font-mono uppercase text-zinc-600 tracking-wider">Task XP</span>
            <span className={`block text-base font-black font-mono mt-0.5 ${info.textColor}`}>
              {Math.min(completedTasks, 12) * 5}
            </span>
            <span className="block text-[8px] text-zinc-600 font-mono">{completedTasks} tasks × 5</span>
          </div>
          <div className={`p-2.5 rounded-lg border ${info.borderColor} bg-black/20`}>
            <span className="block text-[8px] font-mono uppercase text-zinc-600 tracking-wider">PR XP</span>
            <span className={`block text-base font-black font-mono mt-0.5 ${info.textColor}`}>
              {Math.min(mergedPRs, 4) * 10}
            </span>
            <span className="block text-[8px] text-zinc-600 font-mono">{mergedPRs} PRs × 10</span>
          </div>
        </div>

        {/* Level ladder */}
        <div className="relative z-10">
          <span className="block text-[8px] font-mono uppercase tracking-wider text-zinc-600 mb-2">All Ranks</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {LEVELS.map((lvl, i) => {
              const isUnlocked = xp >= lvl.minXp;
              const isCurrent = lvl.name === info.name;
              return (
                <div
                  key={lvl.name}
                  className="flex items-center gap-1"
                  title={`${lvl.emoji} ${lvl.name} — ${lvl.minXp} XP`}
                >
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[9px] font-mono font-bold transition-all ${
                    isCurrent
                      ? `${lvl.bgColor} ${lvl.borderColor} ${lvl.textColor} ring-1 ring-current/30`
                      : isUnlocked
                        ? `${lvl.bgColor} ${lvl.borderColor} ${lvl.textColor} opacity-60`
                        : "bg-zinc-950 border-zinc-900 text-zinc-700"
                  }`}>
                    <span>{lvl.emoji}</span>
                    <span className="hidden sm:inline">{lvl.name}</span>
                  </div>
                  {i < LEVELS.length - 1 && (
                    <span className={`text-[8px] font-mono ${isUnlocked ? "text-zinc-600" : "text-zinc-800"}`}>›</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
