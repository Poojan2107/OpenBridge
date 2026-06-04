import React, { useState } from "react";
import { Terminal, Lightbulb, CheckSquare, Sparkles, BookOpen, FileCode2, Copy, Check, ArrowRight, HelpCircle } from "lucide-react";
import { IssueTranslation } from "../types";

interface IssueTranslatorProps {
  onTranslate: (issueText: string) => Promise<IssueTranslation | null>;
}

const PRESETS = [
  {
    title: "Live GitHub Issue (facebook/react)",
    text: "https://github.com/facebook/react/issues/28000"
  },
  {
    title: "Vite local server port conflict",
    text: "Error: listen EADDRINUSE: address already in use :::3000 at Server.setupListenHandle [as _listen2] (node:net:1812:14) at listenInCluster (node:net:1860:12) at Server.listen (node:net:1948:7) - The development server crashed because port 3000 is occupied. Introduce a warning or search for the next available port dynamically."
  },
  {
    title: "React stale closure in search input hook",
    text: "Warning: React hook useEffect has a missing dependency: 'fetchResults'. Either include it or remove the dependency array. When typing inside the search input rapidly, the old fetched requests resolve after the newer ones, leading to outdated query lists rendering on-screen."
  }
];

export default function IssueTranslator({ onTranslate }: IssueTranslatorProps) {
  const [issueText, setIssueText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [explanation, setExplanation] = useState<IssueTranslation | null>(null);
  const [completedSteps, setCompletedSteps] = useState<{ [key: number]: boolean }>({});
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startLoaderAnimation = () => {
    setLoadingStep(0);
    const steps = [
      "Contacting GitHub repositories API...",
      "Deconstructing code semantic contexts...",
      "Mapping issue dependencies to files...",
      "Generating action guidelines with Gemini..."
    ];
    
    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setLoadingStep(current);
      } else {
        clearInterval(interval);
      }
    }, 700);

    return () => clearInterval(interval);
  };

  const handleTranslate = async (textToUse: string) => {
    if (!textToUse.trim()) return;
    setLoading(true);
    setError(null);
    setExplanation(null);
    setCompletedSteps({});
    
    const stopInterval = startLoaderAnimation();

    try {
      const res = await onTranslate(textToUse);
      if (res) {
        setExplanation(res);
      } else {
        setError("Gemini was unable to decipher this text. Please refine the description or use one of our preset templates.");
      }
    } catch (err) {
      setError("Failed to establish server contact. Falling back to local diagnostic metrics.");
    } finally {
      stopInterval();
      setLoading(false);
    }
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyFile = (filePath: string) => {
    navigator.clipboard.writeText(filePath);
    setCopiedFile(filePath);
    setTimeout(() => setCopiedFile(null), 1500);
  };

  const loaderMessages = [
    "Contacting GitHub repositories API...",
    "Deconstructing code semantic contexts...",
    "Mapping issue dependencies to files...",
    "Generating action guidelines with Gemini..."
  ];

  return (
    <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          Source diagnostic engine
        </span>
        <h2 className="text-lg font-bold text-zinc-150 tracking-tight mt-1">
          Issue Translator & Target Mapper
        </h2>
        <p className="text-zinc-400 text-xs mt-1 max-w-2xl leading-relaxed">
          Paste any raw GitHub issue description, bug trace log, or a **live GitHub issue URL**. Gemini will fetch the content, isolate the cause, identify affected target files, and generate a step-by-step checklist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-1.5">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-650 font-mono">Quick-test cases</span>
            <div className="flex flex-col gap-1.5">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIssueText(p.text);
                    handleTranslate(p.text);
                  }}
                  className="text-left p-3 rounded bg-[#090a0f] border border-zinc-900 hover:border-zinc-800 transition-all duration-150 group"
                >
                  <span className="block text-xs font-bold text-zinc-350 group-hover:text-zinc-205 transition-colors">
                    {p.title}
                  </span>
                  <span className="block text-[10px] text-zinc-600 mt-1 line-clamp-1 font-mono">
                    {p.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-1">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-650 mb-1.5 font-mono">Custom Input (Text or Issue URL)</label>
            <div className="relative">
              <textarea
                value={issueText}
                onChange={(e) => setIssueText(e.target.value)}
                placeholder="Paste code segments, stacktrace blocks, or a public GitHub issue URL (e.g., https://github.com/owner/repo/issues/123)..."
                rows={6}
                className="w-full bg-[#090a0f] border border-zinc-900 rounded p-3 text-xs font-mono text-zinc-200 placeholder-zinc-750 focus:outline-none focus:border-zinc-700 leading-relaxed resize-none"
              />
              <span className="absolute bottom-2.5 right-2.5 text-[9px] text-zinc-650 font-mono">
                {issueText.length} chars
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleTranslate(issueText)}
            disabled={loading || !issueText.trim()}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-200 hover:bg-white disabled:bg-zinc-900 border border-zinc-300 disabled:border-zinc-800 text-zinc-950 disabled:text-zinc-655 rounded text-xs font-bold font-mono uppercase tracking-wider transition-all duration-150 focus:outline-none cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-zinc-500 border-t-zinc-950 rounded-full animate-spin"></span>
                Processing Diagnostic Matrix...
              </>
            ) : (
              <>
                Analyze & Deconstruct Issue
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Right Column: Dynamic Output */}
        <div className="lg:col-span-7 bg-[#090a0f]/40 border border-zinc-900 rounded-lg p-5 min-h-[300px] flex flex-col justify-between relative">
          
          {/* Default Empty State */}
          {!loading && !explanation && !error && (
            <div className="m-auto text-center max-w-sm space-y-4 py-8 select-none">
              <div className="inline-flex p-3 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">Awaiting Issue Inputs</h4>
                <p className="text-xs text-zinc-500 mt-1 pb-4 leading-relaxed">
                  Select a test case on the left, or input your custom traceback block to see affected files & resolution instructions index.
                </p>
              </div>
            </div>
          )}

          {/* Dynamic Skeleton Loader */}
          {loading && (
            <div className="space-y-6 my-auto">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-zinc-400 border-t-zinc-950 animate-spin shrink-0"></div>
                <span className="text-xs font-mono text-zinc-400 font-semibold uppercase tracking-wider animate-pulse">
                  {loaderMessages[loadingStep]}
                </span>
              </div>

              <div className="space-y-3">
                <div className="h-3 bg-zinc-900 rounded animate-pulse w-3/4"></div>
                <div className="h-2.5 bg-zinc-900 rounded animate-pulse w-5/6"></div>
                <div className="h-2.5 bg-zinc-900 rounded animate-pulse w-2/3"></div>
              </div>

              <div className="pt-4 border-t border-zinc-90 w-full space-y-1.5">
                <div className="h-2 bg-zinc-900 rounded animate-pulse w-1/4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-zinc-900 rounded animate-pulse w-24"></div>
                  <div className="h-6 bg-zinc-900 rounded animate-pulse w-32"></div>
                </div>
              </div>
            </div>
          )}

          {/* Custom Error State */}
          {error && !loading && (
            <div className="m-auto text-center max-w-sm space-y-2 py-6 select-none">
              <span className="text-amber-500 text-xs font-bold font-mono uppercase tracking-wider">⚠️ Translation Warning</span>
              <p className="text-xs text-zinc-500 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Success Explanation Rendering */}
          {explanation && !loading && (
            <div className="space-y-6 animate-fade-in text-xs leading-relaxed">
              {/* Meaning */}
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-zinc-900 px-2 py-0.5 border border-zinc-800 rounded">
                  Plain Description Synthesis
                </span>
                <p className="text-zinc-300 leading-relaxed font-sans">
                  {explanation.meaning}
                </p>
              </div>

              {/* High Probability Files */}
              <div className="space-y-2 border-t border-zinc-900 pt-5">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-2 font-mono">
                  Isolatable Target Files
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {explanation.files.map((file, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-2 bg-[#090a0f] border border-zinc-900 rounded px-2.5 py-1.5 text-[11px] font-mono text-zinc-300 transition-colors group/file relative"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{file}</span>
                      <button
                        type="button"
                        onClick={() => copyFile(file)}
                        className="text-zinc-650 hover:text-zinc-300 ml-1 p-0.5 rounded hover:bg-zinc-900 transition-colors"
                        title="Copy file path"
                      >
                        {copiedFile === file ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Guides */}
              <div className="space-y-3 border-t border-zinc-900 pt-5">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-2 font-mono">
                  Recommended Steps
                </span>
                <div className="space-y-2">
                  {explanation.steps.map((step, idx) => {
                    const active = completedSteps[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleStep(idx)}
                        className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-all duration-150 select-none ${
                          active
                            ? "bg-zinc-950/65 border-zinc-900 text-zinc-500"
                            : "bg-zinc-950/30 border-zinc-905 hover:border-zinc-855 text-zinc-300"
                        }`}
                      >
                        <div className={`p-0.5 rounded border mt-0.5 ${
                          active
                            ? "border-zinc-500 bg-zinc-650 text-zinc-100"
                            : "border-zinc-805 text-transparent bg-transparent"
                        }`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <div className="text-[11px] leading-relaxed">
                          <span className={`block font-bold mb-0.5 text-[9px] uppercase tracking-wider text-zinc-500`}>
                            Target 0{idx + 1}
                          </span>
                          <span className={`${active ? "line-through text-zinc-550" : ""}`}>
                            {step}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-[10px] text-zinc-550 italic mt-2 font-mono text-right">
                engine: gemini-3.5-flash
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
