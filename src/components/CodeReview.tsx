import React, { useState, useRef } from "react";
import {
  Code,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  RefreshCw,
  Clipboard,
  Check,
  ChevronRight,
  Star,
  Zap,
  Shield,
  FileCode,
  MessageSquare,
  CornerDownRight
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────

interface ReviewIssue {
  severity: "error" | "warning" | "info";
  message: string;
  suggestion: string;
}

interface ReviewResult {
  overall: "excellent" | "good" | "needs_work" | "major_issues";
  score: number;
  summary: string;
  praise: string[];
  issues: ReviewIssue[];
  suggestions: string[];
}

const LANGUAGES = [
  "auto", "TypeScript", "JavaScript", "Python", "Go", "Rust",
  "Java", "C#", "C++", "Ruby", "PHP", "Swift", "Kotlin", "HTML/CSS", "Shell/Bash"
];

const EXAMPLE_SNIPPETS: { label: string; lang: string; code: string }[] = [
  {
    label: "React component",
    lang: "TypeScript",
    code: `import React, { useState } from 'react';

// TODO: add proper types
export default function Counter({ initialCount }) {
  const [count, setCount] = useState(initialCount);

  function handleClick() {
    console.log('clicked');
    setCount(count + 1);
  }

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
}`
  },
  {
    label: "Python function",
    lang: "Python",
    code: `def calculate_average(numbers):
    # FIXME: doesn't handle empty list
    total = 0
    for n in numbers:
        total = total + n
    avg = total / len(numbers)
    print("Average:", avg)
    return avg`
  },
  {
    label: "Express route",
    lang: "JavaScript",
    code: `app.get('/users/:id', (req, res) => {
  const id = req.params.id;
  // fetch user from db
  db.query('SELECT * FROM users WHERE id = ' + id, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error');
    } else {
      res.json(result[0]);
    }
  });
});`
  }
];

// ── Score Ring ────────────────────────────────────────────────────────────

function ScoreRing({ score, overall }: { score: number; overall: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  const colorMap: Record<string, { stroke: string; text: string; label: string }> = {
    excellent: { stroke: "#10b981", text: "text-emerald-400", label: "Excellent" },
    good:      { stroke: "#3b82f6", text: "text-blue-400",    label: "Good" },
    needs_work:{ stroke: "#f59e0b", text: "text-amber-400",   label: "Needs Work" },
    major_issues: { stroke: "#ef4444", text: "text-red-400",  label: "Major Issues" },
  };

  const c = colorMap[overall] ?? colorMap.good;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#1f2937" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={c.stroke} strokeWidth="8"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-black font-mono ${c.text}`}>{score}</span>
          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">/100</span>
        </div>
      </div>
      <span className={`text-xs font-bold font-mono ${c.text}`}>{c.label}</span>
    </div>
  );
}

// ── Severity icon ─────────────────────────────────────────────────────────

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === "error")   return <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />;
  if (severity === "warning") return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
  return <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />;
}

function severityBg(severity: string) {
  if (severity === "error")   return "border-red-900/40 bg-red-950/10";
  if (severity === "warning") return "border-amber-900/40 bg-amber-950/10";
  return "border-blue-900/30 bg-blue-950/10";
}

// ── Main Component ────────────────────────────────────────────────────────

export default function CodeReview() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("auto");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleReview = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/codereview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, context })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review failed");
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExample = (ex: typeof EXAMPLE_SNIPPETS[0]) => {
    setCode(ex.code);
    setLanguage(ex.lang);
    setResult(null);
    setError(null);
    textareaRef.current?.focus();
  };

  const handleCopyReview = () => {
    if (!result) return;
    const text = [
      `OpenBridge Code Review — Score: ${result.score}/100 (${result.overall})`,
      `\nSummary: ${result.summary}`,
      `\n✅ Praise:\n${result.praise.map(p => `• ${p}`).join("\n")}`,
      result.issues.length > 0
        ? `\n⚠️ Issues:\n${result.issues.map(i => `[${i.severity.toUpperCase()}] ${i.message}\n  → ${i.suggestion}`).join("\n")}`
        : "",
      `\n💡 Suggestions:\n${result.suggestions.map(s => `• ${s}`).join("\n")}`
    ].join("");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const charCount = code.length;
  const isOverLimit = charCount > 8000;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-violet-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered · Gemini
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Code Review Sandbox
          </h2>
          <p className="text-zinc-500 text-sm mt-1 leading-relaxed max-w-xl">
            Paste your code or diff and get feedback like a real senior maintainer — before you open your PR.
          </p>
        </div>

        {result && (
          <button
            onClick={handleCopyReview}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-all shrink-0"
          >
            {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!</> : <><Clipboard className="w-3.5 h-3.5" /> Copy Review</>}
          </button>
        )}
      </div>

      {/* Main split layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* ── Left: Input panel ──────────────────────────────────────── */}
        <div className="space-y-3">

          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-[#161b22] border border-[#30363d] rounded-lg px-2 py-1.5">
              <FileCode className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-[11px] font-mono text-zinc-300 focus:outline-none cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l} className="bg-[#161b22]">{l === "auto" ? "Auto-detect" : l}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowContext(!showContext)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-all ${showContext ? "border-violet-800/50 bg-violet-950/20 text-violet-400" : "border-[#30363d] bg-[#161b22] text-zinc-500 hover:text-zinc-300"}`}
            >
              <MessageSquare className="w-3 h-3" />
              PR Context
            </button>

            <span className={`ml-auto text-[10px] font-mono ${isOverLimit ? "text-red-400" : "text-zinc-600"}`}>
              {charCount.toLocaleString()} / 8,000
            </span>
          </div>

          {/* Optional PR context */}
          {showContext && (
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
                PR Description / What does this change do?
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. This fixes the padding bug on mobile nav bar — issue #347"
                rows={2}
                className="w-full bg-[#0d1117] border border-[#30363d] hover:border-zinc-700 rounded-lg p-3 text-xs font-sans text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
              />
            </div>
          )}

          {/* Code textarea */}
          <div className="relative rounded-xl overflow-hidden border border-[#30363d] hover:border-zinc-700 focus-within:border-violet-500/40 transition-all">
            {/* Fake line numbers */}
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#0d1117] border-r border-[#21262d] flex flex-col pt-3 overflow-hidden pointer-events-none select-none">
              {Array.from({ length: Math.max(20, code.split("\n").length + 2) }).map((_, i) => (
                <span key={i} className="text-[10px] font-mono text-zinc-800 text-right pr-2 leading-[1.6rem]">{i + 1}</span>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`// Paste your code or diff here...\n// e.g. a function, a component, a route handler`}
              rows={20}
              spellCheck={false}
              className="w-full bg-[#0d1117] pl-12 pr-4 py-3 text-[12px] font-mono text-zinc-300 placeholder-zinc-800 focus:outline-none resize-none leading-[1.6rem]"
            />
          </div>

          {/* Example snippets */}
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-600 mb-2">Try an example</span>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_SNIPPETS.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => handleExample(ex)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#30363d] hover:border-zinc-700 bg-[#161b22] text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-all"
                >
                  <Code className="w-2.5 h-2.5" /> {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleReview}
            disabled={loading || !code.trim() || isOverLimit}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:from-zinc-800 disabled:to-zinc-900 disabled:text-zinc-600 text-white font-bold text-sm transition-all shadow-lg shadow-violet-900/20 disabled:shadow-none"
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing your code…</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Get AI Review</>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-lg border border-red-900/40 bg-red-950/10 text-xs text-red-400 font-mono flex items-start gap-2">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ── Right: Review output panel ─────────────────────────────── */}
        <div>
          {!result && !loading && (
            <div className="h-full min-h-[420px] rounded-xl border border-dashed border-[#30363d] bg-[#0d1117] flex flex-col items-center justify-center gap-4 text-center px-8">
              <div className="w-14 h-14 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center">
                <Shield className="w-7 h-7 text-zinc-700" />
              </div>
              <div>
                <p className="text-zinc-400 font-semibold text-sm">Your review will appear here</p>
                <p className="text-zinc-600 text-xs mt-1 leading-relaxed max-w-xs">
                  Paste any code on the left and click "Get AI Review" to get structured feedback from a simulated senior maintainer.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {["Praise", "Issues", "Suggestions", "Score"].map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full border border-[#30363d] text-[9px] font-mono text-zinc-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[420px] rounded-xl border border-[#30363d] bg-[#0d1117] flex flex-col items-center justify-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-violet-900/40 border-t-violet-500 animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-violet-400" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-zinc-300 text-sm font-semibold">Reviewing your code…</p>
                <p className="text-zinc-600 text-xs font-mono">Running through style, logic, and best practices</p>
              </div>
              <div className="flex flex-col gap-2 w-48">
                {["Checking code style…", "Scanning for issues…", "Writing suggestions…"].map((msg, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-zinc-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-fade-in">

              {/* Score + Summary */}
              <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 flex gap-5 items-start">
                <ScoreRing score={result.score} overall={result.overall} />
                <div className="flex-grow min-w-0">
                  <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Review Summary</span>
                  <p className="text-sm text-zinc-300 leading-relaxed">{result.summary}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5" /> {result.praise.length} praise
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono text-amber-400 bg-amber-950/20 border border-amber-900/30 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-2.5 h-2.5" /> {result.issues.length} issue{result.issues.length !== 1 ? "s" : ""}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono text-blue-400 bg-blue-950/20 border border-blue-900/30 px-2 py-0.5 rounded-full">
                      <Zap className="w-2.5 h-2.5" /> {result.suggestions.length} suggestions
                    </span>
                  </div>
                </div>
              </div>

              {/* Praise */}
              {result.praise.length > 0 && (
                <div className="rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">What you did well</span>
                  </div>
                  {result.praise.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-300 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Issues */}
              {result.issues.length > 0 && (
                <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">Issues Found</span>
                  </div>
                  {result.issues.map((issue, i) => (
                    <div key={i} className={`p-3 rounded-lg border space-y-1.5 ${severityBg(issue.severity)}`}>
                      <div className="flex items-start gap-2">
                        <SeverityIcon severity={issue.severity} />
                        <span className="text-xs text-zinc-200 leading-snug font-medium">{issue.message}</span>
                      </div>
                      <div className="flex items-start gap-2 ml-6">
                        <CornerDownRight className="w-3 h-3 text-zinc-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-zinc-500 leading-snug italic">{issue.suggestion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div className="rounded-xl border border-blue-900/20 bg-blue-950/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">Suggestions to increase merge likelihood</span>
                  </div>
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-400 leading-snug">
                      <ChevronRight className="w-3.5 h-3.5 text-blue-500/60 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Re-review button */}
              <button
                onClick={handleReview}
                disabled={loading}
                className="w-full py-2.5 rounded-xl border border-[#30363d] hover:border-zinc-700 bg-[#161b22] text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-review current code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
