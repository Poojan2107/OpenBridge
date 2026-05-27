import React, { useState } from "react";
import { RepositorySuggestion } from "../types";
import { 
  FolderGit2, 
  AlertCircle, 
  Sparkles, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  GitPullRequest, 
  ExternalLink, 
  RefreshCw,
  Terminal,
  Code,
  ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react";

interface RepoRecommenderProps {
  repos: RepositorySuggestion[];
  userProfile: any;
  onReset: () => void;
}

export default function RepoRecommender({ repos, userProfile, onReset }: RepoRecommenderProps) {
  const [copiedIndex, setCopiedIndex] = useState<{ [key: string]: boolean }>({});
  const [expandedRepo, setExpandedRepo] = useState<string | null>(repos[0]?.name || null);
  const [activeIssueTerminal, setActiveIssueTerminal] = useState<{ [repoName: string]: { text: string; idx: number } | null }>({});
  const [searchQuery, setSearchQuery] = useState("");
  
  // Real dynamic list pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  // Reset page number back to first page when search filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filter repositories dynamically based on search terms
  const filteredRepos = repos.filter(repo => {
    const query = searchQuery.toLowerCase();
    return (
      repo.name.toLowerCase().includes(query) ||
      repo.description.toLowerCase().includes(query) ||
      repo.issues.some(issue => issue.toLowerCase().includes(query))
    );
  });

  const indexOfLastRepo = currentPage * itemsPerPage;
  const indexOfFirstRepo = indexOfLastRepo - itemsPerPage;
  const currentRepos = filteredRepos.slice(indexOfFirstRepo, indexOfLastRepo);
  const totalPages = Math.ceil(filteredRepos.length / itemsPerPage);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedIndex((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const generateGitCommands = (repoName: string, issueText: string, idx: number) => {
    const safeBranch = `onboard/issue-0${idx + 1}-${issueText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 18)}`;
    const repoShortName = repoName.split("/")[1] || "project";
    
    return [
      `# 1. Fork repository on GitHub, then clone your local copy`,
      `git clone https://github.com/your-username/${repoShortName}.git`,
      `cd ${repoShortName}`,
      ``,
      `# 2. Add baseline upstream coordination endpoint & configure workspace sync`,
      `git remote add upstream https://github.com/${repoName}.git`,
      `git checkout -b ${safeBranch}`,
      ``,
      `# 3. Securely compile local modules & packages`,
      `npm install`,
      ``,
      `# 4. Trigger validation scripts or baseline test compilations`,
      `npm run test`,
      ``,
      `# 5. Perfect! Perform your code changes, commit, & file descriptive PR`,
      `git add .`,
      `git commit -m "onboard: 0${idx + 1} - ${issueText.slice(0, 36)}..."`,
      `git push origin ${safeBranch}`
    ].join("\n");
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "beginner":
        return "bg-emerald-950/20 text-emerald-405 border-emerald-900/50";
      case "intermediate":
        return "bg-amber-950/20 text-amber-400 border-amber-900/50";
      default:
        return "bg-zinc-900 text-zinc-300 border-zinc-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Repository Match Indices
          </span>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight mt-1">
            Recommended Repositories
          </h2>
          <p className="text-zinc-400 text-xs mt-0.5">
            Matching repositories indexed for interests: <span className="text-zinc-300 font-semibold">{userProfile?.interest}</span> ({userProfile?.level})
          </p>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900 text-xs font-mono text-zinc-400 transition-all cursor-pointer select-none self-start sm:self-center shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-profile
        </button>
      </div>

      {/* Search Filter Input Bar */}
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter recommendations by keyword, topic, or issue..."
          className="w-full bg-[#090a0f] border border-zinc-900 hover:border-zinc-800 rounded-lg pl-9 pr-8 py-2 text-xs text-zinc-200 placeholder-zinc-750 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
            title="Clear filter"
          >
            ✕
          </button>
        )}
      </div>

      {filteredRepos.length === 0 && (
        <div className="text-center py-10 border border-zinc-900 border-dashed rounded-xl bg-zinc-950/20 font-mono text-xs text-zinc-500">
          No recommended repositories match "{searchQuery}"
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {currentRepos.map((repo, index) => {
          const idx = indexOfFirstRepo + index;
          const isExpanded = expandedRepo === repo.name;
          return (
            <div
              key={repo.name}
              className={`flex flex-col bg-zinc-950/40 border rounded-xl p-5 md:p-6 transition-all duration-150 relative group overflow-hidden ${
                isExpanded
                  ? "border-zinc-700 bg-zinc-950"
                  : "border-zinc-900 hover:border-zinc-800 shadow-sm"
              }`}
            >
              {/* Repo header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-900 border border-zinc-800 rounded">
                    <FolderGit2 className="w-4.5 h-4.5 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-150 tracking-tight break-all transition-colors group-hover:text-zinc-100">
                      {repo.name}
                    </h3>
                    <a
                      href={`https://github.com/${repo.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 mt-0.5 transition-colors font-mono"
                    >
                      github.com/{repo.name} <ExternalLink className="w-2.5 h-2.5 text-zinc-650" />
                    </a>
                  </div>
                </div>

                {/* Highly structured match score */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-zinc-300">
                    {repo.match}
                  </div>
                  <div className="text-[9px] text-zinc-500 uppercase font-mono">match</div>
                </div>
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className={`px-2 py-0.5 text-[10px] font-mono border rounded ${getDifficultyColor(repo.difficulty)}`}>
                  {repo.difficulty}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono border border-zinc-900 bg-zinc-950 text-zinc-505 rounded">
                  {userProfile?.skills[0] || "Programming"}
                </span>
              </div>

              {/* Repo description */}
              <p className="text-zinc-400 text-xs leading-relaxed flex-grow mb-5">
                {repo.description}
              </p>

              {/* Recommended Issues block */}
              <div className="border-t border-zinc-900 pt-4 mt-auto">
                <button
                  type="button"
                  onClick={() => setExpandedRepo(isExpanded ? null : repo.name)}
                  className="w-full flex items-center justify-between text-xs font-mono text-zinc-350 hover:text-zinc-200 transition-colors py-1 focus:outline-none"
                >
                  <span className="inline-flex items-center gap-1.5">
                    Suggested Issues ({repo.issues.length})
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div className="space-y-2 mt-3 animate-fade-in text-xs">
                    {repo.issues.map((issueStr, idx) => {
                      const id = `${repo.name}-${idx}`;
                      const isTerminalActive = activeIssueTerminal[repo.name]?.idx === idx;
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col gap-2 p-2.5 bg-[#090a0f] border rounded text-[11px] transition-all leading-relaxed ${
                            isTerminalActive ? 'border-orange-500/40 bg-orange-950/5' : 'border-zinc-900'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 w-full">
                            <div className="text-zinc-405 font-mono flex gap-1.5 min-w-0">
                              <span className="text-zinc-500 font-bold shrink-0">0{idx+1}</span>
                              <span className="truncate">{issueStr}</span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const activeVal = activeIssueTerminal[repo.name];
                                  if (activeVal && activeVal.idx === idx) {
                                    setActiveIssueTerminal(prev => ({ ...prev, [repo.name]: null }));
                                  } else {
                                    setActiveIssueTerminal(prev => ({ ...prev, [repo.name]: { text: issueStr, idx } }));
                                  }
                                }}
                                className={`p-1 rounded transition-colors ${
                                  isTerminalActive
                                    ? "text-orange-400 bg-orange-950/30"
                                    : "text-zinc-500 hover:text-zinc-355 hover:bg-zinc-900"
                                }`}
                                title="Generate Git Setup Workbench"
                              >
                                <Terminal className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(issueStr, id)}
                                className="text-zinc-600 hover:text-zinc-300 p-1 hover:bg-zinc-900 rounded transition-colors"
                                title="Copy issue query to search on Github"
                              >
                                {copiedIndex[id] ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Terminal workbench per-issue */}
                          {isTerminalActive && (
                            <div className="mt-2.5 border border-zinc-900 rounded-lg overflow-hidden bg-black/80">
                              {/* Terminal header */}
                              <div className="flex items-center justify-between px-3 py-1.5 bg-[#090a0f] border-b border-zinc-90 w-full select-none">
                                <span className="flex items-center gap-1 text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff7900]"></span>
                                  <span>git-workbench://{repo.name.split("/")[1]}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const commands = generateGitCommands(repo.name, issueStr, idx);
                                    copyToClipboard(commands, `term-${repo.name}`);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 hover:text-zinc-100 text-[9.5px] font-mono text-zinc-405 transition-all cursor-pointer"
                                >
                                  {copiedIndex[`term-${repo.name}`] ? (
                                    <>
                                      <Check className="w-2.5 h-2.5 text-emerald-400" /> Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-2.5 h-2.5" /> Copy Script
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="p-3 font-mono text-[10.5px] leading-relaxed text-zinc-300 overflow-x-auto max-h-[160px] select-text">
                                {generateGitCommands(repo.name, issueStr, idx)}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div className="text-center pt-2">
                      <a
                        href={`https://github.com/${repo.name}/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 hover:text-zinc-250 bg-zinc-900 hover:bg-zinc-850 px-3 py-1.5 rounded transition-colors border border-zinc-800"
                      >
                        <GitPullRequest className="w-3.5 h-3.5" /> Navigate Issue Board
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* GitHub styled Pagination Container */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-6 select-none font-mono text-xs" id="repos-pagination-block">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-zinc-850 bg-zinc-950 text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:hover:text-zinc-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
            id="repos-prev-btn"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          
          {Array.from({ length: totalPages }).map((_, pIdx) => {
            const pageNum = pIdx + 1;
            const isSelected = currentPage === pageNum;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-md border transition-all cursor-pointer font-bold ${
                  isSelected
                    ? "bg-[#2f81f7] border-[#2f81f7] text-[#ffffff]"
                    : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-[#30363D]"
                }`}
                id={`repos-page-${pageNum}-btn`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-zinc-850 bg-zinc-950 text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:hover:text-zinc-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
            id="repos-next-btn"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
