import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { title: "Web Development", slug: "web-development" },
    { title: "Mobile Apps", slug: "mobile-apps" },
    { title: "Machine Learning", slug: "machine-learning" },
    { title: "UI/UX Design", slug: "ui-ux-design" },
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
