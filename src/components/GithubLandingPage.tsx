import { UserProfile, GitHubUser } from "../types";
import {
  LandingNav,
  HeroSection,
  ProblemsSection,
  SolutionSection,
  ProgramsSection,
  ContributionGraph,
  GatedWorkstation,
  LandingFooter,
} from "./landing";

interface GithubLandingPageProps {
  githubUser: GitHubUser | null;
  onConnectGithub: () => void;
  onConnectGuest?: () => void;
  onDisconnectGithub: () => void;
  onOnboardPreset: () => void;
  onSubmitProfile: (profile: UserProfile) => void;
  isLoading: boolean;
}

export default function GithubLandingPage({
  githubUser,
  onConnectGithub,
  onConnectGuest: rawOnConnectGuest,
  onDisconnectGithub,
  onOnboardPreset,
  onSubmitProfile,
  isLoading,
}: GithubLandingPageProps) {
  const onConnectGuest = rawOnConnectGuest || (() => {});

  const handleScrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#F0F6FC] font-sans antialiased overflow-x-hidden selection:bg-[#2F81F7]/30 selection:text-[#F0F6FC]">
      <LandingNav
        githubUser={githubUser}
        onConnectGuest={onConnectGuest}
        onConnectGithub={onConnectGithub}
        onDisconnectGithub={onDisconnectGithub}
        handleScrollToId={handleScrollToId}
      />
      <HeroSection onConnectGuest={onConnectGuest} />
      <ProblemsSection />
      <SolutionSection />
      <ProgramsSection />
      <ContributionGraph />
      <GatedWorkstation
        githubUser={githubUser}
        onConnectGithub={onConnectGithub}
        onConnectGuest={onConnectGuest}
        onDisconnectGithub={onDisconnectGithub}
        onSubmitProfile={onSubmitProfile}
        isLoading={isLoading}
      />
      <LandingFooter />
    </div>
  );
}
