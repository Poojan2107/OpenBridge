import React, { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Target,
  HelpCircle,
  Lightbulb,
  GraduationCap,
  Zap,
  Trophy,
  Brain,
} from "lucide-react";
import { UserProfile } from "../types";

interface InterviewQuestion {
  question: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  topic: string;
  hint: string;
  whatInterviewersLookFor: string;
}

interface MockInterviewProps {
  profile: UserProfile | null;
}

const DIFF_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  beginner: {
    label: "Beginner",
    icon: <Zap className="w-3 h-3" />,
    color: "text-emerald-400",
    bg: "bg-emerald-950/20",
    border: "border-emerald-900/40",
  },
  intermediate: {
    label: "Intermediate",
    icon: <Target className="w-3 h-3" />,
    color: "text-amber-400",
    bg: "bg-amber-950/20",
    border: "border-amber-900/40",
  },
  advanced: {
    label: "Advanced",
    icon: <Trophy className="w-3 h-3" />,
    color: "text-rose-400",
    bg: "bg-rose-950/20",
    border: "border-rose-900/40",
  },
};

export default function MockInterview({ profile }: MockInterviewProps) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setExpandedIdx(null);
    setRevealedHints(new Set());
    setRevealedAnswers(new Set());

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: profile?.skills ?? [],
          level: profile?.level ?? "Beginner",
          interest: profile?.interest ?? "Frontend",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setQuestions(data.questions || []);
      setExpandedIdx(0); // auto-open first question
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const toggleHint = (idx: number) => {
    setRevealedHints((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
            <Brain className="w-3.5 h-3.5" />
            AI Interview Prep · Gemini
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Mock Interview Generator
          </h2>
          <p className="text-zinc-500 text-sm mt-1 leading-relaxed max-w-xl">
            Get 5 realistic interview questions tailored to your stack. Practice before the real
            thing.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-zinc-800 disabled:to-zinc-900 disabled:text-zinc-600 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-900/20 disabled:shadow-none shrink-0"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Generating…
            </>
          ) : questions.length > 0 ? (
            <>
              <RefreshCw className="w-4 h-4" /> New Questions
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Generate Questions
            </>
          )}
        </button>
      </div>

      {/* Profile skills context */}
      {profile && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600">
            Tailored for:
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-[#30363d] bg-[#0d1117] text-zinc-400">
            {profile.interest}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-[#30363d] bg-[#0d1117] text-zinc-400">
            {profile.level}
          </span>
          {profile.skills.map((s, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded text-[10px] font-mono border border-[#30363d] bg-[#0d1117] text-zinc-500"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg border border-red-900/40 bg-red-950/10 text-xs text-red-400 font-mono">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-12 flex flex-col items-center justify-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-cyan-900/40 border-t-cyan-500 animate-spin" />
            <GraduationCap className="absolute inset-0 m-auto w-6 h-6 text-cyan-400" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-zinc-300 text-sm font-semibold">Preparing your interview…</p>
            <p className="text-zinc-600 text-xs font-mono">
              Analyzing {profile?.skills?.join(", ") || "your skills"} for targeted questions
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && questions.length === 0 && !error && (
        <div className="rounded-xl border border-dashed border-[#30363d] bg-[#0d1117] p-12 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-zinc-700" />
          </div>
          <div>
            <p className="text-zinc-400 font-semibold text-sm">Ready for your mock interview?</p>
            <p className="text-zinc-600 text-xs mt-1 max-w-sm leading-relaxed">
              Click "Generate Questions" to get 5 personalized technical questions based on your
              profile. Practice answering them before your real interview.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {["Hints available", "Difficulty levels", "Interviewer insights"].map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full border border-[#30363d] text-[9px] font-mono text-zinc-600"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="space-y-3">
          {questions.map((q, idx) => {
            const isExpanded = expandedIdx === idx;
            const diff = DIFF_CONFIG[q.difficulty] ?? DIFF_CONFIG.beginner;
            const hintRevealed = revealedHints.has(idx);
            const answerRevealed = revealedAnswers.has(idx);

            return (
              <div
                key={idx}
                className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                  isExpanded
                    ? "border-cyan-900/40 bg-[#0d1117] shadow-lg shadow-cyan-950/10"
                    : "border-[#30363d] bg-[#161b22] hover:border-zinc-700"
                }`}
              >
                {/* Question header */}
                <button
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  className="w-full flex items-start gap-3 p-4 text-left cursor-pointer group"
                >
                  {/* Number */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 border ${
                      isExpanded
                        ? "bg-cyan-950/30 border-cyan-900/50 text-cyan-400"
                        : "bg-[#0d1117] border-[#30363d] text-zinc-500 group-hover:text-zinc-300"
                    } transition-all`}
                  >
                    {idx + 1}
                  </div>

                  <div className="flex-grow min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${diff.bg} ${diff.border} ${diff.color}`}
                      >
                        {diff.icon} {diff.label}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-[#30363d] bg-[#0d1117] text-zinc-500">
                        {q.topic}
                      </span>
                    </div>
                    <p
                      className={`text-sm leading-snug transition-colors ${isExpanded ? "text-white font-semibold" : "text-zinc-300"}`}
                    >
                      {q.question}
                    </p>
                  </div>

                  <div className="shrink-0 mt-1">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-[#21262d] pt-3 ml-10 animate-fade-in">
                    {/* Hint toggle */}
                    <button
                      onClick={() => toggleHint(idx)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#30363d] hover:border-zinc-700 bg-[#161b22] text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
                    >
                      {hintRevealed ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                      {hintRevealed ? "Hide Hint" : "Show Hint"}
                    </button>

                    {hintRevealed && (
                      <div className="flex items-start gap-2 p-3 rounded-lg border border-cyan-900/30 bg-cyan-950/10">
                        <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-cyan-300/80 leading-relaxed">{q.hint}</span>
                      </div>
                    )}

                    {/* Interviewer insights toggle */}
                    <button
                      onClick={() => toggleAnswer(idx)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#30363d] hover:border-zinc-700 bg-[#161b22] text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
                    >
                      {answerRevealed ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <HelpCircle className="w-3.5 h-3.5" />
                      )}
                      {answerRevealed ? "Hide Insights" : "What Interviewers Look For"}
                    </button>

                    {answerRevealed && (
                      <div className="flex items-start gap-2 p-3 rounded-lg border border-violet-900/30 bg-violet-950/10">
                        <Target className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-violet-300/80 leading-relaxed">
                          {q.whatInterviewersLookFor}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Footer summary */}
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 pt-2">
            <span>
              {questions.filter((q) => q.difficulty === "beginner").length} beginner ·{" "}
              {questions.filter((q) => q.difficulty === "intermediate").length} intermediate ·{" "}
              {questions.filter((q) => q.difficulty === "advanced").length} advanced
            </span>
            <span className="text-zinc-700">Powered by Gemini</span>
          </div>
        </div>
      )}
    </div>
  );
}
