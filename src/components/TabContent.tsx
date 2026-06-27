import { Terminal, Download } from "lucide-react";
import DashboardAnalytics from "./DashboardAnalytics";
import Leaderboard from "./Leaderboard";
import RepoRecommender from "./RepoRecommender";
import ContributionRoadmap from "./ContributionRoadmap";
import GithubFileExplorer from "./GithubFileExplorer";
import StreakHeatmap from "./StreakHeatmap";
import ChallengeHub from "./ChallengeHub";
import PreflightConsole from "./PreflightConsole";
import IssueTranslator from "./IssueTranslator";
import OpportunityLayer from "./OpportunityLayer";
import CodeReview from "./CodeReview";
import MockInterview from "./MockInterview";
import RoadmapExporter from "./RoadmapExporter";
import type {
  GitHubUser,
  UserProfile,
  RepositorySuggestion,
  PersonalizedRoadmap,
  IssueTranslation,
  TabType,
} from "../types";

interface TabContentProps {
  activeTab: TabType;
  loading: boolean;
  repos: RepositorySuggestion[];
  profile: UserProfile;
  roadmap: PersonalizedRoadmap | null;
  checkedRoadmapTasks: Record<string, boolean>;
  githubUser: GitHubUser | null;
  pullRequests: any[];
  activityRefresh: number;
  onToggleTask: (week: string, index: number) => void;
  onTranslateIssue: (text: string) => Promise<IssueTranslation | null>;
  onResetProfile: () => void;
  onExporterToggle: (show: boolean) => void;
}

export default function TabContent(props: TabContentProps) {
  const {
    activeTab,
    loading,
    repos,
    profile,
    roadmap,
    checkedRoadmapTasks,
    githubUser,
    pullRequests,
    activityRefresh,
    onToggleTask,
    onTranslateIssue,
    onResetProfile,
    onExporterToggle,
  } = props;

  return (
    <div className="lg:col-span-9 space-y-6">
      {activeTab === "analytics" && (
        <div className="animate-fade-in">
          <DashboardAnalytics
            completedTasks={Object.values(checkedRoadmapTasks).filter(Boolean).length}
            totalTasks={roadmap ? Object.values(roadmap).flat().length : 0}
            checkedRoadmapTasks={checkedRoadmapTasks}
            roadmap={roadmap}
            pullRequests={pullRequests}
            profile={profile}
            githubUser={githubUser}
            activityRefreshKey={activityRefresh}
          />
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div className="animate-fade-in">
          <Leaderboard currentLogin={githubUser?.login} />
        </div>
      )}

      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#30363d]">
              <Terminal className="w-4 h-4 text-[#8b949e]" />
              <span className="text-xs font-mono font-bold text-[#f0f6fc]">
                ACTIVE WORKBENCH REPOSITORY TREE
              </span>
            </div>
            <GithubFileExplorer />
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <StreakHeatmap refreshKey={activityRefresh} />
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-[#30363d] rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                  <div className="h-32 bg-[#30363d]/50 rounded"></div>
                  <div className="h-32 bg-[#30363d]/50 rounded"></div>
                  <div className="h-32 bg-[#30363d]/50 rounded"></div>
                </div>
              </div>
            ) : (
              <RepoRecommender repos={repos} userProfile={profile} onReset={onResetProfile} />
            )}
          </div>

          {roadmap && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-[#30363d] rounded w-1/3"></div>
                  <div className="h-24 bg-[#30363d]/50 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span />
                    <button
                      onClick={() => onExporterToggle(true)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold px-3 py-1.5 rounded-lg border border-[#30363d] bg-[#21262d] hover:bg-[#30363d] hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export Roadmap
                    </button>
                  </div>
                  <ContributionRoadmap
                    roadmap={roadmap}
                    checkedTasks={checkedRoadmapTasks}
                    onToggleTask={onToggleTask}
                    login={githubUser ? githubUser.login : "guest-committer"}
                  />
                </>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "challenge" && (
        <div className="animate-fade-in bg-[#161b22] border border-[#30363d] rounded-lg p-5">
          {roadmap && (
            <ChallengeHub
              roadmap={roadmap}
              checkedTasks={checkedRoadmapTasks}
              onToggleTask={onToggleTask}
              profile={profile}
              githubUser={githubUser}
              initialPullRequests={pullRequests}
            />
          )}
        </div>
      )}

      {activeTab === "preflight" && (
        <div className="animate-fade-in bg-[#161b22] border border-[#30363d] rounded-lg p-5">
          <PreflightConsole />
        </div>
      )}

      {activeTab === "translator" && (
        <div className="animate-fade-in bg-[#161b22] border border-[#30363d] rounded-lg p-5 font-sans">
          <IssueTranslator onTranslate={onTranslateIssue} />
        </div>
      )}

      {activeTab === "programs" && (
        <div className="animate-fade-in bg-[#161b22] border border-[#30363d] rounded-lg p-5">
          <OpportunityLayer />
        </div>
      )}

      {activeTab === "codereview" && (
        <div className="animate-fade-in bg-[#161b22] border border-[#30363d] rounded-lg p-5">
          <CodeReview />
        </div>
      )}

      {activeTab === "interview" && (
        <div className="animate-fade-in bg-[#161b22] border border-[#30363d] rounded-lg p-5">
          <MockInterview profile={profile} />
        </div>
      )}
    </div>
  );
}
