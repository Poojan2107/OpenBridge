import React, { useState, useRef, useEffect } from "react";
import { Terminal, CornerDownLeft, Sparkles, CheckCircle, RefreshCw } from "lucide-react";

interface GitTerminalSandboxProps {
  onSuccess: () => void;
}

interface LogLine {
  text: string;
  type: "input" | "stdout" | "stderr" | "success";
}

export default function GitTerminalSandbox({ onSuccess }: GitTerminalSandboxProps) {
  const [history, setHistory] = useState<LogLine[]>([
    { text: "OpenBridge Git Simulator v1.0.0", type: "stdout" },
    { text: "Type 'help' to view available commands. Complete the workflow (status -> add -> commit -s -> push) to verify your Git hygiene.", type: "stdout" },
    { text: "", type: "stdout" }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [gitState, setGitState] = useState<{
    staged: boolean;
    committed: boolean;
    signed: boolean;
    pushed: boolean;
  }>({
    staged: false,
    committed: false,
    signed: false,
    pushed: false
  });

  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    const newLines: LogLine[] = [
      { text: `guest-committer@openbridge:~/onboarding-hub$ ${cmd}`, type: "input" }
    ];

    const tokens = cmd.split(/\s+/);
    const primary = tokens[0].toLowerCase();

    if (primary === "clear") {
      setHistory([]);
      setInputVal("");
      return;
    } else if (primary === "help") {
      newLines.push(
        { text: "Supported Commands:", type: "stdout" },
        { text: "  git status               - Check current state of working directory", type: "stdout" },
        { text: "  git add .                - Stage modified files for commit", type: "stdout" },
        { text: "  git commit -m \"<msg>\"    - Commit changes locally", type: "stdout" },
        { text: "  git commit -s -m \"<msg>\" - Commit changes with secure DCO sign-off footer", type: "stdout" },
        { text: "  git push                 - Push local commits to remote origin repository", type: "stdout" },
        { text: "  clear                    - Clear the screen buffer", type: "stdout" }
      );
    } else if (primary === "git") {
      const sub = tokens[1]?.toLowerCase();
      if (!sub) {
        newLines.push({ text: "Error: 'git' requires a subcommand. Type 'help' for options.", type: "stderr" });
      } else if (sub === "status") {
        if (gitState.pushed) {
          newLines.push({ text: "On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean", type: "stdout" });
        } else if (gitState.committed) {
          newLines.push({ text: "On branch main\nYour branch is ahead of 'origin/main' by 1 commit.\n  (use \"git push\" to publish your local commits)", type: "stdout" });
        } else if (gitState.staged) {
          newLines.push(
            { text: "On branch main\nChanges to be committed:\n  (use \"git restore --staged <file>...\" to unstage)\n", type: "stdout" },
            { text: "\tmodified:   src/App.tsx", type: "success" },
            { text: "\tmodified:   verify-pr.yml", type: "success" }
          );
        } else {
          newLines.push(
            { text: "On branch main\nChanges not staged for commit:\n  (use \"git add <file>...\" to update what will be committed)\n", type: "stdout" },
            { text: "\tmodified:   src/App.tsx", type: "stderr" },
            { text: "\tmodified:   verify-pr.yml", type: "stderr" },
            { text: "\nno changes added to commit (use \"git add\" and/or \"git commit -a\")", type: "stdout" }
          );
        }
      } else if (sub === "add") {
        const arg = tokens[2];
        if (arg === "." || arg === "src/App.tsx" || arg === "verify-pr.yml") {
          setGitState(prev => ({ ...prev, staged: true }));
          newLines.push({ text: "Staged changes in: src/App.tsx, verify-pr.yml", type: "stdout" });
        } else {
          newLines.push({ text: "Error: Specify files to stage (e.g. 'git add .' or 'git add src/App.tsx')", type: "stderr" });
        }
      } else if (sub === "commit") {
        if (!gitState.staged) {
          newLines.push({ text: "Error: Nothing staged to commit. Run 'git add .' first.", type: "stderr" });
        } else if (gitState.committed) {
          newLines.push({ text: "On branch main\nnothing to commit, working tree clean", type: "stdout" });
        } else {
          // Check for sign-off flag: -s or --signoff
          const hasSignoff = tokens.includes("-s") || tokens.includes("--signoff");
          if (hasSignoff) {
            setGitState(prev => ({ ...prev, committed: true, signed: true }));
            newLines.push(
              { text: "[main 89ad3fb] feat: verify-pr pipelines and signoffs", type: "stdout" },
              { text: " 2 files changed, 14 insertions(+), 2 deletions(-)", type: "stdout" },
              { text: " Signed-off-by: Guest Committer <guest-committer@example.com>", type: "success" }
            );
          } else {
            newLines.push(
              { text: "FAIL: Commit blocked by OpenBridge DCO Pre-commit hook!", type: "stderr" },
              { text: "Reason: You must certify your Developer Certificate of Origin (DCO) by adding a sign-off footer to your commit message.", type: "stderr" },
              { text: "Solution: Run 'git commit -s -m \"<message>\"' to auto-append 'Signed-off-by: Your Name <email>'.", type: "stderr" }
            );
          }
        }
      } else if (sub === "push") {
        if (!gitState.committed) {
          newLines.push({ text: "Error: No local commits to push. Run 'git commit' first.", type: "stderr" });
        } else if (!gitState.signed) {
          newLines.push({ text: "Error: Unsigned commits detected. Rebase or commit with '-s' sign-off.", type: "stderr" });
        } else if (gitState.pushed) {
          newLines.push({ text: "Everything up-to-date", type: "stdout" });
        } else {
          setGitState(prev => ({ ...prev, pushed: true }));
          newLines.push(
            { text: "Enumerating objects: 7, done.", type: "stdout" },
            { text: "Counting objects: 100% (7/7), done.", type: "stdout" },
            { text: "Delta compression using up to 8 threads", type: "stdout" },
            { text: "Compressing objects: 100% (4/4), done.", type: "stdout" },
            { text: "Writing objects: 100% (4/4), 452 bytes | 452.00 KiB/s, done.", type: "stdout" },
            { text: "To https://github.com/guest-committer/openbridge-onboarding-hub.git", type: "stdout" },
            { text: "   0e9d6b..89ad3fb  main -> main", type: "success" },
            { text: "✓ Remote verification succeeded! Local DCO compliance check PASSED.", type: "success" }
          );
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      } else {
        newLines.push({ text: `git: '${sub}' is not a recognized git command. Type 'help' for details.`, type: "stderr" });
      }
    } else {
      newLines.push({ text: `sh: command not found: ${primary}. Type 'help' for options.`, type: "stderr" });
    }

    setHistory(prev => [...prev, ...newLines]);
    setInputVal("");
  };

  const handleReset = () => {
    setGitState({ staged: false, committed: false, signed: false, pushed: false });
    setHistory([
      { text: "Terminal restarted. Workspace modifications reloaded.", type: "stdout" },
      { text: "Type 'help' to view available commands.", type: "stdout" },
      { text: "", type: "stdout" }
    ]);
  };

  return (
    <div className="border border-zinc-900 bg-black rounded-lg overflow-hidden flex flex-col h-[280px]">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0f0f15] border-b border-zinc-900 select-none">
        <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px]">
          <Terminal className="w-3.5 h-3.5 text-zinc-400" />
          <span>openbridge-git-sandbox</span>
        </div>
        <button
          onClick={handleReset}
          className="text-[9px] font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-900"
        >
          <RefreshCw className="w-2.5 h-2.5" />
          Reset Workspace
        </button>
      </div>

      {/* Terminal Content Buffer */}
      <div className="flex-grow p-3 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1.5 bg-black select-text">
        {history.map((line, idx) => (
          <div
            key={idx}
            className={
              line.type === "input"
                ? "text-zinc-200"
                : line.type === "stderr"
                  ? "text-rose-400"
                  : line.type === "success"
                    ? "text-emerald-400"
                    : "text-zinc-400"
            }
          >
            {line.text}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Input Bar */}
      <div className="p-2 bg-[#0a0a0f] border-t border-zinc-900 flex items-center gap-1.5 select-none shrink-0 font-mono text-[11px]">
        <span className="text-zinc-500 shrink-0 select-none">guest-committer@openbridge:~$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCommand(inputVal);
            }
          }}
          placeholder="git status..."
          className="flex-grow bg-transparent text-zinc-100 border-none outline-none placeholder-zinc-700 font-mono text-[11px]"
        />
        <CornerDownLeft className="w-3 h-3 text-zinc-650 shrink-0" />
      </div>
    </div>
  );
}
