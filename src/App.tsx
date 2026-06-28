import { useState, useEffect, useCallback } from "react";
import GithubLandingPage from "./components/GithubLandingPage";
import AppLayout from "./components/AppLayout";
import type { ToastNotification } from "./components/NotificationToast";
import { useSSE } from "./hooks/useSSE";
import { recordActivity } from "./components/StreakHeatmap";
import type {
  UserProfile,
  RepositorySuggestion,
  PersonalizedRoadmap,
  IssueTranslation,
  GitHubUser,
  TabType,
} from "./types";

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const s = localStorage.getItem("ob_profile");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [activityRefresh, setActivityRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const s = localStorage.getItem("ob_active_tab");
      if (s) return s as TabType;
    } catch {}
    return "dashboard";
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showExporter, setShowExporter] = useState(false);

  const [githubUser, setGithubUser] = useState<GitHubUser | null>(() => {
    try {
      const s = localStorage.getItem("ob_github_user");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const [stars, setStars] = useState(() => {
    const s = localStorage.getItem("ob_stars");
    return s ? parseInt(s, 10) : 412;
  });
  const [starred, setStarred] = useState(() => localStorage.getItem("ob_starred") === "true");
  const [watches, setWatches] = useState(() => {
    const s = localStorage.getItem("ob_watches");
    return s ? parseInt(s, 10) : 18;
  });
  const [watched, setWatched] = useState(() => localStorage.getItem("ob_watched") === "true");
  const [forks, setForks] = useState(() => {
    const s = localStorage.getItem("ob_forks");
    return s ? parseInt(s, 10) : 89;
  });
  const [forked, setForked] = useState(() => localStorage.getItem("ob_forked") === "true");

  const [repos, setRepos] = useState<RepositorySuggestion[]>(() => {
    try {
      const s = localStorage.getItem("ob_repos");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [roadmap, setRoadmap] = useState<PersonalizedRoadmap | null>(() => {
    try {
      const s = localStorage.getItem("ob_roadmap");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [checkedRoadmapTasks, setCheckedRoadmapTasks] = useState<Record<string, boolean>>(() => {
    try {
      const s = localStorage.getItem("ob_checked_roadmap_tasks");
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  });
  const [pullRequests, setPullRequests] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem("ob_profile", JSON.stringify(profile));
    } else {
      localStorage.removeItem("ob_profile");
    }
  }, [profile]);
  useEffect(() => {
    localStorage.setItem("ob_active_tab", activeTab);
  }, [activeTab]);
  useEffect(() => {
    localStorage.setItem("ob_stars", stars.toString());
  }, [stars]);
  useEffect(() => {
    localStorage.setItem("ob_starred", starred ? "true" : "false");
  }, [starred]);
  useEffect(() => {
    localStorage.setItem("ob_watches", watches.toString());
  }, [watches]);
  useEffect(() => {
    localStorage.setItem("ob_watched", watched ? "true" : "false");
  }, [watched]);
  useEffect(() => {
    localStorage.setItem("ob_forks", forks.toString());
  }, [forks]);
  useEffect(() => {
    localStorage.setItem("ob_forked", forked ? "true" : "false");
  }, [forked]);
  useEffect(() => {
    localStorage.setItem("ob_repos", JSON.stringify(repos));
  }, [repos]);
  useEffect(() => {
    if (roadmap) {
      localStorage.setItem("ob_roadmap", JSON.stringify(roadmap));
    } else {
      localStorage.removeItem("ob_roadmap");
    }
  }, [roadmap]);
  useEffect(() => {
    localStorage.setItem("ob_checked_roadmap_tasks", JSON.stringify(checkedRoadmapTasks));
  }, [checkedRoadmapTasks]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (
        !origin.endsWith(".run.app") &&
        !origin.includes("localhost") &&
        !origin.includes("127.0.0.1") &&
        !origin.includes("0.0.0.0")
      )
        return;
      if (event.data?.type === "OAUTH_AUTH_SUCCESS" && event.data?.user) {
        const user = event.data.user;
        setGithubUser(user);
        localStorage.setItem("ob_github_user", JSON.stringify(user));
        if (!profile) {
          const matchedSkills =
            user.login === "guest-committer"
              ? ["React", "TypeScript", "Node.js", "Git/GitHub"]
              : ["JavaScript", "Git/GitHub"];
          const autoProfile: UserProfile = {
            skills: matchedSkills,
            level: "Beginner",
            interest: "Frontend",
          };
          handleSubmitProfile(autoProfile);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [profile]);

  useEffect(() => {
    if (githubUser) {
      const syncUserData = async () => {
        try {
          const res = await fetch(`/api/user/${githubUser.login}`);
          if (res.ok) {
            const data = await res.json();
            if (data.profile) setProfile(data.profile);
            if (data.repos?.length) setRepos(data.repos);
            if (data.roadmap) setRoadmap(data.roadmap);
            if (data.checkedRoadmapTasks) setCheckedRoadmapTasks(data.checkedRoadmapTasks);
            if (data.pullRequests) setPullRequests(data.pullRequests);
          }
        } catch (err) {
          console.error("Failed to sync user data:", err);
        }
      };
      syncUserData();
    }
  }, [githubUser]);

  const handleSSEEvent = useCallback(
    (event: { type: string; payload: Record<string, unknown> }) => {
      if (event.type === "PR_UPDATE") {
        const { login, title, status, repoFullName } = event.payload as Record<string, string>;
        const statusLabels: Record<string, string> = {
          MERGED: "PR Merged \u{1F389}",
          PENDING: "PR Opened",
          VERIFYING: "PR Under Review",
          FAILED: "PR Closed",
        };
        setNotifications((prev) =>
          [
            {
              id: `${Date.now()}-${Math.random()}`,
              type: "PR_UPDATE",
              title: statusLabels[status] || "PR Update",
              message: `${login} \u00B7 ${repoFullName} \u2014 "${title}"`,
              timestamp: new Date(),
              status,
            } as ToastNotification,
            ...prev,
          ].slice(0, 5),
        );
        setUnreadCount((c) => c + 1);
      }
    },
    [],
  );
  useSSE(handleSSEEvent);

  const dismissNotification = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const handleConnectGithub = async () => {
    try {
      const res = await fetch("/api/auth/url");
      if (!res.ok) throw new Error("Could not request auth URL");
      const { url } = await res.json();
      window.open(
        url,
        "github_login_popup",
        `width=500,height=660,top=${window.screen.height / 2 - 330},left=${window.screen.width / 2 - 250},status=no,resizable=yes`,
      );
    } catch (err) {
      console.error("GitHub Auth failed:", err);
    }
  };

  const handleConnectGuest = () => {
    const guestUser: GitHubUser = {
      login: "guest-committer",
      name: "Guest Committer",
      avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
      bio: "Active Open-Source React & TypeScript developer.",
      html_url: "https://github.com/guest-committer",
      public_repos: 42,
      followers: 128,
      simulated: true,
    };
    setGithubUser(guestUser);
    localStorage.setItem("ob_github_user", JSON.stringify(guestUser));
  };

  const handleDisconnectGithub = () => {
    setGithubUser(null);
    localStorage.removeItem("ob_github_user");
  };

  const handleToggleRoadmapTask = async (week: string, index: number) => {
    const key = `${week}-${index}`;
    const isCompletedNow = !checkedRoadmapTasks[key];
    setCheckedRoadmapTasks((prev) => ({ ...prev, [key]: isCompletedNow }));
    if (isCompletedNow) {
      recordActivity();
      setActivityRefresh((p) => p + 1);
    }
    if (githubUser && roadmap) {
      const weekTasks = roadmap[week as keyof PersonalizedRoadmap];
      if (weekTasks?.[index]) {
        try {
          await fetch("/api/roadmap/task/toggle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              login: githubUser.login,
              taskText: weekTasks[index],
              isCompleted: isCompletedNow,
            }),
          });
        } catch (err) {
          console.error("Failed to sync task:", err);
        }
      }
    }
  };

  const handleOnboardPreset = async () => {
    await handleSubmitProfile({
      skills: ["React", "TypeScript", "Tailwind CSS"],
      level: "Beginner",
      interest: "Frontend",
    });
  };

  const handleSubmitProfile = async (newProfile: UserProfile) => {
    setLoading(true);
    setApiError(null);
    setProfile(newProfile);
    try {
      const [recsRes, roadmapRes] = await Promise.all([
        fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skills: newProfile.skills,
            level: newProfile.level,
            interest: newProfile.interest,
            githubUser,
          }),
        }),
        fetch("/api/roadmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skills: newProfile.skills, level: newProfile.level, githubUser }),
        }),
      ]);
      if (recsRes.ok && roadmapRes.ok) {
        setRepos((await recsRes.json()).repos || []);
        setRoadmap(await roadmapRes.json());
      } else {
        setApiError("Failed to fetch recommendations.");
      }
    } catch (err) {
      setApiError("Network error. Check backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateIssue = async (issueText: string): Promise<IssueTranslation | null> => {
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issue: issueText }),
      });
      return res.ok ? await res.json() : null;
    } catch {
      return null;
    }
  };

  const handleResetProfile = async () => {
    if (githubUser) {
      try {
        await fetch(`/api/user/${githubUser.login}/reset`, { method: "POST" });
      } catch {}
    }
    setProfile(null);
    setRepos([]);
    setRoadmap(null);
    setCheckedRoadmapTasks({});
    setActiveTab("dashboard");
    [
      "ob_profile",
      "ob_repos",
      "ob_roadmap",
      "ob_checked_roadmap_tasks",
      "ob_submitted_prs",
      "ob_pr_comments",
      "ob_gpg_username",
      "ob_gpg_email",
      "ob_gpg_key",
      "ob_quiz_answers",
      "ob_quiz_submitted",
      "ob_quiz_score",
      "ob_system_checks",
      "ob_active_tab",
    ].forEach((k) => localStorage.removeItem(k));
  };

  if (!profile) {
    return (
      <GithubLandingPage
        githubUser={githubUser}
        onConnectGithub={handleConnectGithub}
        onConnectGuest={handleConnectGuest}
        onDisconnectGithub={handleDisconnectGithub}
        onSubmitProfile={handleSubmitProfile}
        isLoading={loading}
      />
    );
  }

  return (
    <AppLayout
      githubUser={githubUser}
      profile={profile}
      repos={repos}
      roadmap={roadmap}
      checkedRoadmapTasks={checkedRoadmapTasks}
      loading={loading}
      apiError={apiError}
      activeTab={activeTab}
      stars={stars}
      starred={starred}
      watches={watches}
      watched={watched}
      forks={forks}
      forked={forked}
      notifications={notifications}
      unreadCount={unreadCount}
      showExporter={showExporter}
      activityRefresh={activityRefresh}
      pullRequests={pullRequests}
      onTabChange={setActiveTab}
      onSetUnreadCount={setUnreadCount}
      onExporterToggle={setShowExporter}
      onSetStars={setStars}
      onSetStarred={setStarred}
      onSetWatches={setWatches}
      onSetWatched={setWatched}
      onSetForks={setForks}
      onSetForked={setForked}
      onToggleTask={handleToggleRoadmapTask}
      onTranslateIssue={handleTranslateIssue}
      onResetProfile={handleResetProfile}
      onDismissNotification={dismissNotification}
      onConnectGithub={handleConnectGithub}
      onDisconnectGithub={handleDisconnectGithub}
      onSetApiError={setApiError}
    />
  );
}
