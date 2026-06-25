// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingNav } from "../LandingNav";

describe("LandingNav", () => {
  it("renders Start Demo button", () => {
    render(
      <LandingNav
        githubUser={null}
        onConnectGuest={() => {}}
        onConnectGithub={() => {}}
        onDisconnectGithub={() => {}}
        handleScrollToId={() => {}}
      />
    );

    const button = screen.getByRole("button", { name: /start demo/i });
    expect(button).toBeDefined();
    expect(button.textContent).toContain("Start Demo");
  });

  it("renders Sign In button when not logged in", () => {
    render(
      <LandingNav
        githubUser={null}
        onConnectGuest={() => {}}
        onConnectGithub={() => {}}
        onDisconnectGithub={() => {}}
        handleScrollToId={() => {}}
      />
    );

    const signIn = screen.getByRole("button", { name: /sign in/i });
    expect(signIn).toBeDefined();
  });
});
