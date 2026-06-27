import {
  Github,
  ArrowUpRight,
  Bell,
  Search,
  Star,
  Eye,
  GitFork,
  Layers,
  AlertCircle,
} from "lucide-react";
import ProfileSidebar from "./ProfileSidebar";
import TabContent from "./TabContent";
import NotificationToast, { type ToastNotification } from "./NotificationToast";
import RoadmapExporter from "./RoadmapExporter";
import type {
  GitHubUser,
  UserProfile,
  RepositorySuggestion,
  PersonalizedRoadmap,
  IssueTranslation,
  TabType,
} from "../types";

interface AppLayoutProps {
  githubUser: GitHubUser | null;
  profile: UserProfile;
  repos: RepositorySuggestion[];
  roadmap: PersonalizedRoadmap | null;
  checkedRoadmapTasks: Record<string, boolean>;
  loading: boolean;
  apiError: string | null;
  activeTab: TabType;
  stars: number;
  starred: boolean;
  watches: number;
  watched: boolean;
  forks: number;
  forked: boolean;
  notifications: ToastNotification[];
  unreadCount: number;
  showExporter: boolean;
  activityRefresh: number;
  pullRequests: any[];
  onTabChange: (tab: TabType) => void;
  onSetUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  onExporterToggle: (show: boolean) => void;
  onSetStars: React.Dispatch<React.SetStateAction<number>>;
  onSetStarred: (v: boolean) => void;
  onSetWatches: React.Dispatch<React.SetStateAction<number>>;
  onSetWatched: (v: boolean) => void;
  onSetForks: React.Dispatch<React.SetStateAction<number>>;
  onSetForked: (v: boolean) => void;
  onToggleTask: (week: string, index: number) => void;
  onTranslateIssue: (text: string) => Promise<IssueTranslation | null>;
  onResetProfile: () => void;
  onDismissNotification: (id: string) => void;
  onConnectGithub: () => void;
  onDisconnectGithub: () => void;
  onSetApiError: (err: string | null) => void;
}

export default function AppLayout(props: AppLayoutProps) {
  const {
    githubUser,
    profile,
    repos,
    roadmap,
    checkedRoadmapTasks,
    loading,
    apiError,
    activeTab,
    stars,
    starred,
    watches,
    watched,
    forks,
    forked,
    notifications,
    unreadCount,
    showExporter,
    activityRefresh,
    pullRequests,
    onTabChange,
    onSetUnreadCount,
    onExporterToggle,
    onSetStars,
    onSetStarred,
    onSetWatches,
    onSetWatched,
    onSetForks,
    onSetForked,
    onToggleTask,
    onTranslateIssue,
    onResetProfile,
    onDismissNotification,
    onConnectGithub,
    onDisconnectGithub,
    onSetApiError,
  } = props;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] flex flex-col antialiased font-sans flex-grow">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#161b22] border-b border-[#30363d] h-14 flex items-center px-4 sm:px-6 select-none">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onResetProfile}
              className="flex items-center justify-center w-7 h-7 rounded-md bg-[#1f242c] border border-[#30363d] text-[#f0f6fc] hover:border-[#8b949e] cursor-pointer transition-colors"
              aria-label="Reset profile"
            >
              <Github className="w-4 h-4" />
            </button>

            <button
              className="flex items-center gap-1.5"
              onClick={onResetProfile}
              aria-label="Reset profile"
            >
              <span className="text-sm font-semibold text-[#f0f6fc] tracking-tight hover:text-[#2f81f7] cursor-pointer">
                OpenBridge
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-[#30363d]/50 text-[#8b949e] border border-[#30363d] rounded-md">
                Mentor AI
              </span>
            </button>

            <div className="hidden md:flex items-center gap-1 text-[11px] text-[#8b949e] font-mono pl-3 border-l border-[#30363d]">
              <span className="text-[#8b949e]">v2.6.5</span>
              <span className="text-[#30363d]">&bull;</span>
              <span className="text-[#238636] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#238636]"></span>
                production-ready
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center flex-grow max-w-sm mx-8">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly
                placeholder="Search or jump to... (Press / to explore)"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-8 pr-3 py-1 text-xs text-[#f0f6fc] placeholder-[#8b949e] cursor-not-allowed text-left select-none text-[11px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSetUnreadCount(0)}
              className="p-1.5 hover:bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] rounded-md border border-transparent hover:border-[#30363d] transition-all relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-[#2f81f7] text-white text-[9px] font-bold font-mono flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <a
              href={
                githubUser
                  ? githubUser.html_url
                  : "https://github.com/guest-committer/openbridge-onboarding-hub"
              }
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#8b949e] hover:text-[#f0f6fc] flex items-center gap-1.5 bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] px-2.5 py-1 rounded-md transition-all font-mono"
            >
              Repository <ArrowUpRight className="w-3 h-3 text-[#8b949e]" />
            </a>

            {githubUser ? (
              <div className="flex items-center gap-2 relative group">
                <img
                  src={githubUser.avatar_url}
                  alt={githubUser.login}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full border border-[#30363d] cursor-pointer hover:border-[#8b949e] transition-all"
                  title={`Logged in as ${githubUser.name || githubUser.login}`}
                />
                <span
                  className="hidden sm:inline text-xs font-mono text-[#8b949e] hover:text-[#f0f6fc] cursor-pointer font-semibold"
                  title="Disconnect profile"
                  onClick={onDisconnectGithub}
                >
                  {githubUser.login}
                </span>
                <span
                  className="text-[10px] text-[#f85149] hover:underline cursor-pointer hidden md:inline ml-1"
                  onClick={onDisconnectGithub}
                >
                  (Sign Out)
                </span>
              </div>
            ) : (
              <button
                onClick={onConnectGithub}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#238636] hover:bg-[#2ea44f] text-[#f0f6fc] border border-[#2ea44f] rounded-md text-xs font-semibold cursor-pointer transition-colors font-mono"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Connect GitHub</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Repo Sub-header */}
      <div className="bg-[#161b22] border-b border-[#30363d] py-3.5 px-4 sm:px-6 select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Layers className="w-4 h-4 text-[#8b949e]" />
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono">
              <span className="text-[#2f81f7] hover:underline cursor-pointer font-medium">
                {githubUser ? githubUser.login : "guest-committer"}
              </span>
              <span className="text-[#8b949e]">/</span>
              <span className="font-bold text-[#f0f6fc] hover:underline cursor-pointer">
                openbridge-onboarding-hub
              </span>
            </div>
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-[#21262d] border border-[#30363d] text-[#8b949e] font-mono font-medium">
              Public
            </span>
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-[#238636]/10 border border-[#238636]/30 text-[#3fb950] font-mono font-medium flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#238636] animate-pulse"></span>
              Active fork
            </span>
          </div>

          <div className="flex items-center gap-1.5 select-none shrink-0 self-start md:self-center">
            <button
              onClick={() => {
                onSetWatched(!watched);
                onSetWatches((w) => (watched ? w - 1 : w + 1));
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                watched
                  ? "bg-[#21262d] border-[#8b949e] text-[#f0f6fc]"
                  : "bg-[#21262d] border-[#30363d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]"
              }`}
            >
              <Eye className={`w-3.5 h-3.5 ${watched ? "text-[#D29922] fill-[#D29922]" : ""}`} />
              <span>Watch</span>
              <span className="bg-[#0d1117] px-1.5 py-0.2 rounded text-[10px] text-[#8b949e] border border-[#30363d]">
                {watches}
              </span>
            </button>

            <button
              onClick={() => {
                onSetForked(!forked);
                onSetForks((f) => (forked ? f - 1 : f + 1));
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                forked
                  ? "bg-[#21262d] border-[#8b949e] text-[#f0f6fc]"
                  : "bg-[#21262d] border-[#30363d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]"
              }`}
            >
              <GitFork className={`w-3.5 h-3.5 ${forked ? "text-[#2f81f7]" : ""}`} />
              <span>Fork</span>
              <span className="bg-[#0d1117] px-1.5 py-0.2 rounded text-[10px] text-[#8b949e] border border-[#30363d]">
                {forks}
              </span>
            </button>

            <button
              onClick={() => {
                onSetStarred(!starred);
                onSetStars((s) => (starred ? s - 1 : s + 1));
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                starred
                  ? "bg-[#21262d] border-[#8b949e] text-[#f0f6fc]"
                  : "bg-[#21262d] border-[#30363d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${starred ? "text-[#D29922] fill-[#D29922]" : ""}`} />
              <span>{starred ? "Starred" : "Star"}</span>
              <span className="bg-[#0d1117] px-1.5 py-0.2 rounded text-[10px] text-[#8b949e] border border-[#30363d]">
                {stars}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {apiError && (
          <div className="mb-6 bg-rose-950/20 border border-rose-900/40 rounded-lg p-4 text-rose-350 text-xs font-mono flex items-start gap-2.5 relative animate-fade-in shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1 pr-8">
              <span className="font-bold text-white block uppercase text-[10px] tracking-wider">
                API HANDSHAKE TELEMETRY WARNING
              </span>
              <p className="leading-relaxed">{apiError}</p>
            </div>
            <button
              onClick={() => onSetApiError(null)}
              className="absolute top-3 right-3 text-rose-400 hover:text-white font-bold cursor-pointer transition-colors p-1"
              title="Dismiss warning"
            >
              &#x2715;
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <ProfileSidebar
            githubUser={githubUser}
            profile={profile}
            checkedRoadmapTasks={checkedRoadmapTasks}
            reposCount={repos.length}
            activeTab={activeTab}
            onTabChange={onTabChange}
            onResetProfile={onResetProfile}
          />

          <TabContent
            activeTab={activeTab}
            loading={loading}
            repos={repos}
            profile={profile}
            roadmap={roadmap}
            checkedRoadmapTasks={checkedRoadmapTasks}
            githubUser={githubUser}
            pullRequests={pullRequests}
            activityRefresh={activityRefresh}
            onToggleTask={onToggleTask}
            onTranslateIssue={onTranslateIssue}
            onResetProfile={onResetProfile}
            onExporterToggle={onExporterToggle}
          />
        </div>

        <footer className="border-t border-[#30363d] pt-6 mt-12 text-[#8b949e] text-[11px] text-center space-y-2 font-mono select-none">
          <p>
            &copy; 2026 OpenBridge. Designed as a native developer tool inspired by open-source
            telemetry workflows.
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px]">
            <a
              href="https://github.com/opensource/code-of-conduct"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#2f81f7] transition-colors"
            >
              Contributor Covenant
            </a>
            <span>&bull;</span>
            <a
              href="https://opensource.org"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#2f81f7] font-medium transition-colors font-semibold"
            >
              OSI Framework Parity
            </a>
          </div>
        </footer>
      </main>

      <NotificationToast notifications={notifications} onDismiss={onDismissNotification} />

      {showExporter && roadmap && (
        <RoadmapExporter
          roadmap={roadmap}
          checkedTasks={checkedRoadmapTasks}
          githubUser={githubUser}
          profile={profile}
          onClose={() => onExporterToggle(false)}
        />
      )}
    </div>
  );
}
