import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],}).$extends(withAccelerate())

async function connectDB(){
    try{
        await prisma.$connect();
        console.log("Database connected successfully");
    }catch(error){
        console.error("Error connecting to database: ", error);
        process.exit(1);
    }
}

export {prisma, connectDB};