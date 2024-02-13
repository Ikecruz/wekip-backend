import { PrismaClient } from "@prisma/client";

class Prisma {

    private static instance: Prisma;
    private client: PrismaClient;

    private constructor() {
        this.client = new PrismaClient()
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new Prisma();
        }
        return this.instance;
    }

    async connect() {
        await this.client.$connect();
    }

    async disconnect() {
        await this.client.$disconnect()
    }

    getClient() {
        return this.client;
    }

}

export default Prisma.getInstance();