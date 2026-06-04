// ────────────────────────────────────────────────────────────────────────────
// OpenBridge Level System
// XP Sources:
//   • Completed roadmap task  = 5 XP each  (max 12 tasks = 60 XP)
//   • Merged/registered PR    = 10 XP each (max 4 PRs   = 40 XP)
//   • Total max               = 100 XP
// ────────────────────────────────────────────────────────────────────────────

export interface LevelDef {
  name: string;
  emoji: string;
  minXp: number;
  maxXp: number;
  tagline: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  glowColor: string;
  gradientFrom: string;
  gradientTo: string;
}

export const LEVELS: LevelDef[] = [
  {
    name: "Lurker",
    emoji: "🌱",
    minXp: 0,
    maxXp: 9,
    tagline: "Just getting started. Every journey begins here.",
    textColor: "text-zinc-400",
    borderColor: "border-zinc-700/60",
    bgColor: "bg-zinc-900/30",
    glowColor: "shadow-zinc-900/40",
    gradientFrom: "from-zinc-600",
    gradientTo: "to-zinc-500",
  },
  {
    name: "Rookie",
    emoji: "⚡",
    minXp: 10,
    maxXp: 29,
    tagline: "First tasks ticked off. The momentum is real.",
    textColor: "text-blue-400",
    borderColor: "border-blue-800/50",
    bgColor: "bg-blue-950/20",
    glowColor: "shadow-blue-900/30",
    gradientFrom: "from-blue-600",
    gradientTo: "to-blue-400",
  },
  {
    name: "Contributor",
    emoji: "🔥",
    minXp: 30,
    maxXp: 54,
    tagline: "Active committer. PRs are landing. Keep going.",
    textColor: "text-orange-400",
    borderColor: "border-orange-800/50",
    bgColor: "bg-orange-950/20",
    glowColor: "shadow-orange-900/30",
    gradientFrom: "from-orange-600",
    gradientTo: "to-amber-400",
  },
  {
    name: "Core Member",
    emoji: "💎",
    minXp: 55,
    maxXp: 79,
    tagline: "Trusted contributor. Maintainers know your name.",
    textColor: "text-violet-400",
    borderColor: "border-violet-800/50",
    bgColor: "bg-violet-950/20",
    glowColor: "shadow-violet-900/30",
    gradientFrom: "from-violet-600",
    gradientTo: "to-purple-400",
  },
  {
    name: "OSS Legend",
    emoji: "🚀",
    minXp: 80,
    maxXp: 100,
    tagline: "Elite open-source contributor. Fully onboarded.",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-700/50",
    bgColor: "bg-yellow-950/20",
    glowColor: "shadow-yellow-900/30",
    gradientFrom: "from-yellow-500",
    gradientTo: "to-amber-300",
  },
];

export const MAX_XP = 100;

export function calculateXP(completedTasks: number, mergedPRs: number): number {
  const taskXP = Math.min(completedTasks, 12) * 5;
  const prXP = Math.min(mergedPRs, 4) * 10;
  return Math.min(taskXP + prXP, MAX_XP);
}

export interface LevelInfo extends LevelDef {
  xp: number;
  nextLevel: LevelDef | null;
  progressToNext: number; // 0-100 percent
  xpToNext: number;
}

export function getLevelInfo(xp: number): LevelInfo {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXp) current = level;
  }

  const currentIdx = LEVELS.findIndex((l) => l.name === current.name);
  const nextLevel = currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1] : null;

  const rangeSize = nextLevel ? nextLevel.minXp - current.minXp : 1;
  const earned = xp - current.minXp;
  const progressToNext = nextLevel ? Math.min(Math.round((earned / rangeSize) * 100), 100) : 100;
  const xpToNext = nextLevel ? nextLevel.minXp - xp : 0;

  return { ...current, xp, nextLevel, progressToNext, xpToNext };
}

export const LS_XP_KEY = "ob_last_known_xp";
