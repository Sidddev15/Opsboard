import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma.js";

async function main() {
    const password = await bcrypt.hash("Password@123", 12);

    const users = [
        { email: "siddharth@opsboard.local", name: "Siddharth", password },
        { email: "sandeep@opsboard.local", name: "Sandeep", password },
        { email: "ashok@opsboard.local", name: "Ashok", password },
        { email: "ramakant@opsboard.local", name: "Ramakant", password },
        { email: "sanjaymalik@opsboard.local", name: "Sanjay", password },
    ];

    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: { name: u.name, password: u.password, isActive: true },
            create: u,
        });
    }

    // eslint-disable-next-line no-console
    console.log("Seeded users. Default password: Password@123");
}

main()
    .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e);
        process.exit(1);
    })
    .finally(async () => prisma.$disconnect());
