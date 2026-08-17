import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

const connectDb = async () => {
    try {
        await prisma.$connect();
        console.log("Connected to SQLite DB via Prisma");
    } catch (error) {
        console.error("Database connection error:", error.message);
    }
};

export default connectDb;