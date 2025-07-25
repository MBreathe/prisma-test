import { PrismaClient } from "./generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient().$extends(withAccelerate());

async function main() {
  for (let i = 0; i < 100; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.username({
      firstName: firstName,
      lastName: lastName,
    });
    const email = username + "@gmail.com";

    const user = await prisma.user.create({
      data: {
        username: username,
        email: email,
        firstName: firstName,
        lastName: lastName,
        avatarURL: faker.image.avatar(),
        bio: faker.lorem.paragraph({ min: 1, max: 5 }),
        createdAt: faker.date.recent({ days: 30 }),
      },
    });
  }
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
