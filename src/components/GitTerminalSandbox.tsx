import React, { useState, useRef, useEffect } from "react";
import { Terminal, CornerDownLeft, Sparkles, CheckCircle, RefreshCw, ChevronRight, BookOpen, AlertTriangle } from "lucide-react";

interface GitTerminalSandboxProps {
  onSuccess: () => void;
}

interface LogLine {
  text: string;
  type: "input" | "stdout" | "stderr" | "success" | "editor";
}

interface ChallengeInfo {
  id: 1 | 2 | 3;
  title: string;
  badge: string;
  description: string;
  steps: string[];
}

const CHALLENGES: ChallengeInfo[] = [
  {
    id: 1,
    title: "1. Developer Sign-Off (DCO)",
    badge: "DCO Sign-off",
    description: "Certify that you wrote the code you are submitting by signing your commit. Modern repos block unsigned commits.",
    steps: [
      "Type 'git status' to inspect modified files.",
      "Type 'git add .' to stage the files.",
      "Type 'git commit -s -m \"feat: add widgets\"' to commit with a secure DCO signature.",
      "Type 'git push' to submit your commits."
    ]
  },
  {
    id: 2,
    title: "2. Resolve Push Conflicts",
    badge: "Push Conflicts",
    description: "When pushing changes, you might get rejected because someone else pushed first. Learn to pull and resolve conflicts.",
    steps: [
      "Type 'git add .' then commit with sign-off ('git commit -s -m \"feat: edit main\"').",
      "Type 'git push' (observe it get rejected by the remote).",
      "Type 'git pull' to fetch and merge upstream changes (triggers a conflict in src/App.tsx).",
      "Type 'cat src/App.tsx' to view the conflict markers.",
      "Type 'git checkout --ours src/App.tsx' to resolve in favor of your local changes.",
      "Type 'git add src/App.tsx' to stage the resolution.",
      "Type 'git commit -s -m \"merge branch 'main'\"' to commit the merge.",
      "Type 'git push' to complete the challenge."
    ]
  },
  {
    id: 3,
    title: "3. Interactive Rebase (Squash)",
    badge: "Interactive Rebase",
    description: "Keep the git history clean. Squash multiple messy work-in-progress (WIP) commits into a single clean commit before merging.",
    steps: [
      "Type 'git push' (observe it blocked because of multiple WIP commits in history).",
      "Type 'git log' to inspect your messy local commits.",
      "Type 'git rebase -i HEAD~3' to start the interactive rebase editor.",
      "In the editor prompt, type 'squash' (or 's') to combine the last two WIP commits.",
      "Type a clean commit message when prompted (e.g. 'feat: align grid components').",
      "Type 'git push --force' (or '-f') to overwrite the remote history with your squashed commit."
    ]
  }
];

export default function GitTerminalSandbox({ onSuccess }: GitTerminalSandboxProps) {
  const [activeChallenge, setActiveChallenge] = useState<1 | 2 | 3>(1);
  const [completedChallenges, setCompletedChallenges] = useState<{ [key: number]: boolean }>(() => {
    try {
      const saved = localStorage.getItem("ob_completed_challenges");
      return saved ? JSON.parse(saved) : { 1: false, 2: false, 3: false };
    } catch {
      return { 1: false, 2: false, 3: false };
    }
  });

  const [history, setHistory] = useState<LogLine[]>([]);
  const [inputVal, setInputVal] = useState("");
  
  // Simulated Git Workspace state
  const [gitState, setGitState] = useState({
    // Challenge 1 & General
    staged: false,
    committed: false,
    signed: false,
    pushed: false,
    
    // Challenge 2 (Conflicts)
    c2Staged: false,
    c2Committed: false,
    c2PushedInitially: false,
    c2ConflictActive: false,
    c2ConflictResolved: false,
    c2StagedResolved: false,
    c2CommittedMerge: false,
    c2PushedSuccess: false,
    
    // Challenge 3 (Rebase)
    c3PushedInitially: false,
    c3RebaseActive: false,
    c3RebaseSquashed: false,
    c3RebaseCommitted: false,
    c3ForcePushed: false,
    c3CommitMessage: "",
  });

  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem("ob_completed_challenges", JSON.stringify(completedChallenges));
  }, [completedChallenges]);

  // Initial welcome message based on challenge
  useEffect(() => {
    resetChallengeState(activeChallenge, false);
  }, [activeChallenge]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const resetChallengeState = (challengeId: number, userInitiated = true) => {
    setInputVal("");
    const defaultGitState = {
      staged: false,
      committed: false,
      signed: false,
      pushed: false,
      c2Staged: false,
      c2Committed: false,
      c2PushedInitially: false,
      c2ConflictActive: false,
      c2ConflictResolved: false,
      c2StagedResolved: false,
      c2CommittedMerge: false,
      c2PushedSuccess: false,
      c3PushedInitially: false,
      c3RebaseActive: false,
      c3RebaseSquashed: false,
      c3RebaseCommitted: false,
      c3ForcePushed: false,
      c3CommitMessage: "",
    };

    setGitState(defaultGitState);

    let lines: LogLine[] = [];
    if (userInitiated) {
      lines.push({ text: `--- Workspace Reset for Challenge ${challengeId} ---`, type: "stdout" });
    }

    if (challengeId === 1) {
      lines.push(
        { text: "Challenge 1: Developer Sign-Off (DCO) Onboarding", type: "stdout" },
        { text: "Modified files ready in working tree: src/App.tsx, verify-pr.yml", type: "stdout" },
        { text: "Goal: Stage, commit with DCO sign-off (-s flag), and push your work.", type: "stdout" }
      );
    } else if (challengeId === 2) {
      lines.push(
        { text: "Challenge 2: Resolving Push Conflicts", type: "stdout" },
        { text: "Modified file in working tree: src/App.tsx (you have local edits to push, but origin is ahead).", type: "stdout" },
        { text: "Goal: Stage, commit, push, pull remote changes, resolve conflicts, and push successfully.", type: "stdout" }
      );
    } else {
      lines.push(
        { text: "Challenge 3: Interactive Rebase & Squashing", type: "stdout" },
        { text: "You have 3 separate commits locally: 1 feature commit and 2 messy WIP edits.", type: "stdout" },
        { text: "Goal: Squash local history into 1 clean commit using interactive rebase, then force push.", type: "stdout" }
      );
    }
    lines.push({ text: "Type 'help' for guidance. Begin by typing a command.", type: "stdout" });
    setHistory(lines);
  };

  const handleCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    // 1. Hijack input if Interactive Rebase Editor is active
    if (gitState.c3RebaseActive) {
      handleRebaseEditorInput(cmd);
      return;
    }

    const newLines: LogLine[] = [
      { text: `guest-committer@openbridge:~/onboarding-hub$ ${cmd}`, type: "input" }
    ];

    const tokens = cmd.split(/\s+/);
    const primary = tokens[0].toLowerCase();

    if (primary === "clear") {
      setHistory([]);
      setInputVal("");
      return;
    }

    if (primary === "help") {
      newLines.push(
        { text: "Available commands:", type: "stdout" },
        { text: "  git status                      - View modified and staged files", type: "stdout" },
        { text: "  git add .                       - Stage all modified files", type: "stdout" },
        { text: "  git commit -m \"<msg>\"           - Commit changes (local only)", type: "stdout" },
        { text: "  git commit -s -m \"<msg>\"        - Commit changes with DCO sign-off signature", type: "stdout" },
        { text: "  git pull                        - Pull changes from remote origin repository", type: "stdout" },
        { text: "  git push                        - Push commits to remote origin", type: "stdout" },
        { text: "  git log                         - View local commit history log", type: "stdout" },
        { text: "  cat <file>                      - View contents of a file (e.g., cat src/App.tsx)", type: "stdout" },
        { text: "  git checkout --ours <file>      - Resolve conflict choosing local edits", type: "stdout" },
        { text: "  git checkout --theirs <file>    - Resolve conflict choosing remote edits", type: "stdout" },
        { text: "  git rebase -i HEAD~3            - Launch interactive rebase to squash commits", type: "stdout" },
        { text: "  git push --force (or -f)        - Force push to overwrite remote history", type: "stdout" },
        { text: "  clear                           - Clear the terminal screen buffer", type: "stdout" }
      );
      setHistory(prev => [...prev, ...newLines]);
      setInputVal("");
      return;
    }

    if (primary !== "git" && primary !== "cat") {
      newLines.push({ text: `sh: command not found: ${primary}. Type 'help' for supported commands.`, type: "stderr" });
      setHistory(prev => [...prev, ...newLines]);
      setInputVal("");
      return;
    }

    // Handle 'cat' command
    if (primary === "cat") {
      const targetFile = tokens[1];
      if (!targetFile) {
        newLines.push({ text: "cat: missing file parameter.", type: "stderr" });
      } else if (targetFile === "src/App.tsx") {
        if (activeChallenge === 2 && gitState.c2ConflictActive && !gitState.c2ConflictResolved) {
          newLines.push(
            { text: "<<<<<<< HEAD", type: "stderr" },
            { text: "const WelcomeMessage = () => <h1>Welcome to OpenBridge Hub!</h1>;", type: "input" },
            { text: "=======", type: "stderr" },
            { text: "const WelcomeMessage = () => <h1>Welcome, Contributor!</h1>;", type: "stdout" },
            { text: ">>>>>>> origin/main", type: "stderr" }
          );
        } else if (activeChallenge === 2 && gitState.c2ConflictResolved) {
          newLines.push({ text: "const WelcomeMessage = () => <h1>Welcome to OpenBridge Hub!</h1>;", type: "success" });
        } else {
          newLines.push({ text: "const WelcomeMessage = () => <h1>Welcome to OpenBridge Hub!</h1>;", type: "stdout" });
        }
      } else {
        newLines.push({ text: `cat: ${targetFile}: No such file or directory.`, type: "stderr" });
      }
      setHistory(prev => [...prev, ...newLines]);
      setInputVal("");
      return;
    }

    // Git commands routing
    const sub = tokens[1]?.toLowerCase();
    if (!sub) {
      newLines.push({ text: "Error: 'git' requires a subcommand. Type 'help' for available actions.", type: "stderr" });
      setHistory(prev => [...prev, ...newLines]);
      setInputVal("");
      return;
    }

    // ==========================================
    // CHALLENGE 1 LOGIC
    // ==========================================
    if (activeChallenge === 1) {
      if (sub === "status") {
        if (gitState.pushed) {
          newLines.push({ text: "On branch main\nYour branch is up to date with 'origin/main'.\nnothing to commit, working tree clean", type: "stdout" });
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
            { text: "\tmodified:   verify-pr.yml", type: "stderr" }
          );
        }
      } else if (sub === "add") {
        const arg = tokens[2];
        if (arg === "." || arg === "src/App.tsx" || arg === "verify-pr.yml") {
          setGitState(prev => ({ ...prev, staged: true }));
          newLines.push({ text: "Staged 2 files: src/App.tsx, verify-pr.yml", type: "stdout" });
        } else {
          newLines.push({ text: "Error: Run 'git add .' or specify files.", type: "stderr" });
        }
      } else if (sub === "commit") {
        if (!gitState.staged) {
          newLines.push({ text: "Error: Nothing staged to commit. Run 'git add .' first.", type: "stderr" });
        } else if (gitState.committed) {
          newLines.push({ text: "nothing to commit, working tree clean", type: "stdout" });
        } else {
          const hasSignoff = tokens.includes("-s") || tokens.includes("--signoff");
          if (hasSignoff) {
            setGitState(prev => ({ ...prev, committed: true, signed: true }));
            newLines.push(
              { text: "[main 89ad3fb] feat: add widgets to Preflight console", type: "stdout" },
              { text: " 2 files changed, 14 insertions(+), 2 deletions(-)", type: "stdout" },
              { text: " Signed-off-by: Guest Committer <guest-committer@example.com>", type: "success" }
            );
          } else {
            newLines.push(
              { text: "FAIL: Commit blocked by OpenBridge DCO Pre-commit hook!", type: "stderr" },
              { text: "Reason: You must certify your Developer Certificate of Origin (DCO) by adding a sign-off footer to your commit message.", type: "stderr" },
              { text: "Solution: Run 'git commit -s -m \"<message>\"' to auto-sign.", type: "stderr" }
            );
          }
        }
      } else if (sub === "push") {
        if (!gitState.committed) {
          newLines.push({ text: "Error: No local commits to push. Run 'git commit' first.", type: "stderr" });
        } else if (!gitState.signed) {
          newLines.push({ text: "Error: Unsigned commits detected. Rebase or commit with '-s' sign-off.", type: "stderr" });
        } else {
          setGitState(prev => ({ ...prev, pushed: true }));
          setCompletedChallenges(prev => ({ ...prev, 1: true }));
          newLines.push(
            { text: "Pushing to remote origin...", type: "stdout" },
            { text: "To https://github.com/guest-committer/openbridge-onboarding-hub.git", type: "stdout" },
            { text: "   0e9d6b..89ad3fb  main -> main", type: "success" },
            { text: "✓ Remote verification succeeded! Challenge 1 Complete.", type: "success" }
          );
          setTimeout(() => {
            setActiveChallenge(2);
          }, 2000);
        }
      } else {
        newLines.push({ text: `git: subcommand '${sub}' is not supported in Challenge 1.`, type: "stderr" });
      }
    }

    // ==========================================
    // CHALLENGE 2 LOGIC
    // ==========================================
    else if (activeChallenge === 2) {
      if (sub === "status") {
        if (gitState.c2PushedSuccess) {
          newLines.push({ text: "On branch main\nYour branch is up to date with 'origin/main'.\nnothing to commit, working tree clean", type: "stdout" });
        } else if (gitState.c2ConflictActive && !gitState.c2ConflictResolved) {
          newLines.push(
            { text: "On branch main\nYou have unmerged paths.\n  (fix conflicts and run \"git commit\")\n", type: "stdout" },
            { text: "Unmerged paths:\n  (use \"git add <file>...\" to mark resolution)", type: "stdout" },
            { text: "\tboth modified:   src/App.tsx", type: "stderr" }
          );
        } else if (gitState.c2ConflictResolved && !gitState.c2StagedResolved) {
          newLines.push(
            { text: "On branch main\nChanges not staged for commit:\n  (use \"git add <file>...\" to update what will be committed)\n", type: "stdout" },
            { text: "\tmodified:   src/App.tsx", type: "stderr" }
          );
        } else if (gitState.c2StagedResolved && !gitState.c2CommittedMerge) {
          newLines.push(
            { text: "On branch main\nAll conflicts resolved but still merging.\nChanges to be committed:\n", type: "stdout" },
            { text: "\tmodified:   src/App.tsx", type: "success" }
          );
        } else if (gitState.c2CommittedMerge) {
          newLines.push({ text: "On branch main\nYour branch is ahead of 'origin/main' by 2 commits.\n  (use \"git push\" to publish your local commits)", type: "stdout" });
        } else if (gitState.c2Committed) {
          newLines.push({ text: "On branch main\nYour branch is ahead of 'origin/main' by 1 commit.\n  (use \"git push\" to publish your local commits)", type: "stdout" });
        } else if (gitState.c2Staged) {
          newLines.push(
            { text: "On branch main\nChanges to be committed:\n", type: "stdout" },
            { text: "\tmodified:   src/App.tsx", type: "success" }
          );
        } else {
          newLines.push(
            { text: "On branch main\nChanges not staged for commit:\n", type: "stdout" },
            { text: "\tmodified:   src/App.tsx", type: "stderr" }
          );
        }
      } else if (sub === "add") {
        const arg = tokens[2];
        if (arg === "." || arg === "src/App.tsx") {
          if (gitState.c2ConflictResolved) {
            setGitState(prev => ({ ...prev, c2StagedResolved: true }));
            newLines.push({ text: "Staged resolution for src/App.tsx", type: "stdout" });
          } else {
            setGitState(prev => ({ ...prev, c2Staged: true }));
            newLines.push({ text: "Staged changes in src/App.tsx", type: "stdout" });
          }
        } else {
          newLines.push({ text: "Error: Specify file to stage (e.g. 'git add src/App.tsx')", type: "stderr" });
        }
      } else if (sub === "commit") {
        if (gitState.c2ConflictActive && !gitState.c2ConflictResolved) {
          newLines.push({ text: "Error: Cannot commit while conflicts are active. Resolve them first.", type: "stderr" });
        } else if (gitState.c2ConflictResolved && !gitState.c2StagedResolved) {
          newLines.push({ text: "Error: Stage your conflict resolutions before committing.", type: "stderr" });
        } else if (gitState.c2ConflictResolved && gitState.c2StagedResolved) {
          const hasSignoff = tokens.includes("-s") || tokens.includes("--signoff");
          if (hasSignoff) {
            setGitState(prev => ({ ...prev, c2CommittedMerge: true, c2MergeSigned: true }));
            newLines.push(
              { text: "[main f482cda] merge branch 'main' of github.com:owner/repo", type: "stdout" },
              { text: " Signed-off-by: Guest Committer <guest-committer@example.com>", type: "success" }
            );
          } else {
            newLines.push({ text: "Error: Merge commits also require DCO Sign-off. Add the '-s' flag.", type: "stderr" });
          }
        } else {
          // Standard commit
          if (!gitState.c2Staged) {
            newLines.push({ text: "Error: Nothing staged to commit.", type: "stderr" });
          } else {
            const hasSignoff = tokens.includes("-s") || tokens.includes("--signoff");
            setGitState(prev => ({ ...prev, c2Committed: true, signed: hasSignoff }));
            newLines.push(
              { text: "[main adf482c] feat: edit main components", type: "stdout" },
              hasSignoff 
                ? { text: " Signed-off-by: Guest Committer <guest-committer@example.com>", type: "success" }
                : { text: " Warning: Commit missing DCO sign-off signature.", type: "stderr" }
            );
          }
        }
      } else if (sub === "push") {
        if (!gitState.c2Committed) {
          newLines.push({ text: "Error: No commits to push.", type: "stderr" });
        } else if (gitState.c2ConflictActive) {
          newLines.push({ text: "Error: Merge conflict is active. Pulling was successful, resolve conflicts first.", type: "stderr" });
        } else if (gitState.c2ConflictResolved && !gitState.c2CommittedMerge) {
          newLines.push({ text: "Error: Commit the resolved merge before pushing.", type: "stderr" });
        } else if (gitState.c2ConflictResolved && gitState.c2CommittedMerge) {
          setGitState(prev => ({ ...prev, c2PushedSuccess: true }));
          setCompletedChallenges(prev => ({ ...prev, 2: true }));
          newLines.push(
            { text: "Pushing to remote origin...", type: "stdout" },
            { text: "To https://github.com/guest-committer/openbridge-onboarding-hub.git", type: "stdout" },
            { text: "   89ad3fb..f482cda  main -> main", type: "success" },
            { text: "✓ Remote verification succeeded! Conflict resolved. Challenge 2 Complete.", type: "success" }
          );
          setTimeout(() => {
            setActiveChallenge(3);
          }, 2000);
        } else {
          // First push attempt: reject it due to conflict
          setGitState(prev => ({ ...prev, c2PushedInitially: true }));
          newLines.push(
            { text: "To https://github.com/guest-committer/openbridge-onboarding-hub.git", type: "stdout" },
            { text: " ! [rejected]        main -> main (fetch first)", type: "stderr" },
            { text: "error: failed to push some refs to remote repository.", type: "stderr" },
            { text: "hint: Updates were rejected because the remote contains work you do not have locally.\nhint: Run 'git pull' to integrate remote changes before pushing again.", type: "stdout" }
          );
        }
      } else if (sub === "pull") {
        if (!gitState.c2PushedInitially) {
          newLines.push({ text: "Already up-to-date.", type: "stdout" });
        } else if (gitState.c2ConflictActive) {
          newLines.push({ text: "Conflict is already active. Resolve it in src/App.tsx.", type: "stderr" });
        } else {
          setGitState(prev => ({ ...prev, c2ConflictActive: true }));
          newLines.push(
            { text: "From github.com:guest-committer/openbridge-onboarding-hub", type: "stdout" },
            { text: " * branch            main       -> FETCH_HEAD", type: "stdout" },
            { text: "Auto-merging src/App.tsx", type: "stdout" },
            { text: "CONFLICT (content): Merge conflict in src/App.tsx", type: "stderr" },
            { text: "Automatic merge failed; fix conflicts and then commit the result.", type: "stderr" }
          );
        }
      } else if (sub === "checkout") {
        const flag = tokens[2];
        const targetFile = tokens[3];
        if ((flag === "--ours" || flag === "--theirs") && targetFile === "src/App.tsx") {
          if (!gitState.c2ConflictActive) {
            newLines.push({ text: "Error: No merge conflict is active for src/App.tsx.", type: "stderr" });
          } else {
            setGitState(prev => ({ ...prev, c2ConflictResolved: true }));
            newLines.push({ text: `Resolved conflict in src/App.tsx using checkout ${flag}`, type: "success" });
          }
        } else {
          newLines.push({ text: "Error: Invalid checkout usage. Use 'git checkout --ours src/App.tsx'", type: "stderr" });
        }
      } else {
        newLines.push({ text: `git: subcommand '${sub}' is not supported in Challenge 2.`, type: "stderr" });
      }
    }

    // ==========================================
    // CHALLENGE 3 LOGIC
    // ==========================================
    else {
      if (sub === "status") {
        if (gitState.c3ForcePushed) {
          newLines.push({ text: "On branch main\nYour branch is up to date with 'origin/main'.\nnothing to commit, working tree clean", type: "stdout" });
        } else {
          newLines.push({ text: "On branch main\nYour branch is ahead of 'origin/main' by 3 commits.\n  (use \"git push\" to publish your local commits)", type: "stdout" });
        }
      } else if (sub === "log") {
        if (gitState.c3ForcePushed) {
          newLines.push(
            { text: "commit f00ba42 (HEAD -> main, origin/main)", type: "success" },
            { text: `Author: Guest Committer <guest-committer@example.com>\nDate:   Fri Jun 5 19:40:00 2026\n\n    ${gitState.c3CommitMessage || "feat: add console component and fix alignment"}\n`, type: "stdout" }
          );
        } else if (gitState.c3RebaseCommitted) {
          newLines.push(
            { text: "commit f00ba42 (HEAD -> main)", type: "success" },
            { text: `Author: Guest Committer <guest-committer@example.com>\nDate:   Fri Jun 5 19:40:00 2026\n\n    ${gitState.c3CommitMessage}\n`, type: "stdout" }
          );
        } else {
          newLines.push(
            { text: "commit a57b290 (HEAD -> main)", type: "stderr" },
            { text: "Author: Guest Committer <guest-committer@example.com>\nDate:   Fri Jun 5 19:40:00 2026\n\n    wip: fix typo\n", type: "stdout" },
            { text: "commit b19af92", type: "stderr" },
            { text: "Author: Guest Committer <guest-committer@example.com>\nDate:   Fri Jun 5 19:38:00 2026\n\n    wip: fix alignment\n", type: "stdout" },
            { text: "commit 89ad3fb", type: "success" },
            { text: "Author: Guest Committer <guest-committer@example.com>\nDate:   Fri Jun 5 19:35:00 2026\n\n    feat: add console component\n", type: "stdout" }
          );
        }
      } else if (sub === "rebase") {
        const flag = tokens[2];
        const arg = tokens[3];
        if (flag === "-i" && (arg === "HEAD~3" || arg === "main" || arg === "origin/main")) {
          if (gitState.c3RebaseCommitted) {
            newLines.push({ text: "Interactive rebase already complete. Commit history clean.", type: "stdout" });
          } else {
            setGitState(prev => ({ ...prev, c3RebaseActive: true }));
            newLines.push(
              { text: "------------------ REBASE INTERACTIVE EDITOR ------------------", type: "editor" },
              { text: "# Commands:", type: "editor" },
              { text: "#  p, pick   = use commit", type: "editor" },
              { text: "#  s, squash = meld commit into previous commit", type: "editor" },
              { text: "#", type: "editor" },
              { text: "1: pick 89ad3fb feat: add console component", type: "editor" },
              { text: "2: pick b19af92 wip: fix alignment", type: "editor" },
              { text: "3: pick a57b290 wip: fix typo", type: "editor" },
              { text: "---------------------------------------------------------------", type: "editor" },
              { text: "Task: Squash the two WIP commits (2 and 3) into the feature commit (1).", type: "stdout" },
              { text: "Type 'squash' (or 's') to automate, or 'abort' to cancel.", type: "stdout" }
            );
          }
        } else {
          newLines.push({ text: "Error: Interactive rebase requires '-i HEAD~3' (or equivalent).", type: "stderr" });
        }
      } else if (sub === "push") {
        const hasForce = tokens.includes("--force") || tokens.includes("-f");
        if (gitState.c3ForcePushed) {
          newLines.push({ text: "Everything up-to-date", type: "stdout" });
        } else if (!gitState.c3RebaseCommitted) {
          setGitState(prev => ({ ...prev, c3PushedInitially: true }));
          newLines.push(
            { text: "FAIL: Commit history validation rejected by OpenBridge checks!", type: "stderr" },
            { text: "Reason: Found messy work-in-progress (WIP) commits in push history.\nSolution: Run 'git rebase -i HEAD~3' and squash them into 1 clean commit.", type: "stderr" }
          );
        } else {
          if (hasForce) {
            setGitState(prev => ({ ...prev, c3ForcePushed: true }));
            setCompletedChallenges(prev => ({ ...prev, 3: true }));
            newLines.push(
              { text: "Forcing push to origin main (rewriting remote history)...", type: "stdout" },
              { text: "To https://github.com/guest-committer/openbridge-onboarding-hub.git", type: "stdout" },
              { text: " + 89ad3fb...f00ba42 main -> main (forced update)", type: "success" },
              { text: "✓ Remote verification succeeded! History is clean. Challenge 3 Complete.", type: "success" }
            );
            setTimeout(() => {
              onSuccess();
            }, 2000);
          } else {
            newLines.push(
              { text: "To https://github.com/guest-committer/openbridge-onboarding-hub.git", type: "stdout" },
              { text: " ! [rejected]        main -> main (non-fast-forward)", type: "stderr" },
              { text: "error: failed to push some refs to remote repository.", type: "stderr" },
              { text: "hint: Updates were rejected because the remote contains a different history.\nhint: You must force push to rewrite history. Run 'git push --force' or '-f'.", type: "stdout" }
            );
          }
        }
      } else {
        newLines.push({ text: `git: subcommand '${sub}' is not supported in Challenge 3.`, type: "stderr" });
      }
    }

    setHistory(prev => [...prev, ...newLines]);
    setInputVal("");
  };

  const handleRebaseEditorInput = (input: string) => {
    const cleanInput = input.trim().toLowerCase();
    const newLines: LogLine[] = [
      { text: cleanInput, type: "input" }
    ];

    if (cleanInput === "abort") {
      setGitState(prev => ({ ...prev, c3RebaseActive: false }));
      newLines.push({ text: "Rebase aborted. Local history restored.", type: "stdout" });
      setHistory(prev => [...prev, ...newLines]);
      setInputVal("");
      return;
    }

    if (!gitState.c3RebaseSquashed) {
      if (cleanInput === "squash" || cleanInput === "s" || cleanInput.includes("squash") || cleanInput.includes("s ")) {
        setGitState(prev => ({ ...prev, c3RebaseSquashed: true }));
        newLines.push(
          { text: "✔ Commits squashed successfully.", type: "success" },
          { text: "----------------- COMMIT MESSAGE EDITOR -----------------", type: "editor" },
          { text: "# Please enter the commit message for your changes.", type: "editor" },
          { text: "# WIP commit messages have been squashed.", type: "editor" },
          { text: "---------------------------------------------------------", type: "editor" },
          { text: "Enter a clean, descriptive message for your single commit:", type: "stdout" }
        );
      } else {
        newLines.push({ text: "Invalid editor action. Type 'squash' (or 's') to combine, or 'abort'.", type: "stderr" });
      }
    } else {
      // Inputting final commit message
      if (input.length < 5) {
        newLines.push({ text: "Error: Commit message too short. Provide a clear commit description.", type: "stderr" });
      } else {
        setGitState(prev => ({ 
          ...prev, 
          c3RebaseCommitted: true, 
          c3RebaseActive: false,
          c3CommitMessage: input 
        }));
        newLines.push(
          { text: `[main f00ba42] ${input}`, type: "success" },
          { text: " 1 file changed, 25 insertions(+), 8 deletions(-)", type: "stdout" },
          { text: "Successfully rebased and updated refs/heads/main.", type: "success" }
        );
      }
    }

    setHistory(prev => [...prev, ...newLines]);
    setInputVal("");
  };

  return (
    <div className="space-y-4">
      {/* Dynamic Instruction Card */}
      <div className="bg-[#0c0d14]/65 border border-zinc-900 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start select-none">
        <div className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg shrink-0 text-sky-400">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="space-y-2 flex-grow">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-950/40 text-sky-400 border border-sky-900/30 uppercase tracking-wide">
              {CHALLENGES[activeChallenge - 1].badge}
            </span>
            <h4 className="text-xs font-bold text-zinc-200">
              {CHALLENGES[activeChallenge - 1].title}
            </h4>
          </div>
          <p className="text-zinc-500 text-[11px] leading-relaxed">
            {CHALLENGES[activeChallenge - 1].description}
          </p>
          <div className="space-y-1 mt-1 pl-1">
            <span className="text-[9.5px] uppercase font-bold text-zinc-400 font-mono tracking-wider block">Required Steps:</span>
            {CHALLENGES[activeChallenge - 1].steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[10.5px] text-zinc-500 font-mono leading-relaxed">
                <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-zinc-700" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-zinc-909 bg-black rounded-lg overflow-hidden flex flex-col h-[320px]">
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#0f0f15] border-b border-zinc-900 select-none shrink-0">
          
          {/* Challenge Tabs */}
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setActiveChallenge(num as 1 | 2 | 3)}
                  className={`text-[9.5px] font-mono px-2 py-0.5 rounded border transition-all cursor-pointer ${
                    activeChallenge === num
                      ? "bg-zinc-800 text-white border-zinc-700 font-bold"
                      : completedChallenges[num]
                        ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30 hover:bg-emerald-900/20"
                        : "bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-350"
                  }`}
                >
                  L0{num} {completedChallenges[num] && "✓"}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => resetChallengeState(activeChallenge, true)}
            className="text-[9.5px] font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 cursor-pointer bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Level
          </button>
        </div>

        {/* Terminal Content Buffer */}
        <div className="flex-grow p-3 overflow-y-auto font-mono text-[10.5px] leading-relaxed space-y-1.5 bg-black select-text">
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
                      : line.type === "editor"
                        ? "text-amber-300 font-semibold"
                        : "text-zinc-400"
              }
            >
              {line.type === "input" ? "guest-committer@openbridge:~$ " : ""}
              {line.text}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Input Bar */}
        <div className="p-2.5 bg-[#0a0a0f] border-t border-zinc-900 flex items-center gap-2 select-none shrink-0 font-mono text-[11px]">
          <span className="text-zinc-500 shrink-0 select-none">
            {gitState.c3RebaseActive ? "[REBASE EDITOR]" : "guest-committer@openbridge:~$"}
          </span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCommand(inputVal);
              }
            }}
            placeholder={
              gitState.c3RebaseActive
                ? gitState.c3RebaseSquashed
                  ? "Enter clean commit message..."
                  : "Type 'squash' to combine..."
                : "Type git command (e.g. git status)..."
            }
            className="flex-grow bg-transparent text-zinc-100 border-none outline-none placeholder-zinc-700 font-mono text-[10.5px]"
          />
          <CornerDownLeft className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
        </div>
      </div>
    </div>
  );
}
