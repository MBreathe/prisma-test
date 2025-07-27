import { $Enums, PrismaClient } from "./generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import { faker } from "@faker-js/faker";
import PostStatus = $Enums.PostStatus;

const prisma = new PrismaClient().$extends(withAccelerate());

async function main() {
  // clearing existing data
  await prisma.$transaction([
    prisma.like.deleteMany(),
    prisma.post.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("Creating users and profiles...");
  const users = [];

  for (let i = 0; i < 50; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.username({ firstName, lastName });
    const email = username + "@gmail.com";

    const user = await prisma.user.create({
      data: {
        username,
        email,
        created_at: faker.date.past({ years: 3 }),
        profile: {
          create: {
            first_name: firstName,
            last_name: lastName,
            avatar: faker.image.avatar(),
            bio: faker.lorem.paragraphs({ min: 0, max: 5 }),
          },
        },
      },
      include: {
        profile: true,
      },
    });

    users.push(user);
    if (i % 10 === 0) console.log(`Created ${i} users`);
  }

  console.log("Creating posts...");
  const posts = [];

  for (let user of users) {
    const postCount = faker.number.int({ min: 0, max: 10 });

    for (let i = 0; i < postCount; i++) {
      const isPublished = faker.datatype.boolean(0.75);

      const post = await prisma.post.create({
        data: {
          status: isPublished ? PostStatus.PUBLISHED : PostStatus.DRAFT,
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs({ min: 1, max: 8 }),
          created_at: faker.date.recent({ days: 300 }),
          published_at: isPublished ? faker.date.recent({ days: 300 }) : null,
          author_id: user.id,
        },
      });

      posts.push(post);
    }
  }

  console.log("Creating followers and following...");
  // users follow ~30% of others
  for (const follower of users) {
    for (const following of users) {
      if (follower.id !== following.id && faker.datatype.boolean(0.3)) {
        await prisma.follow.create({
          data: {
            follower_id: follower.id,
            following_id: following.id,
          },
        });
      }
    }
  }

  console.log("Creating likes...");
  // users like ~10% of posts
  for (const user of users) {
    for (const post of posts) {
      if (post.author_id !== user.id && faker.datatype.boolean(0.1)) {
        await prisma.like.create({
          data: {
            user_id: user.id,
            post_id: post.id,
            created_at: faker.date.recent({ days: 300 }),
          },
        });
      }
    }
  }

  console.log("Seeding complete!");
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
