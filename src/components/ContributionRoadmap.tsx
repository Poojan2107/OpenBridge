import React, { useState } from "react";
import { PersonalizedRoadmap } from "../types";
import { ChevronRight, BookOpen, Download } from "lucide-react";

interface ContributionRoadmapProps {
  roadmap: PersonalizedRoadmap;
  checkedTasks?: { [key: string]: boolean };
  onToggleTask?: (week: string, index: number) => void;
  login?: string;
}

const WEEK_LABELS = {
  week1: {
    title: "Week 01",
    subtitle: "Git & Local Setup",
    desc: "Cloning packages, testing, environments & baseline scripts verification.",
  },
  week2: {
    title: "Week 02",
    subtitle: "Documentation & Rules",
    desc: "Finding documentation discrepancies, onboarding briefs or writing missing tests.",
  },
  week3: {
    title: "Week 03",
    subtitle: "Targeted Bug Fixing",
    desc: "Tracing error flows, modifying file states, solving low-complexity helper issues.",
  },
  week4: {
    title: "Week 04",
    subtitle: "Feature & Engagement",
    desc: "Crafting structured Pull Requests, documenting impact & interacting with maintainers.",
  },
} as const;

export default function ContributionRoadmap({
  roadmap,
  checkedTasks: propsCheckedTasks,
  onToggleTask,
  login,
}: ContributionRoadmapProps) {
  const [activeWeek, setActiveWeek] = useState<keyof PersonalizedRoadmap>("week1");
  const [localCheckedTasks, setLocalCheckedTasks] = useState<{ [key: string]: boolean }>({});

  const checkedTasks = propsCheckedTasks || localCheckedTasks;

  const toggleTask = (week: string, index: number) => {
    if (onToggleTask) {
      onToggleTask(week, index);
    } else {
      const key = `${week}-${index}`;
      setLocalCheckedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleExportRoadmap = () => {
    const userLogin = login || "guest-committer";
    window.location.href = `/api/roadmap/export/${userLogin}`;
  };

  const getWeekProgress = (week: keyof PersonalizedRoadmap) => {
    const tasks = roadmap[week] || [];
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((_, i) => checkedTasks[`${week}-${i}`]).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const activeTasks = roadmap[activeWeek] || [];
  const progressPercent = getWeekProgress(activeWeek);

  return (
    <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Roadmap workflow
          </span>
          <h2 className="text-lg font-bold text-zinc-150 tracking-tight mt-1">
            4-Week Onboarding Pathway
          </h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            A sequence of phased milestone targets to secure contribution traction.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          {/* Export Roadmap Button */}
          <button
            onClick={handleExportRoadmap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900 text-xs font-mono text-zinc-300 transition-all cursor-pointer select-none"
            title="Export this 4-week roadmap to Markdown format"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" /> Export Roadmap
          </button>

          {/* Global Progress indicator */}
          <div className="bg-[#090a0f] px-3.5 py-2 border border-zinc-900 rounded select-none">
            <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold tracking-wider">
              Phase progress
            </span>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="w-24 h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-350">{progressPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar: Weeks Selector */}
        <div className="lg:col-span-4 space-y-1.5">
          {(Object.keys(WEEK_LABELS) as Array<keyof typeof WEEK_LABELS>).map((weekKey) => {
            const label = WEEK_LABELS[weekKey];
            const isActive = activeWeek === weekKey;
            const weekProgress = getWeekProgress(weekKey);
            const isCompleted = weekProgress === 100;

            return (
              <button
                key={weekKey}
                onClick={() => setActiveWeek(weekKey)}
                className={`w-full flex items-start gap-3 p-3.5 text-left rounded border transition-all duration-150 ${
                  isActive
                    ? "bg-[#090a0f] border-zinc-700 shadow-sm"
                    : "bg-transparent border-zinc-950 hover:border-zinc-900 hover:bg-[#090a0f]/40"
                }`}
              >
                <div
                  className={`p-1 w-6 h-6 flex items-center justify-center rounded text-[10px] shrink-0 font-mono font-bold transition-colors border ${
                    isActive
                      ? "bg-zinc-800 border-zinc-700 text-white"
                      : isCompleted
                        ? "bg-emerald-950/25 border-emerald-900/60 text-emerald-400"
                        : "bg-zinc-950 border-zinc-900 text-zinc-500"
                  }`}
                >
                  {isCompleted ? "✓" : label.title.slice(-2)}
                </div>

                <div className="min-w-0 flex-grow">
                  <span
                    className={`block text-xs font-semibold ${isActive ? "text-zinc-150" : "text-zinc-350"}`}
                  >
                    {label.subtitle}
                  </span>
                  <span className="block text-[11px] text-zinc-550 truncate mt-0.5 leading-none">
                    {label.desc}
                  </span>

                  {/* Tiny progress dot indicator */}
                  <div className="w-full bg-zinc-950 h-[1.5px] rounded-full mt-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${isCompleted ? "bg-emerald-500" : "bg-zinc-600"}`}
                      style={{ width: `${weekProgress}%` }}
                    ></div>
                  </div>
                </div>

                <ChevronRight
                  className={`w-3.5 h-3.5 text-zinc-650 transition-transform duration-150 self-center ${isActive ? "translate-x-0.5 text-zinc-300" : ""}`}
                />
              </button>
            );
          })}
        </div>

        {/* Content pane: active week's objectives */}
        <div className="lg:col-span-8 bg-[#090a0f]/40 border border-zinc-900 rounded-lg p-5 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-zinc-900 pb-3">
              <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase bg-[#090a0f] px-2 py-0.5 rounded border border-zinc-850 inline-block mb-1.5">
                Active Phase: {WEEK_LABELS[activeWeek].title}
              </span>
              <h3 className="text-sm font-bold text-zinc-150 tracking-tight mt-1">
                {WEEK_LABELS[activeWeek].subtitle}
              </h3>
              <p className="text-zinc-405 text-xs mt-1 leading-relaxed">
                {WEEK_LABELS[activeWeek].desc}
              </p>
            </div>

            <div className="space-y-2">
              <span className="block text-[9px] uppercase font-bold tracking-wider text-zinc-500 mb-2">
                Phase Targets
              </span>

              {activeTasks.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-xs text-zinc-600 italic">
                    No targets defined for this phase yet.
                  </span>
                </div>
              ) : (
                activeTasks.map((task, idx) => {
                  const isChecked = !!checkedTasks[`${activeWeek}-${idx}`];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleTask(activeWeek, idx)}
                      className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-all duration-150 select-none ${
                        isChecked
                          ? "bg-zinc-950/65 border-zinc-900 text-zinc-500"
                          : "bg-zinc-950/30 border-zinc-905 hover:border-zinc-855 text-zinc-300"
                      }`}
                    >
                      <div
                        className={`p-0.5 rounded border mt-0.5 transition-colors ${
                          isChecked
                            ? "border-zinc-500 bg-zinc-650 text-zinc-100"
                            : "border-zinc-805 text-transparent bg-transparent"
                        }`}
                      >
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                        </svg>
                      </div>
                      <div className="text-xs leading-relaxed">
                        <span
                          className={`block font-mono text-[9px] uppercase tracking-wider font-bold mb-0.5 text-zinc-500`}
                        >
                          Target 0{idx + 1}
                        </span>
                        <span className={`${isChecked ? "line-through text-zinc-500" : ""}`}>
                          {task}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-zinc-900/40 border border-zinc-900 rounded p-3 mt-6 select-none border-dashed">
            <BookOpen className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
            <div className="text-[10.5px] leading-relaxed text-zinc-400">
              <span className="font-bold text-zinc-300">Target Guideline: </span>
              {activeWeek === "week1" &&
                "Take your time with local setups. Over 40% of first-time open source contributions fail due to mismatched environment configurations."}
              {activeWeek === "week2" &&
                "Typo corrections or documentation patches are valid starting tasks. They provide context on codebase design and test runs."}
              {activeWeek === "week3" &&
                "Draft comprehensive checklists in your issue threads to trace your planned changes before writing lines of code."}
              {activeWeek === "week4" &&
                "Ensure pull requests are concise and accompanied by tests and visual diffs. This will help maintainers approve and merge cleanly."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
