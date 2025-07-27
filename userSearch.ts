import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();

async function main(query: string) {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        {
          username: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          profile: {
            OR: [
              {
                first_name: {
                  contains: query,
                  mode: "insensitive",
                },
                last_name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      ],
    },
    include: {
      profile: true,
    },
  });

  // optional filtering
  const filteredUsers = users.map((user) => {
    if (!user.profile || !user.profile.id) {
      const { id, username } = user;
      return { id, username };
    }
    const {
      id,
      username,
      profile: { id: profile_id, first_name, last_name },
    } = user;
    return { id, username, profile_id, first_name, last_name };
  });

  if (users.length === 0) return console.log("No users found");
  console.log("This is a raw return straight from the query: ", users);
  console.log(
    "After enabling filtering we get significantly less extra information: ",
    filteredUsers,
  );
}

main("jo")
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
