import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { title: "Web Applications", slug: "web-applications" },
    { title: "Mobile Applications", slug: "mobile-applications" },
    { title: "Desktop Applications", slug: "desktop-applications" },
    { title: "Developer Tools & CLI", slug: "developer-tools-cli" },
    { title: "Games & Interactive", slug: "games-interactive" },
    { title: "AI & Machine Learning", slug: "ai-machine-learning" },
    { title: "Data & Analytics", slug: "data-analytics" },
    { title: "DevOps & Cloud Infra", slug: "devops-cloud-infra" },
    { title: "Embedded & IoT", slug: "embedded-iot" },
    { title: "Cybersecurity", slug: "cybersecurity" },
    { title: "AR/VR & 3D Graphics", slug: "ar-vr-3d-graphics" },
    { title: "Blockchain & Web3", slug: "blockchain-web3" },
    { title: "UI/UX & Design Systems", slug: "ui-ux-design-systems" }
  ];

  console.log("Start seeding...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        title: category.title,
        slug: category.slug,
        // id is omitted because @default(ulid()) handles it in the DB
      },
    });
  }

  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
