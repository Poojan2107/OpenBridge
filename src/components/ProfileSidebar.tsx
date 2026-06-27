import {
  Github,
  User,
  Code,
  Shield,
  AlertCircle,
  Award,
  GitPullRequest,
  Sparkles,
  HelpCircle,
  Trophy,
  BarChart2,
} from "lucide-react";
import LevelBadge from "./LevelBadge";
import type { GitHubUser, UserProfile, TabType } from "../types";

interface ProfileSidebarProps {
  githubUser: GitHubUser | null;
  profile: UserProfile;
  checkedRoadmapTasks: Record<string, boolean>;
  reposCount: number;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onResetProfile: () => void;
}

const navItems: {
  tab: TabType;
  label: string;
  icon: typeof Code;
  activeBorder?: string;
  badge?: (props: ProfileSidebarProps) => React.ReactNode;
}[] = [
  { tab: "dashboard", label: "Code & Roadmap", icon: Code },
  {
    tab: "challenge",
    label: "Interactive PRs",
    icon: GitPullRequest,
    badge: () => (
      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#0d1117] border border-[#30363d] text-[#8b949e] rounded font-bold uppercase">
        Active
      </span>
    ),
  },
  {
    tab: "preflight",
    label: "Security & Pre-flights",
    icon: Shield,
    badge: () => <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />,
  },
  {
    tab: "translator",
    label: "AI Issue Mapper",
    icon: AlertCircle,
    badge: () => (
      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#0d1117] border border-[#30363d] text-[#8b949e] rounded font-bold">
        Gemini
      </span>
    ),
  },
  {
    tab: "programs",
    label: "Fellowships",
    icon: Award,
    badge: () => (
      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#0d1117] border border-[#30363d] text-[#8b949e] rounded font-bold">
        6
      </span>
    ),
  },
  {
    tab: "codereview",
    label: "Code Review",
    icon: Sparkles,
    activeBorder: "border-violet-500",
    badge: () => (
      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-violet-950/40 border border-violet-900/40 text-violet-400 rounded font-bold">
        AI
      </span>
    ),
  },
  {
    tab: "interview",
    label: "Interview Prep",
    icon: HelpCircle,
    activeBorder: "border-cyan-500",
    badge: () => (
      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-cyan-950/40 border border-cyan-900/40 text-cyan-400 rounded font-bold">
        AI
      </span>
    ),
  },
  {
    tab: "leaderboard",
    label: "Leaderboard",
    icon: Trophy,
    activeBorder: "border-amber-500",
    badge: () => (
      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-950/40 border border-amber-900/40 text-amber-400 rounded font-bold">
        XP
      </span>
    ),
  },
  {
    tab: "analytics",
    label: "Analytics",
    icon: BarChart2,
    activeBorder: "border-blue-500",
    badge: (p) => (
      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-950/40 border border-blue-900/40 text-blue-400 rounded font-bold">
        {Object.values(p.checkedRoadmapTasks).filter(Boolean).length} XP
      </span>
    ),
  },
];

export default function ProfileSidebar(props: ProfileSidebarProps) {
  const {
    githubUser,
    profile,
    checkedRoadmapTasks,
    reposCount,
    activeTab,
    onTabChange,
    onResetProfile,
  } = props;

  return (
    <div className="lg:col-span-3 space-y-5">
      {/* Profile Card Summary */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-3">
          {githubUser ? (
            <img
              src={githubUser.avatar_url}
              alt={githubUser.login}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-full border border-[#30363d] select-none shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#238636] to-emerald-500 flex items-center justify-center text-sm text-white font-bold border border-[#30363d] select-none shrink-0 font-mono">
              GC
            </div>
          )}
          <div className="min-w-0">
            <span className="block text-xs font-mono font-bold text-[#8b949e] uppercase">
              {githubUser?.simulated
                ? "Simulated Profile"
                : githubUser
                  ? "Verified Account"
                  : "GitHub Guest"}
            </span>
            <span className="block text-sm font-bold text-[#f0f6fc] truncate leading-tight">
              {githubUser ? githubUser.name || githubUser.login : "guest-committer"}
            </span>
            <span
              className="block text-[10px] text-[#8b949e] mt-1 hover:text-[#2f81f7] cursor-pointer font-mono"
              title="Commit sign-off ID info"
            >
              id:{" "}
              {githubUser ? `GH_${githubUser.login.substring(0, 8).toUpperCase()}` : "OB_071557Z"}
            </span>
          </div>
        </div>

        {githubUser && (
          <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-2.5 space-y-1.5 text-[11px] font-mono text-[#8b949e]">
            <div className="flex justify-between">
              <span>Public Repos:</span>
              <span className="text-[#f0f6fc] font-semibold">{githubUser.public_repos}</span>
            </div>
            <div className="flex justify-between">
              <span>Followers:</span>
              <span className="text-[#f0f6fc] font-semibold">{githubUser.followers}</span>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-[#30363d] space-y-2 text-xs">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-[#8b949e]">Target Domain:</span>
            <span className="text-[#f0f6fc] font-semibold">{profile.interest}</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-[#8b949e]">Difficulty Level:</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-[#21262d] border border-[#30363d] rounded-md text-[#f0f6fc] font-semibold">
              {profile.level}
            </span>
          </div>

          <div className="space-y-1.5 pt-1.5">
            <span className="block text-[10px] uppercase font-mono tracking-wider text-[#8b949e] font-bold">
              Workspace Toolset
            </span>
            <div className="flex flex-wrap gap-1">
              {profile.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="bg-[#0d1117] text-[#8b949e] border border-[#30363d] px-1.5 py-0.5 rounded text-[10px] font-mono leading-none"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <LevelBadge
            completedTasks={Object.values(checkedRoadmapTasks).filter(Boolean).length}
            mergedPRs={0}
            variant="compact"
          />
        </div>

        <div className="pt-3 border-t border-[#30363d] space-y-2">
          <a
            href={`/p/${githubUser ? githubUser.login : "guest-committer"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center inline-flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold uppercase py-1.5 bg-[#21262d] hover:bg-[#2f81f7]/10 hover:text-[#2f81f7] hover:border-[#2f81f7]/30 border border-[#30363d] rounded-md transition-all cursor-pointer"
          >
            <User className="w-3 h-3" />
            View Public Profile
          </a>
          <button
            onClick={onResetProfile}
            className="w-full text-center text-[11px] font-mono font-bold uppercase py-1.5 bg-[#21262d] hover:bg-[#bd2c00]/10 hover:text-[#f85149] hover:border-[#f85149]/30 border border-[#30363d] rounded-md transition-all cursor-pointer"
          >
            Reset Profile Config
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden select-none">
        <div className="px-4 py-3 border-b border-[#30363d] text-[10px] font-mono uppercase tracking-wider text-[#8b949e] font-bold">
          MENTOR INTERACTION CHANNELS
        </div>

        <div className="divide-y divide-[#30363d]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            const borderColor = item.activeBorder || "border-[#f78166]";
            return (
              <button
                key={item.tab}
                onClick={() => onTabChange(item.tab)}
                className={`w-full text-left px-4 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                  isActive
                    ? `bg-[#21262d] text-[#f0f6fc] border-l-2 ${borderColor}`
                    : "text-[#8b949e] bg-[#161b22] hover:bg-[#21262d] hover:text-[#f0f6fc]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </span>
                {item.tab === "dashboard" ? (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#0d1117] border border-[#30363d] text-[#8b949e] rounded font-bold">
                    {reposCount}
                  </span>
                ) : item.badge ? (
                  item.badge(props)
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
