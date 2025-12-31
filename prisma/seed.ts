import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma.js";

async function main() {
    const password = await bcrypt.hash("Password@123", 12);

    const users = [
        { email: "siddharth@opsboard.local", name: "Siddharth", password },
        { email: "father@opsboard.local", name: "Father", password },
        { email: "partner1@opsboard.local", name: "Partner 1", password },
        { email: "ops@opsboard.local", name: "Ops Guy", password },
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
