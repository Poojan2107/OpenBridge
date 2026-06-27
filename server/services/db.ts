import { prisma } from "../../src/db";
import { encrypt } from "./encryption";

export async function saveUserProfile(
  githubUser: any,
  skills: string[],
  level: string,
  interest: string,
  repos: any,
) {
  try {
    const encryptedToken = encrypt(githubUser.token || "simulated_token");
    const user = await prisma.user.upsert({
      where: { githubId: githubUser.id ? githubUser.id.toString() : `sim_${githubUser.login}` },
      update: {
        name: githubUser.name || githubUser.login,
        avatarUrl: githubUser.avatar_url,
        accessToken: encryptedToken,
      },
      create: {
        githubId: githubUser.id ? githubUser.id.toString() : `sim_${githubUser.login}`,
        githubLogin: githubUser.login,
        email: githubUser.email || `${githubUser.login}@example.com`,
        name: githubUser.name || githubUser.login,
        avatarUrl: githubUser.avatar_url,
        accessToken: encryptedToken,
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        skills: JSON.stringify(skills),
        level,
        interest,
        repos: repos as any,
      },
      create: {
        userId: user.id,
        skills: JSON.stringify(skills),
        level,
        interest,
        repos: repos as any,
      },
    });
    return user;
  } catch (dbErr) {
    console.error("Failed to save profile in database:", dbErr);
    throw dbErr;
  }
}

export async function saveUserRoadmap(githubUser: any, roadmapData: any) {
  try {
    const user = await prisma.user.findUnique({
      where: { githubId: githubUser.id ? githubUser.id.toString() : `sim_${githubUser.login}` },
      include: { profile: true },
    });

    if (user && user.profile) {
      // Delete any existing roadmap to overwrite it cleanly
      const existingRoadmap = await prisma.roadmap.findUnique({
        where: { profileId: user.profile.id },
      });
      if (existingRoadmap) {
        await prisma.roadmap.delete({ where: { id: existingRoadmap.id } });
      }

      // Create new Roadmap with Weeks and Tasks
      await prisma.roadmap.create({
        data: {
          profileId: user.profile.id,
          weeks: {
            create: [
              {
                weekNumber: 1,
                tasks: {
                  create: (roadmapData.week1 || []).map((t: string) => ({
                    taskText: t,
                    isCompleted: false,
                  })),
                },
              },
              {
                weekNumber: 2,
                tasks: {
                  create: (roadmapData.week2 || []).map((t: string) => ({
                    taskText: t,
                    isCompleted: false,
                  })),
                },
              },
              {
                weekNumber: 3,
                tasks: {
                  create: (roadmapData.week3 || []).map((t: string) => ({
                    taskText: t,
                    isCompleted: false,
                  })),
                },
              },
              {
                weekNumber: 4,
                tasks: {
                  create: (roadmapData.week4 || []).map((t: string) => ({
                    taskText: t,
                    isCompleted: false,
                  })),
                },
              },
            ],
          },
        },
      });
    }
  } catch (dbErr) {
    console.error("Failed to save roadmap in database:", dbErr);
    throw dbErr;
  }
}
