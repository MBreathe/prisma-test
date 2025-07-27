import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();

async function main(query?: string) {
  const posts = await prisma.post.findMany({
    where: {
      title: {
        contains: query ? query : "",
        mode: "insensitive",
      },
    },
  });

  console.log(posts.length);
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
