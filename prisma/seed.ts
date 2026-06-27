import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoUser = {
  email: "guest@openbridge.dev",
  name: "Guest Committer",
  githubId: "guest-committer",
  githubLogin: "guest-committer",
  avatarUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
  accessToken: "not-a-real-token",
};

const demoProfile = {
  skills: JSON.stringify(["React", "TypeScript", "Node.js", "Git/GitHub"]),
  level: "Beginner",
  interest: "Frontend",
  repos: JSON.stringify([
    {
      name: "facebook/react",
      description:
        "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
      url: "https://github.com/facebook/react",
      stars: 233000,
      language: "JavaScript",
      matchReason: "good first issues section excellent for beginners",
    },
    {
      name: "tailwindlabs/tailwindcss",
      description: "A utility-first CSS framework for rapid UI development.",
      url: "https://github.com/tailwindlabs/tailwindcss",
      stars: 85000,
      language: "TypeScript",
      matchReason: "beginner-friendly tags and great documentation",
    },
    {
      name: "vercel/next.js",
      description: "The React framework for production.",
      url: "https://github.com/vercel/next.js",
      stars: 130000,
      language: "TypeScript",
      matchReason: "large community with curated good first issues",
    },
  ]),
};

const demoRoadmap = {
  weeks: [
    {
      weekNumber: 1,
      tasks: [
        "Read the project's CONTRIBUTING.md",
        "Set up the project locally",
        "Run the test suite",
        "Find 3 issues labeled 'good first issue'",
        "Introduce yourself in the project's discussion board",
      ],
    },
    {
      weekNumber: 2,
      tasks: ["Comment on an open issue expressing interest", "Understand the codebase structure"],
    },
  ],
};

async function seed() {
  const user = await prisma.user.upsert({
    where: { githubId: demoUser.githubId },
    update: {},
    create: demoUser,
  });

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      ...demoProfile,
    },
  });

  const existingRoadmap = await prisma.roadmap.findUnique({
    where: { profileId: profile.id },
  });

  if (!existingRoadmap) {
    const roadmap = await prisma.roadmap.create({
      data: { profileId: profile.id },
    });

    for (const weekData of demoRoadmap.weeks) {
      const week = await prisma.roadmapWeek.create({
        data: {
          roadmapId: roadmap.id,
          weekNumber: weekData.weekNumber,
          tasks: {
            create: weekData.tasks.map((taskText) => ({ taskText })),
          },
        },
      });
    }
  }

  console.log("Seed completed successfully");
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
