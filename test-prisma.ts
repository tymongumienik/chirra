import { PrismaClient } from '@prisma/client';

try {
    const prisma = new PrismaClient();
    console.log('SUCCESS: PrismaClient instantiated successfully.');
    process.exit(0);
} catch (error) {
    console.error('ERROR: Failed to instantiate PrismaClient', error);
    process.exit(1);
}
