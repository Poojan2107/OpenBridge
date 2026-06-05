import { Router } from "express";

const router = Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";

function parseCookies(cookieHeader: string | undefined): { [key: string]: string } {
  const list: { [key: string]: string } = {};
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach(cookie => {
    const parts = cookie.split("=");
    const name = parts.shift()?.trim() || "";
    const value = decodeURIComponent(parts.join("="));
    if (name) list[name] = value;
  });
  return list;
}

// OAuth config endpoint
router.get("/api/auth/config", (req, res) => {
  res.json({
    hasClientId: !!GITHUB_CLIENT_ID,
    clientId: GITHUB_CLIENT_ID,
  });
});

// GET /api/pr/status?url=... — Check real PR status from GitHub API
router.get("/api/pr/status", async (req, res) => {
  try {
    const prUrl = (req.query.url as string) || "";
    const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i);
    if (!match) {
      return res.status(400).json({ error: "Invalid GitHub PR URL format." });
    }

    const [, owner, repo, prNumber] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "openbridge-mentor-app",
        "Accept": "application/vnd.github.v3+json"
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.json({ status: "not_found", message: "PR not found or repository is private." });
      }
      return res.json({ status: "unknown", message: `GitHub API returned ${response.status}` });
    }

    const data: any = await response.json();

    let status: string;
    if (data.merged) {
      status = "merged";
    } else if (data.draft) {
      status = "draft";
    } else if (data.state === "closed") {
      status = "closed";
    } else {
      status = "open";
    }

    return res.json({
      status,
      title: data.title || "",
      user: data.user?.login || "",
      merged_at: data.merged_at || null,
      created_at: data.created_at || null,
      additions: data.additions || 0,
      deletions: data.deletions || 0,
      changed_files: data.changed_files || 0
    });
  } catch (err) {
    console.error("GET /api/pr/status error:", err);
    return res.status(500).json({ error: "Failed to check PR status." });
  }
});

// Get authorizable direct redirect provider URL
router.get("/api/auth/url", (req, res) => {
  const host = req.headers.host || "localhost:3000";
  const protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const redirectUri = process.env.APP_URL
    ? `${process.env.APP_URL.replace(/\/$/, "")}/auth/callback`
    : `${protocol}://${host}/auth/callback`;

  // Generate secure random state token
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  res.setHeader("Set-Cookie", `ob_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax`);

  if (!GITHUB_CLIENT_ID) {
    return res.json({
      simulated: true,
      url: `/auth/simulated-authorize?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`,
    });
  }

  const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,public_repo&state=${state}`;
  res.json({ simulated: false, url: oauthUrl });
});

// OAuth Callback handler with messaging
router.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
  const { code, state } = req.query;

  const cookies = parseCookies(req.headers.cookie);
  const expectedState = cookies["ob_oauth_state"];

  // Clear state cookie
  res.setHeader("Set-Cookie", "ob_oauth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");

  if (!state || !expectedState || state !== expectedState) {
    return res.status(400).send("Anti-Forgery CSRF Validation Failed. State mismatch.");
  }

  if (!code) {
    return res.status(400).send("Authorization code missing from callback");
  }

  let userSession = null;

  if (code === "simulated_code_openbridge") {
    // Immersive login simulated session
    userSession = {
      login: "guest-committer",
      name: "Guest Committer",
      avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
      bio: "Active Open-Source Contributor transitioning to production engineering systems.",
      html_url: "https://github.com/guest-committer",
      public_repos: 42,
      followers: 128,
      token: "simulated_token_xyz",
      simulated: true
    };
  } else {
    try {
      const host = req.headers.host || "localhost:3000";
      const protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const redirectUri = process.env.APP_URL
        ? `${process.env.APP_URL.replace(/\/$/, "")}/auth/callback`
        : `${protocol}://${host}/auth/callback`;

      // Exchange code for real target GitHub access token
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri
        })
      });

      const tokenJson: any = await tokenResponse.json();

      if (tokenJson.error) {
        throw new Error(tokenJson.error_description || tokenJson.error);
      }

      const accessToken = tokenJson.access_token;

      // Extract details about the authorized GitHub user
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "User-Agent": "openbridge-mentor-app"
        }
      });

      const userJson: any = await userResponse.json();

      userSession = {
        login: userJson.login,
        name: userJson.name || userJson.login,
        avatar_url: userJson.avatar_url,
        bio: userJson.bio || "Open-source developer",
        html_url: userJson.html_url,
        public_repos: userJson.public_repos,
        followers: userJson.followers,
        token: accessToken,
        simulated: false
      };
    } catch (err: any) {
      console.error("Failed to authenticate with real GitHub API: ", err.message);
      return res.status(500).send(`Authentication session exchange failed: ${err.message}`);
    }
  }

  // Send success message to layout and close standard pop-up window
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authorization Successful</title>
        <style>
          body {
            background-color: #0d1117;
            color: #f0f6fc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
          }
          .box {
            text-align: center;
            padding: 24px;
            background-color: #161b22;
            border: 1px solid #30363d;
            border-radius: 8px;
            max-width: 400px;
          }
          .spinner {
            border: 3px solid #30363d;
            border-top: 3px solid #238636;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin: 16px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>Authentication Successful</h2>
          <div class="spinner"></div>
          <p style="color: #8b949e; font-size: 13px;">Transferred session credentials to main workstation. Closing this window...</p>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({ 
              type: "OAUTH_AUTH_SUCCESS",
              user: ${JSON.stringify(userSession)}
            }, window.location.origin);
            window.close();
          } else {
            window.location.href = "/";
          }
        </script>
      </body>
    </html>
  `);
});

// A route to render simulated authorization UI in an elegant popup
router.get("/auth/simulated-authorize", (req, res) => {
  const { redirect_uri, state } = req.query;
  const decodedRedirectUri = decodeURIComponent(redirect_uri as string || "/auth/callback");
  const stateVal = (state as string) || "";

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authorize OpenBridge (Simulated)</title>
        <style>
          body {
            background-color: #0d1117;
            color: #f0f6fc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 32px 16px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            box-sizing: border-box;
          }
          .card {
            background-color: #161b22;
            border: 1px solid #30363d;
            border-radius: 8px;
            width: 100%;
            max-width: 440px;
            padding: 24px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-bottom: 24px;
          }
          .avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 1px solid #30363d;
            background-color: #21262d;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .connector-line {
            height: 2px;
            background-color: #30363d;
            flex-grow: 1;
            max-width: 60px;
            position: relative;
          }
          .connector-line::after {
            content: "✓";
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #0d1117;
            border: 1px solid #30363d;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #238636;
          }
          h3 {
            margin: 0 0 8px 0;
            text-align: center;
            font-size: 16px;
            font-weight: 600;
          }
          .subtitle {
            text-align: center;
            color: #8b949e;
            font-size: 13px;
            margin-bottom: 24px;
          }
          .permissions {
            background-color: #0d1117;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 24px;
          }
          .permission-item {
            display: flex;
            gap: 12px;
            font-size: 13px;
            margin-bottom: 12px;
          }
          .permission-item:last-child {
            margin-bottom: 0;
          }
          .permission-icon {
            color: #2f81f7;
            font-weight: bold;
          }
          .actions {
            display: flex;
            gap: 12px;
          }
          .btn {
            flex: 1;
            padding: 10px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            text-align: center;
            transition: all 0.1s ease;
          }
          .btn-cancel {
            background-color: #21262d;
            border: 1px solid #30363d;
            color: #c9d1d9;
          }
          .btn-cancel:hover {
            background-color: #30363d;
          }
          .btn-auth {
            background-color: #238636;
            border: 1px solid rgba(240,246,252,0.1);
            color: #ffffff;
            font-family: inherit;
          }
          .btn-auth:hover {
            background-color: #2ea44f;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="avatar">
              <svg width="24" height="24" viewBox="0 0 16 16" fill="#f0f6fc"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 01-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 2.69.91 0 .67.01 1.3.01 1.5 0 .21-.15.46-.55.38A8.013 8.013 0 010 8c0-4.42 3.58-8 8-8z"/></svg>
            </div>
            <div class="connector-line"></div>
            <div class="avatar" style="border-color: #2f81f7;">
              <span style="font-weight: bold; font-size: 14px; color: #2f81f7; font-family: monospace;">OB</span>
            </div>
          </div>
          
          <h3>Authorize OpenBridge</h3>
          <div class="subtitle">by <span style="color: #2f81f7;">OpenBridge Sandbox</span> • openbridge-mentor-app</div>
          
          <div class="permissions">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #8b949e; margin-bottom: 12px; letter-spacing: 0.5px;">Requested Permissions</div>
            
            <div class="permission-item">
              <span class="permission-icon">✓</span>
              <div>
                <strong style="color: #f0f6fc; display: block;">Personal user data</strong>
                <span style="color: #8b949e; font-size: 11px;">Read email addresses, full name, profile avatar, and bio summaries.</span>
              </div>
            </div>
            
            <div class="permission-item" style="margin-top: 10px;">
              <span class="permission-icon">✓</span>
              <div>
                <strong style="color: #f0f6fc; display: block;">Repositories</strong>
                <span style="color: #8b949e; font-size: 11px;">Search public repositories, track forks, and view active commit lines.</span>
              </div>
            </div>
          </div>
          
          <div class="actions">
            <button class="btn btn-cancel" onclick="window.close()">Cancel</button>
            <button class="btn btn-auth" onclick="handleAuthorize()">Authorize guest-committer</button>
          </div>
        </div>
        
        <script>
          function handleAuthorize() {
            window.location.href = "${decodedRedirectUri}?code=simulated_code_openbridge&state=${stateVal}";
          }
        </script>
      </body>
    </html>
  `);
});

export default router;
