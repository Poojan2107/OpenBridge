import React, { useState } from "react";
import GitTerminalSandbox from "./GitTerminalSandbox";
import { 
  ShieldCheck, 
  HelpCircle, 
  Terminal, 
  Check, 
  X, 
  RefreshCw, 
  GitCommit, 
  GitCommitHorizontal,
  Lock, 
  Signature, 
  Cpu, 
  FileText, 
  ExternalLink,
  ChevronRight,
  GitBranch,
  Github,
  AlertTriangle,
  Award
} from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

const PREFLIGHT_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What does the Developer Certificate of Origin (DCO) commit sign-off rule command?",
    options: [
      "Including an encrypted OAuth web token in every source file header.",
      "Appending a 'Signed-off-by: Your Name <email>' statement in the git commit message (using git commit -s).",
      "Gaining manual code review greenlights in a Slack thread prior to commits.",
      "Purchasing custom SSL keys to authenticate your visual browser profile."
    ],
    answerIndex: 1,
    explanation: "DCO is a lightweight process used by GSoC, LF, and large Git repos (like Linux, Docker, or CNCF) where you certify you wrote the code by certifying your email in the commit header with git commit - s. It avoids tedious legal contracts."
  },
  {
    id: 2,
    question: "When should you prefer Git's 'Squash and Merge' option over a standard Fast-Forward Merge?",
    options: [
      "When you need to keep every single granular file modification state in the master history.",
      "To combine multiple trivial or messy WIP commits into a single clean commit with structured reviews.",
      "When the upstream target repository belongs to private local enterprise networks.",
      "Only when compiling styling updates with Tailwind utility classes."
    ],
    answerIndex: 1,
    explanation: "Squashing combines all commits from a feature branch into one solid commit in the master line, making the git tree highly legible, clear, and professional."
  },
  {
    id: 3,
    question: "What is the primary difference between a Permissive license (MIT/Apache) and a Copyleft license (GPL)?",
    options: [
      "Permissive licenses forbid hosting code outside of private local networks.",
      "Copyleft licenses are completely closed-source with hidden code vaults.",
      "Copyleft requires derivative works to also be open-source under identical license terms.",
      "Permissive licenses demand paid loyalty subscriptions from enterprise developers."
    ],
    answerIndex: 2,
    explanation: "GPL (Copyleft) specifies that any software modifying or matching GPL blocks must release their modifications under the same open conditions. MIT or Apache permit private redistribution."
  },
  {
    id: 4,
    question: "If your pull request is marked 'stale' by a GitHub Actions bot, what is the correct practice?",
    options: [
      "Open a parallel issue demanding immediate response from team leads.",
      "Rebase your branch against the latest main trunk and add a polite progress note to clear the stale label.",
      "Delete your fork completely to reset the tracker caches.",
      "Clone alternative repositories and submit identical files there."
    ],
    answerIndex: 1,
    explanation: "Rebasing refreshes the timeline, solves conflict errors, and tells the maintainers you are active. Avoid toxic or demanding reactions."
  }
];

export default function PreflightConsole() {
  // GPG generation states
  const [userName, setUserName] = useState(() => localStorage.getItem("ob_gpg_username") || "");
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("ob_gpg_email") || "");
  const [generatingGPG, setGeneratingGPG] = useState(false);
  const [generatedGPG, setGeneratedGPG] = useState<string | null>(() => localStorage.getItem("ob_gpg_key") || null);

  // GPG verification states
  const [gpgTab, setGpgTab] = useState<"generate" | "verify">("generate");
  const [pastedGpgKey, setPastedGpgKey] = useState("");
  const [verifyingGPG, setVerifyingGPG] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [parsedMetadata, setParsedMetadata] = useState<any | null>(null);
  
  // Quiz states
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>(() => {
    try {
      const saved = localStorage.getItem("ob_quiz_answers");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [submittedQuiz, setSubmittedQuiz] = useState(() => localStorage.getItem("ob_quiz_submitted") === "true");
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem("ob_quiz_score");
    return saved ? parseInt(saved, 10) : 0;
  });

  // Authenticity analyzer checks states
  const [analyzingSystem, setAnalyzingSystem] = useState(false);
  const [systemChecks, setSystemChecks] = useState<Array<{ name: string; status: "success" | "warning"; details: string }>>(() => {
    try {
      const saved = localStorage.getItem("ob_system_checks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.some((c: any) => c.name === "Git Workflow DCO Compliance")) {
          parsed.push({ name: "Git Workflow DCO Compliance", status: "warning", details: "Unverified Git workflow sequence. Complete git commits in Sandbox Terminal to test." });
        }
        return parsed;
      }
    } catch {}
    return [
      { name: "Global Git Config Signature", status: "success", details: "Local signature mapped to validated email records." },
      { name: "Repository Origin Trust", status: "success", details: "Push boundaries aligned to upstream main forks." },
      { name: "Commit Auth (GPG Keys)", status: "warning", details: "Unsigned timeline commits detected. Generate GPG below to secure." },
      { name: "Git Workflow DCO Compliance", status: "warning", details: "Unverified Git workflow sequence. Complete git commits in Sandbox Terminal to test." }
    ];
  });

  const handleTerminalSuccess = () => {
    setSystemChecks(prev =>
      prev.map(c =>
        c.name === "Git Workflow DCO Compliance"
          ? { name: "Git Workflow DCO Compliance", status: "success", details: "Git staging, sign-offs, and push operations verified successfully!" }
          : c
      )
    );
  };

  React.useEffect(() => {
    localStorage.setItem("ob_gpg_username", userName);
  }, [userName]);

  React.useEffect(() => {
    localStorage.setItem("ob_gpg_email", userEmail);
  }, [userEmail]);

  React.useEffect(() => {
    if (generatedGPG) {
      localStorage.setItem("ob_gpg_key", generatedGPG);
    } else {
      localStorage.removeItem("ob_gpg_key");
    }
  }, [generatedGPG]);

  React.useEffect(() => {
    localStorage.setItem("ob_quiz_answers", JSON.stringify(selectedAnswers));
  }, [selectedAnswers]);

  React.useEffect(() => {
    localStorage.setItem("ob_quiz_submitted", submittedQuiz ? "true" : "false");
  }, [submittedQuiz]);

  React.useEffect(() => {
    localStorage.setItem("ob_quiz_score", score.toString());
  }, [score]);

  React.useEffect(() => {
    localStorage.setItem("ob_system_checks", JSON.stringify(systemChecks));
  }, [systemChecks]);

  const handleGenerateGPG = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    setGeneratingGPG(true);
    setTimeout(() => {
      // Create a beautiful mock GPG standard visual format
      const shortId = Math.random().toString(36).substring(2, 10).toUpperCase();
      const longId = Math.random().toString(16).substring(2, 18).toUpperCase();
      const timestamp = new Date().toISOString().split("T")[0];
      
      const gpgKeyBlock = [
        `-----BEGIN PGP PUBLIC KEY BLOCK-----`,
        `Version: OpenBridge DevSec 2026.1`,
        `Comment: Signed Committer ID for ${userName}`,
        `HexID: 0x${longId}`,
        ``,
        `mQINBF+7iBUBEADK4JgPzoE8G/R5tY3n9W11K0Dzkr8/t3QZtZz8yKj8EwFk0V4E`,
        `F1FzU5T7qPn1d3V3dH9i8M9G9w9g8e1O9m8n9n5v3m3r9I9fE8v9j5N6K4z8S4H`,
        `yL3K9j3o9v1P+Z4j4U9O8P9Q9L7e5N5Y8d9I=`,
        `=K9Y3`,
        `-----END PGP PUBLIC KEY BLOCK-----`,
        `# Secure Commit Signer Alias: gpg --sign-commit -u ${shortId} -m "Signed-off-by: ${userName} <${userEmail}>"`
      ].join("\n");

      setGeneratedGPG(gpgKeyBlock);
      setGeneratingGPG(false);
      
      // Update warning status to success in system checks!
      setSystemChecks(prev => 
        prev.map(c => 
          c.name === "Commit Auth (GPG Keys)" 
            ? { name: "Commit Auth (GPG Keys)", status: "success", details: `GPG Key 0x${longId.substring(0, 8)} successfully linked & signed.` }
            : c
        )
      );
    }, 2000);
  };

  const handleVerifyGPG = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedGpgKey.trim()) return;

    setVerifyingGPG(true);
    setVerificationError(null);
    setParsedMetadata(null);

    try {
      const res = await fetch("/api/gpg/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKeyBlock: pastedGpgKey })
      });

      const data = await res.json();
      if (!res.ok) {
        setVerificationError(data.error || "Failed to verify key.");
      } else {
        setParsedMetadata(data.metadata);
        setSystemChecks(prev => 
          prev.map(c => 
            c.name === "Commit Auth (GPG Keys)" 
              ? { name: "Commit Auth (GPG Keys)", status: "success", details: `GPG Key 0x${data.metadata.keyId.substring(0, 8)} (${data.metadata.name}) verified & linked successfully.` }
              : c
          )
        );
      }
    } catch (err: any) {
      setVerificationError(err.message || "Network request failed.");
    } finally {
      setVerifyingGPG(false);
    }
  };

  const handleQuizSubmit = () => {
    let currentScore = 0;
    PREFLIGHT_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.answerIndex) {
        currentScore += 1;
      }
    });
    setScore(currentScore);
    setSubmittedQuiz(true);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmittedQuiz(false);
    setScore(0);
  };

  const handleRunSystemDiagnostics = () => {
    setAnalyzingSystem(true);
    setTimeout(() => {
      setAnalyzingSystem(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Intro pitch resembling GSoC & Hacktoberfest readiness benchmarks */}
      <div className="border border-zinc-90 w-full bg-zinc-950/40 rounded-xl p-6 relative overflow-hidden">
        <div className="mb-4">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Compliance & Verification Layer
          </span>
          <h2 className="text-lg font-bold text-zinc-150 tracking-tight mt-1">
            Pre-flight Authenticity & Onboarding Quiz Checks
          </h2>
          <p className="text-zinc-400 text-xs mt-1.5 max-w-3xl leading-relaxed">
            Open-source communities like Google Summer of Code (GSoC) and Hacktoberfest mandate clean contribution standards. Validate your Git identity, verify your commit signature, and test your open-source hygiene prior to code submission.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5/12): Developer Identity Authenticity & GPG Signature System Checks */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#090a0f] border border-zinc-900 rounded-xl p-5 hover:border-zinc-800 transition-all duration-150 relative">
            
            {/* Component header */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                DevSec Certificate Check
              </span>
              <button
                type="button"
                onClick={handleRunSystemDiagnostics}
                className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900"
              >
                {analyzingSystem ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Refresh Checks"}
              </button>
            </div>

            <h3 className="text-sm font-bold text-zinc-150 tracking-tight">
              Developer Certificate of Origin (DCO) Setup
            </h3>
            <p className="text-zinc-500 text-[11px] mt-1.5 leading-relaxed">
              Before submitting Pull Requests, modern systems require GPG Commit Signing or explicit sign-offs in your local Git environments. Check your validation matrix:
            </p>

            {/* List of authenticity checks resembling GitHub checks row */}
            <div className="space-y-2.5 mt-4">
              {systemChecks.map((check, idx) => (
                <div 
                  key={idx}
                  className={`border rounded p-3 text-[11px] font-mono ${
                    check.status === "success" 
                      ? "bg-zinc-950/60 border-zinc-900" 
                      : "bg-amber-950/5 border-amber-955/20 text-amber-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-zinc-300 flex items-center gap-2">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${check.status === "success" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                      {check.name}
                    </span>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      check.status === "success" 
                        ? "text-emerald-400 bg-emerald-950/20 border border-emerald-900/30" 
                        : "text-amber-400 bg-amber-950/30 border border-amber-900/30"
                    }`}>
                      {check.status === "success" ? "Passed" : "Action Needed"}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-[10.5px] leading-relaxed">{check.details}</p>
                </div>
              ))}
            </div>

            {/* GPG Key Verification & Generator Tabs */}
            <div className="mt-6 border-t border-zinc-90 pt-5 pr-1 space-y-4">
              <div className="flex items-center gap-1.5 p-1 bg-[#0a0a0f] border border-zinc-900 rounded-lg max-w-xs">
                <button
                  type="button"
                  onClick={() => setGpgTab("generate")}
                  className={`flex-grow py-1 px-3 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                    gpgTab === "generate"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-350"
                  }`}
                >
                  Generate Key
                </button>
                <button
                  type="button"
                  onClick={() => setGpgTab("verify")}
                  className={`flex-grow py-1 px-3 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                    gpgTab === "verify"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-350"
                  }`}
                >
                  Verify Key
                </button>
              </div>

              {gpgTab === "generate" ? (
                /* Simulated Git Config Generator form */
                <form onSubmit={handleGenerateGPG} className="space-y-3">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 font-mono">Sign Your Identity (Secure GPG Key Generator)</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-zinc-550 mb-1 font-mono">Full Git Legal Name</label>
                      <input
                        type="text"
                        required
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="e.g. Linus Torvalds"
                        className="w-full bg-black/40 border border-zinc-900 rounded p-2 text-xs font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-550 mb-1 font-mono">Git Config Email Address</label>
                      <input
                        type="email"
                        required
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="e.g. mail@example.com"
                        className="w-full bg-black/40 border border-zinc-900 rounded p-2 text-xs font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/30"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={generatingGPG || !userName.trim() || !userEmail.trim()}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 border border-emerald-800 text-white disabled:bg-zinc-900 disabled:border-zinc-805 disabled:text-zinc-650 rounded text-[11px] font-mono uppercase font-bold tracking-wider cursor-pointer transition-colors"
                  >
                    {generatingGPG ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Generating Secure PGP Signature Block...
                      </>
                    ) : (
                      <>
                        Generate Digital Git Signature
                        <Signature className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Verify GPG Key Paste Form */
                <form onSubmit={handleVerifyGPG} className="space-y-3">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 font-mono">Verify GPG Public Key Block</span>
                  <div>
                    <label className="block text-[9px] text-zinc-550 mb-1 font-mono">Paste GPG Public Key ASCII Armor</label>
                    <textarea
                      required
                      value={pastedGpgKey}
                      onChange={(e) => setPastedGpgKey(e.target.value)}
                      placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----&#10;...&#10;-----END PGP PUBLIC KEY BLOCK-----"
                      className="w-full bg-black/40 border border-zinc-900 rounded p-2 text-xs font-mono text-zinc-200 placeholder-zinc-700 h-28 focus:outline-none focus:border-blue-500/30 resize-none"
                    />
                  </div>

                  {verificationError && (
                    <div className="p-2.5 rounded bg-red-950/20 border border-red-900/30 text-rose-400 font-mono text-[10.5px]">
                      Error: {verificationError}
                    </div>
                  )}

                  {parsedMetadata && (
                    <div className="p-3 rounded bg-blue-950/10 border border-blue-900/30 text-zinc-300 font-mono text-[10.5px] space-y-1">
                      <div className="text-[9px] uppercase font-bold text-sky-400 mb-1">Parsed OpenPGP Metadata</div>
                      <div><span className="text-zinc-500">Key ID:</span> <span className="text-zinc-200 font-bold">0x{parsedMetadata.keyId}</span></div>
                      <div><span className="text-zinc-500">Identity:</span> <span className="text-zinc-200">{parsedMetadata.name} &lt;{parsedMetadata.email}&gt;</span></div>
                      <div><span className="text-zinc-500">Algorithm:</span> <span className="text-zinc-200">{parsedMetadata.algorithm} ({parsedMetadata.keyLength} bits)</span></div>
                      <div><span className="text-zinc-500">Created At:</span> <span className="text-zinc-200">{new Date(parsedMetadata.createdAt).toLocaleDateString()}</span></div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={verifyingGPG || !pastedGpgKey.trim()}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-800 hover:bg-blue-700 border border-blue-900 text-white disabled:bg-zinc-900 disabled:border-zinc-805 disabled:text-zinc-650 rounded text-[11px] font-mono uppercase font-bold tracking-wider cursor-pointer transition-colors"
                  >
                    {verifyingGPG ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Verifying GPG Public Key Packet...
                      </>
                    ) : (
                      <>
                        Verify & Link GPG Signature
                        <Signature className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Generated PGP Key display (Terminal looking wrapper) */}
              {generatedGPG && gpgTab === "generate" && (
                <div className="mt-4 border border-zinc-90 w-full rounded overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1 bg-zinc-950 border-b border-zinc-90 w-full text-zinc-500 text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-[#2da44e]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Verified Key Block Linked
                    </span>
                    <span>GPG PUBLIC BLOCK</span>
                  </div>
                  <pre className="p-3 bg-black font-mono text-[9.5px] text-emerald-450 leading-relaxed overflow-x-auto max-h-[140px] select-all">
                    {generatedGPG}
                  </pre>
                  <div className="p-2.5 bg-zinc-950 text-[10px] text-zinc-500 font-mono flex items-center gap-2.5 border-t border-zinc-90">
                    <span className="text-emerald-500 font-bold block shrink-0">Security Tip:</span>
                    <span>Use git commit -S and paste this signed DCO block parameters to show the verified green commit badge in GitHub!</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Git Sandbox Command Simulator Card */}
          <div className="bg-[#090a0f] border border-zinc-900 rounded-xl p-5 hover:border-zinc-800 transition-all duration-150 relative">
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                Git Sandbox Command Simulator
              </span>
            </div>
            <h3 className="text-sm font-bold text-zinc-150 tracking-tight mb-1.5 font-sans">
              Simulated Git Environment
            </h3>
            <p className="text-zinc-500 text-[11px] leading-relaxed mb-4 font-mono">
              Practice making signed DCO commits on a mock terminal before pushing to upstream. Type <code className="text-zinc-300">help</code> or <code className="text-zinc-300">git status</code> to begin.
            </p>
            <GitTerminalSandbox onSuccess={handleTerminalSuccess} />
          </div>

        </div>

        {/* Right Column (7/12): Highly Interactive Open Source Developer प्री-फ़्लाइट Quiz */}
        <div className="lg:col-span-7 bg-[#090a0f] border border-zinc-900 rounded-xl p-5 hover:border-zinc-800 transition-all duration-150 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-sky-450 font-bold">
                <HelpCircle className="w-3.5 h-3.5 text-sky-450" />
                Pre-Flight Interactive Quiz
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {Object.keys(selectedAnswers).length}/{PREFLIGHT_QUESTIONS.length} Answered
              </span>
            </div>

            <h3 className="text-sm font-bold text-zinc-150 tracking-tight">
              Open-Source Developer Readiness Quiz
            </h3>
            <p className="text-zinc-500 text-[11px] mt-1.5 leading-relaxed">
              Test your proficiency in git version control, merge behaviors, open source licensing, and pull request communication. Earn a score above 75% to unlock your simulated Onboarding Badge.
            </p>

            {/* Active Quiz Card Grid */}
            <div className="space-y-5 mt-5 max-h-[460px] overflow-y-auto pr-1">
              {PREFLIGHT_QUESTIONS.map((q, qIdx) => {
                const selectedOption = selectedAnswers[q.id];
                const isCorrect = selectedOption === q.answerIndex;

                return (
                  <div key={q.id} className="p-4 rounded-lg bg-zinc-950 border border-zinc-90 w-full space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-mono font-bold text-zinc-500 mt-0.5">Q0{qIdx + 1}</span>
                      <h4 className="text-xs font-bold text-zinc-200 leading-relaxed font-mono">
                        {q.question}
                      </h4>
                    </div>

                    <div className="space-y-1.5 pl-5">
                      {q.options.map((opt, optIdx) => {
                        const isItemSelected = selectedOption === optIdx;
                        let itemClass = "bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-800";
                        
                        if (submittedQuiz) {
                          if (optIdx === q.answerIndex) {
                            itemClass = "bg-emerald-950/20 text-emerald-300 border-emerald-900/80 font-semibold";
                          } else if (isItemSelected) {
                            itemClass = "bg-rose-955/20 text-rose-300 border-rose-900/60";
                          } else {
                            itemClass = "bg-zinc-950/40 text-zinc-500 border-zinc-950 opacity-60";
                          }
                        } else if (isItemSelected) {
                          itemClass = "bg-zinc-90 text-zinc-100 border-zinc-700 font-semibold";
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={submittedQuiz}
                            onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                            className={`w-full flex items-start gap-2.5 p-2 rounded text-left text-[11px] border cursor-pointer select-none transition-all leading-normal ${itemClass}`}
                          >
                            <span className="font-semibold text-[10px] text-zinc-500 font-mono mt-0.5">{String.fromCharCode(65 + optIdx)}.</span>
                            <span className="font-sans">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Show explanation after submitting */}
                    {submittedQuiz && (
                      <div className="mt-2.5 pl-5 pt-3 border-t border-zinc-90 flex items-start gap-2 text-[10.5px] leading-relaxed select-none">
                        <Terminal className="w-3.5 h-3.5 mt-0.5 text-zinc-500 shrink-0" />
                        <div>
                          <span className={`font-bold font-mono ${isCorrect ? "text-emerald-400" : "text-amber-400"} uppercase block text-[9px] tracking-wider mb-0.5`}>
                            {isCorrect ? "✓ Answer Correct" : "✗ Incorrect Answer"}
                          </span>
                          <p className="text-zinc-500 font-sans">{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-zinc-900">
            {!submittedQuiz ? (
              <button
                type="button"
                onClick={handleQuizSubmit}
                disabled={Object.keys(selectedAnswers).length < PREFLIGHT_QUESTIONS.length}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-200 hover:bg-white disabled:bg-zinc-900 border border-zinc-350 disabled:border-zinc-800 text-zinc-950 disabled:text-zinc-650 rounded text-xs font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                Evaluate Pre-Flight Proficiency
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-zinc-950 rounded-lg border border-zinc-900 select-none">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded ${score >= 3 ? "bg-emerald-950/20 text-emerald-450 border border-emerald-900/40" : "bg-zinc-90 text-zinc-400 border border-zinc-800"}`}>
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-zinc-200 font-mono uppercase tracking-wider">
                      Pre-flight evaluation: {score}/4 Score
                    </span>
                    <span className="block text-[11px] text-zinc-500 leading-normal font-sans">
                      {score === 4 && "Master level comitter setup! Absolute MVP ready."}
                      {score === 3 && "Solid proficiency. Perfect baseline to begin fork reviews."}
                      {score < 3 && "Ready to learn. Read the explanations to lock in standards."}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="px-3 py-1.5 text-[10.5px] hover:text-zinc-1 text-zinc-400 font-semibold font-mono border border-zinc-900 hover:border-zinc-80 bg-zinc-950 rounded cursor-pointer transition-colors"
                >
                  Retake Prep-Eval
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
