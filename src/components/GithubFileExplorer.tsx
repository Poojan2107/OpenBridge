// GithubFileExplorer component replicates the GitHub file structure and content viewer.
import React, { useState } from "react";
import {
  Folder,
  File,
  GitBranch,
  ChevronRight,
  ArrowLeft,
  Eye,
  Copy,
  Check,
  Info,
  Calendar,
  Lock,
  GitPullRequest,
  CheckCircle,
  Users,
  Code2,
  CheckCircle2,
} from "lucide-react";

interface GithubFile {
  name: string;
  type: "file" | "directory";
  commitMessage: string;
  author: string;
  time: string;
  content?: string;
}

const SIMULATED_FILES: GithubFile[] = [
  {
    name: ".github/workflows",
    type: "directory",
    commitMessage: "ci: add validation for signature pre-flights and linter checks",
    author: "openbridge-bot",
    time: "2 hours ago",
  },
  {
    name: "src",
    type: "directory",
    commitMessage: "feat: add secure credential mapper client and AI translator",
    author: "guest-committer",
    time: "3 hours ago",
  },
  {
    name: "src/components",
    type: "directory",
    commitMessage: "refactor: optimize dashboard UI alignment to replicate git metrics",
    author: "guest-committer",
    time: "3 hours ago",
  },
  {
    name: "package.json",
    type: "file",
    commitMessage: "chore: bump modern gemini sdk version to v2.4.0",
    author: "openbridge-bot",
    time: "Yesterday",
    content: `{
  "name": "openbridge-onboarding-hub",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "tsc --noEmit",
    "test:ci": "jest --passWithNoTests"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "react": "^19.0.1",
    "lucide-react": "^0.546.0"
  }
}`,
  },
  {
    name: "tsconfig.json",
    type: "file",
    commitMessage: "chore: configure strict typescript compiler checks",
    author: "guest-committer",
    time: "3 days ago",
    content: `{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ScriptHost", "ES2022"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}`,
  },
  {
    name: "LICENSE",
    type: "file",
    commitMessage: "docs: add standard MIT global license agreements",
    author: "openbridge-bot",
    time: "Last week",
    content: `MIT License

Copyright (c) 2026 OpenBridge Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    name: "verify-pr.yml",
    type: "file",
    commitMessage: "ci: enforce developer certificate of origin (DCO) signup",
    author: "openbridge-bot",
    time: "2 hours ago",
    content: `name: Verify Onboarding PR
on:
  pull_request:
    branches: [ main ]

jobs:
  verify-signatures:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Codebase
        uses: actions/checkout@v4

      - name: Verify Signed-off-by Git Header
        run: |
          echo "Scanning commits for Developer Certificate of Origin (DCO) approval..."
          git log --format=full --no-merges | grep -q "Signed-off-by:" || {
            echo "Error: Missing DCO 'Signed-off-by' line inside commits. Follow contributing guidelines."
            exit 1
          }
          echo "Success! Commit header contains validated signature."`,
  },
];

export default function GithubFileExplorer() {
  const [selectedFile, setSelectedFile] = useState<GithubFile | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-[#30363d] bg-[#0d1117] rounded-xl overflow-hidden font-sans">
      {/* File Explorer Header with branch selector and meta counts */}
      <div className="p-4 bg-[#161b22] border-b border-[#30363d] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          {/* Branch tag selector */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#21262d] border border-[#30363d] rounded-md text-zinc-200 hover:bg-[#30363d] transition-colors cursor-pointer text-[11px] font-semibold">
            <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
            <span>main</span>
          </div>
          <span className="text-zinc-500 font-sans tracking-tight">
            latest commit <span className="text-zinc-300 font-bold font-mono">OB-89ad3f</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-zinc-400 font-sans text-[11px]">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Commit signed
          </span>
          <span>•</span>
          <span className="hover:text-zinc-200 cursor-pointer">
            <strong className="text-zinc-200 font-mono">14</strong> commits
          </span>
          <span>•</span>
          <span className="hover:text-zinc-200 cursor-pointer">
            <strong className="text-zinc-200 font-mono">1</strong> branch
          </span>
        </div>
      </div>

      {/* Commit Author Header */}
      <div className="px-4 py-3 bg-[#161b22]/40 border-b border-[#30363d] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center font-mono text-[9px] text-white font-bold">
            GC
          </div>
          <span className="font-semibold text-zinc-350 hover:underline cursor-pointer">
            guest-committer
          </span>
          <span className="text-zinc-500 hover:underline cursor-pointer font-mono truncate max-w-[200px] md:max-w-md">
            feat: adjust local environment pre-flight validator checklist
          </span>
        </div>
        <span className="text-zinc-500 font-mono text-[11px] shrink-0">3 hours ago</span>
      </div>

      {/* Interactive Render Frame (File List vs File Contents) */}
      {!selectedFile ? (
        <div className="divide-y divide-[#30363d] font-mono text-[12px]">
          {SIMULATED_FILES.map((file) => (
            <div
              key={file.name}
              onClick={() => {
                if (file.type === "file") {
                  setSelectedFile(file);
                }
              }}
              className={`flex items-center justify-between p-3 transition-colors ${
                file.type === "file"
                  ? "hover:bg-[#161b22]/50 cursor-pointer text-zinc-300"
                  : "text-zinc-400 cursor-help"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-4">
                {file.type === "directory" ? (
                  <Folder className="w-4 h-4 text-sky-450 shrink-0" />
                ) : (
                  <File className="w-4 h-4 text-zinc-400 shrink-0" />
                )}
                <span
                  className={`truncate ${file.type === "file" ? "hover:underline text-zinc-250 font-semibold" : ""}`}
                >
                  {file.name}
                </span>
              </div>

              <div className="hidden md:flex items-center justify-between gap-6 flex-grow min-w-0 pr-4 text-zinc-500">
                <span className="truncate max-w-sm font-sans block text-left">
                  {file.commitMessage}
                </span>
              </div>

              <div className="shrink-0 text-right text-zinc-500 text-[11px]">{file.time}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#0d1117] text-zinc-300 animate-fade-in">
          {/* File Viewer Secondary header */}
          <div className="p-3 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between text-xs font-mono">
            <button
              onClick={() => setSelectedFile(null)}
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer bg-[#21262d] border border-[#30363d] px-2 py-1 rounded"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="font-semibold text-zinc-200">{selectedFile.name}</span>

            <button
              onClick={() => handleCopyCode(selectedFile.content || "")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#21262d] border border-[#30363d] text-zinc-300 hover:bg-[#30363d] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-405" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Code
                </>
              )}
            </button>
          </div>

          {/* Scrolled Code Panel */}
          <div className="p-4 overflow-x-auto font-mono text-[11.5px] leading-relaxed bg-[#0d1117] text-zinc-300 max-h-[350px]">
            <table className="w-full border-collapse">
              <tbody>
                {(selectedFile.content || "").split("\n").map((line, idx) => (
                  <tr key={idx} className="hover:bg-[#161b22]/20">
                    <td className="w-10 text-right text-zinc-600 select-none pr-4 text-[10.5px]">
                      {idx + 1}
                    </td>
                    <td className="whitespace-pre text-left">{line || " "}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Built-in README Rendering Section, beautifully styling actual guidelines */}
      <div className="border-t border-[#30363d] bg-[#0d1117]">
        {/* README header banner */}
        <div className="px-4 py-3 bg-[#161b22]/40 border-b border-[#30363d] flex items-center gap-2">
          <Info className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-300 font-mono">README.md</span>
        </div>

        {/* Readme body with strict Markdown replication styling */}
        <div className="p-6 md:p-8 space-y-6 text-zinc-300 leading-relaxed font-sans text-[13px]">
          <div className="border-b border-[#30363d] pb-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
              🚀 openbridge-onboarding-hub
            </h1>
            <p className="text-zinc-405 text-xs font-mono mt-1.5">
              Build-Tested Platform: v1.0.0 ● License: MIT ● Language: TypeScript / CSS
            </p>
          </div>

          <p>
            Welcome to the <strong>OpenBridge Developers Onboarding Hub</strong>! This repository
            serves as the official structured preflight sandbox and code translator checklist. It is
            designed to bridge the structural gap for new developers looking to participate in large
            enterprise open-source software (OSS) repositories safely and securely.
          </p>

          <div className="p-4 bg-[#161b22]/60 rounded-lg border border-[#30363d] flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-zinc-300">
              <strong className="block text-amber-400">
                Developer Certificate of Origin (DCO) Signoffs Enforced
              </strong>
              <span>
                To preserve structural integrity under OSI (Open Source Initiative) regulation
                benchmarks, all commits to this fork must specify the{" "}
                <code>Signed-off-by: Your Name &lt;email&gt;</code> footer signature. Our CI runner
                automatically rejects invalid commit chains.
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-mono">
              📋 Core Onboarding Workflows Included:
            </h3>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 list-none">
              <li className="p-3 bg-zinc-950 rounded-lg border border-[#30363d]/60 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="block text-zinc-200">Recommended Match Indices</strong>
                  <span className="text-zinc-450 text-[11px]">
                    Personalized repository match indexing powered by semantic skills profiles.
                  </span>
                </div>
              </li>

              <li className="p-3 bg-zinc-950 rounded-lg border border-[#30363d]/60 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="block text-zinc-200">4-Week Structured Roadmap</strong>
                  <span className="text-zinc-450 text-[11px]">
                    Iterative sandbox milestone targets ensuring stable codebase familiarity.
                  </span>
                </div>
              </li>

              <li className="p-3 bg-zinc-950 rounded-lg border border-[#30363d]/60 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="block text-zinc-200">AI Issue Translator & Mapping</strong>
                  <span className="text-zinc-450 text-[11px]">
                    Exploit state of the art Gemini intelligence to deconstruct complex raw issues.
                  </span>
                </div>
              </li>

              <li className="p-3 bg-[#0e090a] rounded-lg border border-orange-950/20 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#ff7900] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="block text-[#ff7900]">Hacktoberfest Milestone Badge</strong>
                  <span className="text-zinc-450 text-[11px]">
                    Generate embeddable badges for your real GitHub portfolio README profiles.
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <div className="pt-2 border-t border-[#30363d] text-center">
            <p className="text-[11px] text-zinc-500 font-mono">
              Maintained under <strong>OpenBridge Dev Guidelines</strong>. Feel free to clone or
              submit patches!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
